import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import InputField from './InputField';
import Modal from './Modal';
import { FaUser } from "react-icons/fa";
import owl from '../assets/owl.png';
import bot from '../assets/bot.png';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Markdown from 'react-markdown'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';
import { BiLike, BiDislike } from "react-icons/bi";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import clipboardCopy from 'clipboard-copy';
import { BsClipboard2, BsClipboardCheck } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';


function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modal, setModal] = useState(false);
  const [responses, setResponses] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [botSpeakingIndex, setBotSpeakingIndex] = useState(-1);
  const messagesContainerRef = useRef();
  const [copyToClipBoard, setCopyToClipboard] = useState(false)
  const [copyToClipBoardIndex, setCopyToClipboardIndex] = useState(-1)

  const navigateTo = useNavigate();
  const verify = localStorage.getItem('user_id');

  useEffect(() => {
    const checkUserVerification = async () => {
      if (!verify) {
        // No user ID found, navigate to the home page
        navigateTo('/');
      }
    };

    // Call the function when the component mounts
    checkUserVerification();
  }, []);
  const attachFile = () => {
    setModal(!modal);
  };

  const loadModel = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/load_model");
      const result = await response.json();
      console.log(result);
      setModelLoaded(true);
    } catch (error) {
      console.error("Error loading model:", error);
    }
  };

  useEffect(() => {
    loadModel();
  }, []);

  const parseEventData = (data) => {
    const tokens = data.split('\n')
      .map(line => {
        const tokenMatch = line.match(/{"token":"([^"]+)"}/);
        return tokenMatch ? tokenMatch[1] : null;
      })
      .filter(token => token !== null);

    return tokens.join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponses((prev) => [...prev, { type: 'user', content: inputValue }]);
    setInputValue('');

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputValue }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let lastUserIndex = -1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const decodedValue = decoder.decode(value);
        const parsedData = parseEventData(decodedValue);

        // Accumulate the streamed content
        streamedContent += parsedData;

        // Update the state with responses from the previous stream and the current stream

        setResponses((prev) => {
          const updatedResponses = [...prev];

          // Find the index of the last user message
          lastUserIndex = updatedResponses.reduceRight(
            (index, response, currentIndex) =>
              index === -1 && response.type === 'user' ? currentIndex : index,
            -1
          );

          // If there's a last user message, update the streamed content after it
          if (lastUserIndex !== -1) {
            const existingStreamedIndex = updatedResponses.findIndex(
              (response, index) => index > lastUserIndex && response.type === 'streamed'
            );

            if (existingStreamedIndex !== -1) {
              // Update the existing streamed message with the accumulated content
              updatedResponses[existingStreamedIndex].content = streamedContent;
            } else {
              // Append a new streamed message after the last user message
              updatedResponses.splice(lastUserIndex + 1, 0, {
                type: 'streamed',
                content: llmParser(streamedContent),
              });
            }
          }

          return updatedResponses;
        });

      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Step 2: Scroll to the latest message when messages are updated
    if (messagesContainerRef.current) {
      const lastMessage = messagesContainerRef.current.lastElementChild;

      if (lastMessage) {
        lastMessage.scrollIntoView({
          behavior: 'smooth',
          block: 'center',

        });
      }
    }
  }, [responses]);


  const speak = (text, index) => {
    const utterance = new SpeechSynthesisUtterance(text);
    setBotSpeakingIndex(index);
    setBotSpeaking(true);
    utterance.rate = 0.75;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    // List of all the voices
    // voices.forEach((voice, index) => {
    //   console.log(`Voice ${index + 1}: ${voice.name} (${voice.lang})`);
    // });
    const preferredVoice = voices.find(voice => voice.name === 'Lekha');
    utterance.voice = preferredVoice
    window.speechSynthesis.speak(utterance);
    utterance.onend = () => {
      setBotSpeaking(false);
    };
  };
  const llmParser = (message) => {
    const markdownText = message.trim().replace(/\\n/g, ' ');
    return markdownText;
  };

  const stopSpeech = () => {
    setBotSpeaking(false);
    window.speechSynthesis.cancel();
  };

  const copyToClipboard = (text, index) => {
    setCopyToClipboardIndex(index)
    setCopyToClipboard(true)
    clipboardCopy(text)
      .then(() => console.log('Copied to clipboard'))
      .catch((err) => console.error('Failed to copy to clipboard', err));

    setTimeout(() => {
      setCopyToClipboard(false)
    }, 5000);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-200 dark:bg-[#151626] ">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen(!isSidebarOpen)} />

      {/* Content */}
      <div className={`flex-1 flex flex-col items-center justify-center overflow-hidden transition-all ease-in-out overflow-y-auto ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar />
        <div className="container mx-auto lg:w-3/5 w-full">

          <div className="flex h-[94vh] w-full flex-col">
            {/* Prompt Messages */}
            <div className="flex-1 rounded-xl p-4 leading-6 text-slate-900 dark:text-slate-300 sm:text-base sm:leading-7 pb-32">
              <div className='lg:space-y-8 text-md '>
                {responses.map((response, index) => (
                  <React.Fragment key={index} >
                    {response.type === 'user' && (
                      <div className='flex flex-row px-2 py-4 sm:px-4 dark:bg-[#151626] shadow shadow-slate-400 dark:shadow-slate-700/40 rounded-xl' ref={messagesContainerRef}>
                        <FaUser size={42} className='mr-4 p-2 rounded-full bg-[#5841d9] text-gray-50 dark:bg-white  dark:text-black' />
                        <div className="flex max-w-3xl items-center">
                          <p>{response.content}</p>
                        </div>
                      </div>
                    )}
                    {response.type === 'streamed' && (
                      <div className="mb-2 flex flex-col rounded-xl bg-slate-50 px-2 py-6 dark:bg-[#1c1f37] sm:px-4 border-l-2 border-purple-600" >

                        <div className='flex'>
                          <img
                            className="mr-2 flex h-10 w-10 rounded-full sm:mr-4 dark:bg-[#5841d9]"
                            src={bot}
                            alt="Streamed"
                          />

                          <div className="flex  items-center rounded-xl" ref={messagesContainerRef}>
                            <Markdown className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-dark">
                              {llmParser(response.content)}
                            </Markdown>

                          </div>
                        </div>

                        <div className='flex flex-row justify-end gap-2 mr-2 mt-2'>
                          <button className=''>
                            <BiLike size={16} className='text-slate-900 dark:text-slate-300' />
                          </button>
                          <button className=''>
                            <BiDislike size={16} className='text-slate-900 dark:text-slate-300'/>
                          </button>
                          {
                            copyToClipBoard && copyToClipBoardIndex === index ? <button><BsClipboardCheck className='text-green-500' size={16} /></button> : <button onClick={() => copyToClipboard(llmParser(response.content), index)}> <BsClipboard2 size={16} /> </button>
                          }
                          {
                            (botSpeaking && botSpeakingIndex === index) ? <button className='' onClick={stopSpeech}>
                              <HiOutlineSpeakerXMark size={16} className='text-slate-900 dark:text-slate-300' />
                            </button> : <button className='' onClick={() => speak(llmParser(response.content), index)}>
                              <HiOutlineSpeakerWave size={16} className='text-slate-900 dark:text-slate-300' />
                            </button>
                          }
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

            </div>
          </div>
        </div>
        <InputField inputValue={inputValue} setInputValue={setInputValue} handleSubmit={handleSubmit} onAttachFile={attachFile} />
        {modal && <Modal onClose={attachFile} />}
      </div>
    </div>

  );
}

export default Home;
