import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaRegFilePdf, FaRegFileWord } from 'react-icons/fa6';
import { IoIosDocument } from 'react-icons/io';

function PromptModal({ onClose }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto modal">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md flex justify-center items-center modal-overlay">
      <div className="bg-white p-8 rounded-lg w-full max-w-3xl flex flex-col">
                  <div className="flex justify-end">
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              <IoMdClose size={24} />
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-4">Custom Instructions</h1>
          <hr className="border-t border-gray-300 my-4" />
          <p className="text-gray-600 mb-4">What information would you like to share with RS to enhance its ability to provide more accurate and relevant responses?</p>
          
          <form>
  <div className="mb-4 w-full max-w-3xl rounded-lg bg-slate-200 dark:bg-slate-900">
    <div
      className="rounded-lg rounded-b-none border border-slate-300 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <label htmlFor="prompt-input" className="sr-only">Enter your prompt</label>
      <textarea
        id="prompt-input"
        rows="4"
        className="w-full border-0 bg-slate-50 px-0 text-base text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
        placeholder="Enter your prompt"
        required
      ></textarea>
    </div>
    <div className="ml-2 flex items-center py-2">
      <div>
        
      </div>
    </div>
  </div>
</form>
<p className="text-gray-600 mb-4">What type of response do you desire from RS?
</p>

<form>
  <div className="mb-4 w-full max-w-3xl rounded-lg bg-slate-200 dark:bg-slate-900">
    <div
      className="rounded-lg rounded-b-none border border-slate-300 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-800"
    >
      <label htmlFor="prompt-input" className="sr-only">Enter your prompt</label>
      <textarea
        id="prompt-input"
        rows="4"
        className="w-full border-0 bg-slate-50 px-0 text-base text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
        placeholder="Enter your prompt"
        required
      ></textarea>
    </div>
    <div className="ml-2 flex items-center py-2">
      <div>
        
        
      </div>
    </div>
  </div>
</form>
<div className="flex justify-end mt-4">
  <button
    type="submit"
    className="inline-flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-base font-medium text-slate-50 hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="inline-flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-base font-medium text-slate-50 hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 ml-2"
  >
    Save
  </button>
</div>

        </div>
      </div>
    </div>
  );
}

export default PromptModal;
