import React, { useEffect, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";
import Alert from './Alert';

function Modal({ onClose }) {
  const [files, setFiles] = useState([]);
  const [show, setShow] = useState(true);

  const handleAlert = () => {
    setShow(!show);
  };


  function getFileTypeIcon(fileType) {
    switch (fileType) {
      case 'application/pdf':
        return <FaRegFilePdf size={30} />;
      case 'application/msword':
        return <FaRegFileWord size={30} />;
      default:
        return <IoIosDocument size={30} />;
    }
  }

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  }

  function handleRemoveFile(index) {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  }

  function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    try {
      fetch('http://localhost:8000/api/upload/user_files', {
        method: 'POST',
        body: formData,
      }).then((res) => {
        if (res.ok) {
          onClose();
        }
      });
    }
    catch (error) {
      console.error(error);
    }
    
  }

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
    <div className="absolute inset-0  bg-black bg-opacity-30 backdrop-blur-md flex  justify-center items-center modal-overlay">
      <form
        className="w-2/5 shadow-xl dark:shadow-none flex justify-center items-center flex-col" onSubmit={handleUpload}
      >
        <button
          onClick={onClose}
          className="self-end top-6 left-4 relative rounded-full  text-gray-100 hover:text-gray-100  p-4 text-xl bg-blue-600 focus:outline-none"
        >
          <IoMdClose size={24} />
        </button>

        <section className="rounded-3xl shadow-xl dark:shadow-none mb-4 w-full">
          <label
            htmlFor="file-input"
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 py-16 text-slate-500 hover:bg-slate-200 dark:border-slate-300/20 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-3 h-10 w-10"
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
              <p className="text-xs">PDF, DOCS, </p>
            </div>
            <input id="file-input" type="file" className="hidden" onChange={handleFileChange} multiple />
          </label>
        </section>

        <div className="flex flex-row gap-x-4 items-center justify-center">
          {files.map((file, index) => (
            <div key={file.name} className="flex items-center justify-between dark:bg-gray-700 dark:text-gray-200 p-2 rounded-2xl mb-2">
              <div className="flex items-center mr-2">
                {getFileTypeIcon(file.type)}
              </div>
              <div className="flex items-start justify-start flex-col ">
                <span className="font-semibold text-slate-500 dark:text-gray-200">{file.name}</span>
                <span className="text-xs text-slate-400 dark:text-gray-200 ml-2">{(file.size / 1000 / 1000)} MB</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="ml-2 text-slate-500 hover:text-red-500"
              >
                <IoMdClose size={20} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="rounded-xl bg-blue-700 w-20 py-3 text-sm font-medium text-slate-200 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:text-base"
        >
          Upload
        </button>
      </form>
      {<Alert title="Alert" message="This is an alert" show={show} handleAlert={handleAlert} colorType="success" />}
    </div>
  );
}

export default Modal;
