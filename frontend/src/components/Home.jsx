import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { MdUploadFile, MdMicNone } from 'react-icons/md';
import InputField from './InputField';
import Modal from './Modal';
import Alert from './Alert';

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
    console.log(inputValue);
    messages.push({ message: inputValue, sender: "user" });
    setMessages(messages);
    setInputValue("");
    try {
      messages.push({ message: "Certainly! Quantum computing is a new type of computing that relies on the principles of quantum physics. Traditional computers, like the one you might be using right now, use bits to store and process information. These bits can represent either a 0 or a 1. In contrast, quantum computers use quantum bits, or qubits.Unlike bits, qubits can represent not only a 0 or a 1 but also a superposition of both states simultaneously. This means that a qubit can be in multiple states at once, which allows quantum computers to perform certain calculations much faster and more efficiently.", sender: "bot" });
      setMessages(messages);
      // const response = await fetch("/api/ask", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ message: inputValue }),
      // });

    }
    catch (error) {
      console.error("Error:", error);
    }


  }

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
                        <div>
                          <div className="mb-2 flex w-full flex-row justify-end gap-x-2 text-slate-500">
                            <button className="hover:text-blue-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path
                                  d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"
                                ></path>
                              </svg>
                            </button>
                            <button className="hover:text-blue-600" type="button">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path
                                  d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3"
                                ></path>
                              </svg>
                            </button>
                            <button className="hover:text-blue-600" type="button">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path
                                  d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"
                                ></path>
                                <path
                                  d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"
                                ></path>
                              </svg>
                            </button>
                          </div>
                          <div
                            className="mb-4 flex rounded-xl bg-slate-50 px-2 py-6 dark:bg-slate-900 sm:px-4"
                          >
                            <img
                              className="mr-2 flex h-8 w-8 rounded-full sm:mr-4"
                              src="https://dummyimage.com/256x256/354ea1/ffffff&text=G"
                            />

                            <div className="flex max-w-3xl items-center rounded-xl">
                              <p>
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }

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
