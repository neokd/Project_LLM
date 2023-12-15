import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';

function PromptModal({ onClose }) {
  const [prompt, setPrompt] = useState('');
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(prompt);
    const response = await fetch("/api/prompt", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    });
    if (response.ok) {
      onClose();
    } else {
      console.log('Unable to set custom instructions', response.status);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md flex justify-center items-center">
        <div className="flex flex-col ">
          <button
            onClick={onClose}
            className="self-end z-40 top-6 left-4 relative rounded-xl bg-white p-2 duration-200 text-sm font-medium text-slate-900 hover:text-slate-200 hover:bg-[#523dc7] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:hover:bg-[#523dc7] dark:bg-slate-100 dark:focus:ring-blue-800 sm:text-base"
          >
            <IoMdClose size={24} />
          </button>
          <div className="p-6 bg-[#0f162a]/50 dark:bg-slate-950 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-80 w-full max-w-3xl flex flex-col">
            <h1 className="text-2xl font-bold text-white">Custom Instructions</h1>
            <hr className="border-t border-gray-300 my-4" />
            <p className=" mb-4 text-gray-200">
              What information would you like to share with RS to enhance its ability to provide more accurate and relevant responses?
            </p>
            <p className="mb-4 text-gray-200">
              Define how you want RS Bot to behave by providing a set of instructions.
            </p>
            <form className='flex flex-col items-center' onSubmit={handleSubmit}>
              <div className="mb-4 w-full max-w-3xl rounded-lg  dark:bg-slate-900">
                <div className="rounded-lg rounded-b-none border border-slate-300 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <label htmlFor="prompt-input" className="sr-only">Enter your prompt</label>
                  <textarea
                    id="prompt-input"
                    rows="5"
                    className="w-full border-0 px-0 text-lg text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
                    placeholder="Enter your prompt"
                    required
                    onChange={(e) => setPrompt(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-white w-20 duration-200 py-3 text-sm font-medium text-slate-900 hover:text-slate-200 hover:bg-[#523dc7] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:hover:bg-[#523dc7] dark:bg-slate-100 dark:focus:ring-blue-800 sm:text-base"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;
