import React, { useEffect, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import InputField from './InputField';
import Modal from './Modal';


function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modal, setModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

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

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    messages.push({ message: inputValue, sender: "user" });
    setMessages(messages);
    let data;

    try {
      const response = await fetchEventSource("/api/llama", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ question: inputValue }),

        onmessage(event) {
          // console.log(event.data);
          data = JSON.parse(event.data);

          if (data["finish_resason"] === "length" || data["finish_reason"] === "stop") {
            console.log("Connection closed");
            return;
          } else {
            // Use setStreamData to update the state correctly
            setStreamData((prevData) => [...prevData, data]);

          }
        }
      })
      setInputValue("");

    }
    catch (error) {
      console.log(error);
    }


    return (e) => {
      onclose(e)
    }
  };
  const [streamData, setStreamData] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/chat');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update the state with the new token
      setStreamData((prevData) => [...prevData, data.token]);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      // Close the EventSource connection when the component unmounts
      eventSource.close();
    };
  }, []); 



  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-200 dark:bg-slate-800 overflow-y-auto">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Content */}
      <div className={`flex-1 flex flex-col items-center justify-center overflow-hidden transition-all ease-in-out overflow-y-auto ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar />
        <div className="container mx-auto lg:w-2/5 w-full ">

          <div className="flex h-[96vh] flex-col ">
            <div
              className="flex-1   rounded-xl bg-slate-200 lg:p-4 text-sm leading-6 text-slate-900 dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7"
            >

              <div className="flex flex-col h-[90%] mt-12 lg:mt-0  ">
                {messages.map((message, index) => (
                  <div key={index} className="flex flex-row px-2 py-4 sm:px-4 ">
                    {
                      message.sender === "user" ? (
                        <div className="flex flex-row px-2 py-4 sm:px-4">
                          <img
                            className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                            src="https://dummyimage.com/256x256/363536/ffffff&text=U"
                          />

                          <div className="flex max-w-3xl items-center">
                            <p>{message.message}</p>
                          </div>
                        </div>
                      ) : (
                        null
                      )
                    }
                     <ul>
        {streamData.map((token, index) => (
          <li key={index}>{token}</li>
        ))}
      </ul>
                  </div>
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
