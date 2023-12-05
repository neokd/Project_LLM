import React from 'react'
import { useState } from 'react'    

function Modal() {
    const [file, setFile] = useState(null); 
    function onClose() {
        setFile(null);
    }
    function handleFilechange(e) {
        console.log(e.target.files[0]);
        setFile(e.target.files[0]);
    }
    function handleUpload(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        fetch("http://localhost:8000/api/upload/user_files", {
            method: "POST",
            body: formData,
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.log(err);
        });    
    }
  return (
    <div className = "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex justify-center items-center ">
        <form className="w-1/2 h-96 rounded-3xl shadow-xl dark:shadow-none flex justify-center flex-col">

        <button
          onClick={onClose}
          className="self-end -top-4 relative  text-gray-100 hover:text-gray-100 rounded-2xl p-4 text-xl bg-blue-600 focus:outline-none"
        >
          X
        </button>
  <label
    htmlFor="file-input"
    className="flex w-full h-96 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 py-16 text-slate-500 hover:bg-slate-200 dark:border-slate-300/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
  >

    <div className="flex flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3 h-16 w-16"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1"
        ></path>
        <path d="M9 15l3 -3l3 3"></path>
        <path d="M12 12l0 9"></path>
      </svg>
      <p className="mb-2 text-sm">
        <span className="font-semibold text-blue-600">Click to browse</span> or drag
        & drop
      </p>
      <p className="text-xs">JPG or PNG only. Max size: 25 MB</p>
    </div>
    <input id="file-input" onChange = {handleFilechange} type="file" className="hidden" />
  </label>
  <button onClick={handleUpload}
  type="submit"
  className="inline-flex items-center w-20 gap-x-2 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-slate-50 hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300"
>
  Submit
</button>
</form>
    </div>
  )
}

export default Modal
