import React, { useState, useEffect, useRef } from 'react';
import { MdUploadFile, MdMicNone } from 'react-icons/md';
import { TbSend } from "react-icons/tb";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition, } from 'react-speech-recognition';
import { PiWaveformBold } from "react-icons/pi";
import { MdStopCircle } from "react-icons/md";
import MiniSearch from 'minisearch'

function InputField({ inputValue, setInputValue, handleSubmit, onAttachFile }) {
  const [autoSuggestion, setAutoSuggestion] = useState([])
  const [isListening, setIsListening] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const timeoutId = useRef();

  const fetchSearchData = () => {
    return fetch('/api/suggest').then((res) => res.json()).then((data) => {
      setSearchData(data.message)
    });
  }

  useEffect(() => {
    fetchSearchData();
  }, []);

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

      // Check if the input value is empty before submitting
      if (inputValue?.trim() !== '') {
        handleSubmit(e);
        setAutoSuggestion([]);
        resetTranscript();
      }
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
  };

  const handleLiveTranscript = () => {
    // Only update transcript if it is not empty and user has not started typing
    if (transcript && !inputValue.trim()) {
      setInputValue(transcript);
    }

    // Reset the timeout on every input
    clearTimeout(timeoutId.current);

    // Set a new timeout
    timeoutId.current = setTimeout(() => {
      setIsListening(false);
      SpeechRecognition.stopListening();
    }, 10000);
  };

  const miniSearch = new MiniSearch({
    fields: ['word'],
    storeFields: ['id', 'word'],
    searchOptions: {
      boost: { title: 2 },
      fuzzy: 0.2,
      prefix: true,
      maxSuggestions: 5,
    },
  });

  miniSearch.addAll(searchData);

  const handleSearch = (searchTerm) => {
    // Split the input into words
    const words = searchTerm.split(/\s+/);

    // Get suggestions for the last word
    const lastWord = words[words.length - 1];
    const results = miniSearch.autoSuggest(lastWord, {
      prefix: true,
      fuzzy: 0.2,
      maxSuggestions: 5,
    });

    setAutoSuggestion(results.slice(0, 5));
  };

  const autoSuggestionHandler = (suggestion) => {
    // Split the current input into words
    const words = inputValue.split(/\s+/);
  
    // Replace the last word with the selected suggestion
    words[words.length - 1] = suggestion;
  
    // Join the words back into a string
    const newInputValue = words.join(' ');
  
    // Set the updated input value
    setInputValue(newInputValue);
  };
  

  return (
    <div className='rounded-md lg:mx-24 '>
      <div className="flex  gap-x-2 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 sm:text-sm absolute bottom-24 justify-start items-start ">
        {autoSuggestion.map((item) => (
          <button
            className="rounded-lg bg-slate-900 p-2 hover:bg-[#5741d9] hover:text-slate-200 dark:bg-slate-800 dark:hover:bg-[#5741d9] dark:hover:text-slate-50"
            key={item.id} onClick={() => autoSuggestionHandler(item.suggestion)}
          >
            <span className="text-slate-100 dark:text-slate-200">{item.suggestion}</span>
          </button>
        ))}
      </div>
      <form className="flex justify-center">
        <label htmlFor="chat-input" className="sr-only">
          Enter your prompt
        </label>
        <div className="absolute bottom-8 lg:w-1/2 w-full rounded-lg">
          <textarea
            id="chat-input"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleSearch(e.target.value)
            }}
            className="resize-none block rounded-xl w-full max-h-48 border-none bg-slate-100 p-4 pl-10 pr-20 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-[#1c1f37] dark:text-slate-200 dark:placeholder-slate-400 dark:focus:ring-blue-600 sm:text-base"
            placeholder={transcript || "Enter your prompt"}
            rows="1"
            cols="2"
            required
            onFocus={(e) => {
              handleLiveTranscript()
            }}
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

          {isListening ? <button
            type="button"
            className="animate-wave wave absolute inset-y-0 left-0 rounded-lg px-2 py-4 text-sm duration-300 font-medium hover:text-slate-200 dark:text-slate-300 text-slate-900"
            onClick={handleVoiceInput}
          > <PiWaveformBold size={26} /> </button> : <button
            type="button"
            className="absolute inset-y-0  bottom-2 left-0 rounded-lg px-2 py-4 text-sm duration-300 font-medium hover:text-[#5841d9] dark:text-slate-300 text-slate-900"
            onClick={handleVoiceInput}
          ><MdMicNone size={24} /> </button>}
          <span className="sr-only">Use voice input</span>

        </div>
      </form>
    </div>
  );
}

export default InputField;
