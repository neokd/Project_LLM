import React, { useState } from 'react';
import { MdUploadFile, MdMicNone } from 'react-icons/md';
import Modal from './Modal';

function InputField({ inputValue, setInputValue, handleSubmit, onAttachFile}) {

  return (
    <div className='rounded-md lg:mx-24 '>
      <form className="flex justify-center ">
        <label htmlFor="chat-input" className="sr-only">
          Enter your prompt
        </label>
        <div className="absolute bottom-8 lg:w-2/5 w-full ">
          <button
            type="button"
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-600"
          >
            <MdMicNone size={24} />
            <span className="sr-only">Use voice input</span>
          </button>
          <textarea
            id="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="block rounded-xl w-full resize-none border-none bg-slate-100 p-4 pl-10 pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-600 sm:text-base"
            placeholder="Enter your prompt"
            rows="1"
            cols="2"
            required
          ></textarea>
          <button
            type="button"
            onClick={onAttachFile}
            className="absolute inset-y-0 right-20 flex items-center pr-3 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-600"
          >
            <MdUploadFile size={24} />
            <span className="sr-only">Attach file</span>
          </button>
          <button
            onClick={handleSubmit}
            className="absolute bottom-2 right-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-blue-800 focus:outline-none focus:ring-4 ring focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:text-base"
          >
            Send <span className="sr-only hover:visible">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default InputField;
