import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import InputField from './InputField';
import Modal from './Modal';
import { FaUser } from "react-icons/fa";
import owl from '../assets/owl.png';
import bot from '../assets/bot.png';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modal, setModal] = useState(false);
  const [responses, setResponses] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const messagesContainerRef = useRef();

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
                content: streamedContent.replace(/\n/g, ' '),
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
            <div className="flex-1 rounded-xl p-4 leading-6 text-slate-900 dark:text-slate-300 sm:text-base sm:leading-7">
              <div className='lg:space-y-8 text-md mb-32'>
                {responses.map((response, index) => (
                  <React.Fragment key={index} >
                    {response.type === 'user' && (
                      <div className='flex flex-row px-2 py-4 sm:px-4' ref={messagesContainerRef}>
                        <FaUser size={42} className='mr-4 p-2 rounded-full bg-[#5841d9] text-gray-50 dark:bg-white  dark:text-black' />
                        <div className="flex max-w-3xl items-center">
                          <p>{response.content}</p>
                        </div>
                      </div>
                    )}
                    {response.type === 'streamed' && (
                      <div className="mb-2 flex rounded-xl bg-slate-50 px-2 py-6 dark:bg-[#1c1f37] sm:px-4" >
                        <img
                          className="mr-2 flex h-10 w-10 rounded-full sm:mr-4 dark:bg-[#5841d9]"
                          src={bot}
                          alt="Streamed"
                        />
                        <div className="flex max-w-3xl items-center rounded-xl" ref={messagesContainerRef}>
                          {response.content.split('\n').map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                              <ReactMarkdown remarkPlugins={[gfm,breaks]} className="text-slate-900 dark:text-slate-300">
                                {line}
                              </ReactMarkdown>
                            </React.Fragment>
                          ))}
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
