import React, { useEffect, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";
import Alert from './Alert';

function Modal({ onClose }) {
  const [files, setFiles] = useState([]);

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

  async function handleUpload(e) {
    e.preventDefault();

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });
    formData.append('username',localStorage.getItem('username'))
    try {
      const response = await fetch('http://localhost:8000/api/upload/user_files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // File upload successful
        onClose();
      } else {
        console.log('File upload failed:', response.status);
      }
    } catch (error) {
      console.error('File upload error:', error);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto modal">
      <div className="absolute inset-0  bg-black bg-opacity-30 backdrop-blur-md flex  justify-center items-center modal-overlay">
        <form
          className="w-2/5  flex justify-center items-center flex-col" onSubmit={handleUpload}
        >
          <button
            onClick={onClose}
            className="self-end top-6 left-4 relative rounded-xl bg-white p-2 duration-200  text-sm font-medium text-slate-900 hover:text-slate-200 hover:bg-[#523dc7] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:hover:bg-[#523dc7] dark:bg-slate-100 dark:focus:ring-blue-800 sm:text-base"
          >
            <IoMdClose size={24} />
          </button>

          <section className="rounded-3xl mb-4 w-full">
            <label
              htmlFor="file-input"
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 py-16 text-slate-500 hover:bg-slate-200 dark:border-slate-300/20 duration-200 dark:bg-[#523dc7] dark:hover:bg-violet-600 dark:text-slate-200 dark "
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
                  <span className="font-semibold text-slate-100">Click to browse</span> or drag
                  & drop
                </p>
                <p className="text-xs">PDF, DOCS, </p>
              </div>
              <input id="file-input" type="file" className="hidden" onChange={handleFileChange} multiple />
            </label>
          </section>

          <div className="flex flex-row gap-x-4 items-center justify-center">
            {files.map((file, index) => (
              <div key={file.name} className="flex items-center bg-[#1c1f37] justify-between dark:bg-transparent dark:border-[#553fd0] dark:border-2 dark:text-gray-200 p-2 rounded-2xl mb-4 duration-300 ">
                <div className="flex items-center mr-2 text-white">
                  {getFileTypeIcon(file.type)}
                </div>
                <div className="flex items-start justify-start flex-col ">
                  <span className="font-semibold text-slate-100 dark:text-gray-200">{file.name}</span>
                  <span className="text-xs text-slate-100 dark:text-gray-200 ml-2">{(file.size / 1000 / 1000)} MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 text-slate-500 hover:text-red-500 dark:hover:text-red-500 "
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-white w-20 duration-200 py-3 text-sm font-medium text-slate-900 hover:text-slate-200 hover:bg-[#523dc7] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:hover:bg-[#523dc7] dark:bg-slate-100 dark:focus:ring-blue-800 sm:text-base"
          >
            Upload
          </button>
        </form>

      </div>
      {/* {<Alert title="Alert" message="This is an alert" show={show} handleAlert={handleAlert} colorType="success" />} */}
    </div>
  );
}

export default Modal;
