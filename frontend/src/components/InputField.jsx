import React, { useState } from 'react';
import { MdUploadFile, MdMicNone } from 'react-icons/md';
import { TbSend } from "react-icons/tb";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { PiWaveformBold } from "react-icons/pi";

function InputField({ inputValue, setInputValue, handleSubmit, onAttachFile }) {
  const [isListening, setIsListening] = useState(false);
  const {transcript, browserSupportsSpeechRecognition} = useSpeechRecognition();

  const handleKeyDown = (e) => {  
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  }

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const handleVoiceInput = () => {
    console.log('Is Listening:', isListening);
    console.log('Transcript:', transcript);
  
    setIsListening(!isListening);
  
    if (!isListening) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      console.log('Transcript:', transcript);
    }
  };
  

  return (
    <div className='rounded-md lg:mx-24'>
      <h1 className='text-2xl mb-56 font-bold dark:text-white'>{transcript}</h1>
      <form className="flex justify-center">
        <label htmlFor="chat-input" className="sr-only">
          Enter your prompt
        </label>
        <div className="absolute bottom-8 lg:w-1/2 w-full rounded-lg">
         

          <textarea
            id="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="block rounded-xl w-full resize-none border-none bg-slate-100 p-4 pl-10 pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-[#1c1f37] dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-600 sm:text-base"
            placeholder="Enter your prompt"
            rows="1"
            cols="2"
            required
            onKeyDown={handleKeyDown}
          ></textarea>

          <button
            type="button"
            onClick={onAttachFile}
            className="absolute inset-y-0 right-8 duration-300 flex items-center pr-1 text-slate-800 hover:text-[#5841d9] dark:text-slate-300 border-r-2 my-3 mx-4 border-slate-600"
          >
            <MdUploadFile size={24} />
            <span className="sr-only">Attach file</span>
          </button>

          <button
            onClick={handleSubmit}
            className="absolute bottom-2 right-1 rounded-lg px-4 py-2 text-sm duration-300 font-medium hover:text-[#5841d9] dark:text-slate-300 text-slate-900"
          >
            <TbSend size={24} />
          </button>
          <button
            type="button"
            className="absolute inset-y-0  bottom-2 left-0 rounded-lg px-2 py-4 text-sm duration-300 font-medium hover:text-[#5841d9] dark:text-slate-300 text-slate-900"
            onClick={handleVoiceInput}
          >
            {isListening ? <PiWaveformBold size={24} color='#5841d9' /> : <MdMicNone size={24} />}
            <span className="sr-only">Use voice input</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default InputField;