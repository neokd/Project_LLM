import React, { useState, useEffect, useRef } from 'react';
import { MdUploadFile, MdMicNone } from 'react-icons/md';
import { TbSend } from "react-icons/tb";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition, } from 'react-speech-recognition';
import { PiWaveformBold } from "react-icons/pi";
import { MdStopCircle } from "react-icons/md";

function InputField({ inputValue, setInputValue, handleSubmit, onAttachFile,}) {
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const timeoutId = useRef();

  useEffect(() => {
    // Reset the transcript and start listening when isListening becomes true
    if (isListening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      // Set a timeout to stop listening after 10 seconds of silence
      timeoutId.current = setTimeout(() => {
        setIsListening(false);
        SpeechRecognition.stopListening();
      }, 10000);
    } else {
      // Clear the timeout when isListening becomes false
      clearTimeout(timeoutId.current);
      SpeechRecognition.stopListening();
    }

    // Clean up the timeout on component unmount
    return () => clearTimeout(timeoutId.current);
  }, [isListening, resetTranscript]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
      // Reset transcript when the input is sent
      resetTranscript();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
  };

  const handleLiveTranscript = () => {
    setInputValue(transcript);
    // Reset the timeout on every input
    clearTimeout(timeoutId.current);
    // Set a new timeout
    timeoutId.current = setTimeout(() => {
      setIsListening(false);
      SpeechRecognition.stopListening();
    }, 10000);
  };


  return (
    <div className='rounded-md lg:mx-24 '>
      
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
            placeholder={transcript || "Enter your prompt"}
            rows="1"
            cols="2"
            required
            onFocus={handleLiveTranscript}
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