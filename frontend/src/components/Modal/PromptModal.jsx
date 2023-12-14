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
        <div className="bg-white p-8 rounded-lg">
          <div className="flex justify-end">
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              <IoMdClose size={24} />
            </button>
          </div>
          <h1 className="text-2xl font-bold mb-4">Modal Title</h1>
          <p className="text-gray-600 mb-4">Modal content goes here...</p>
          <div className="flex items-center space-x-2">
            <FaRegFilePdf size={24} />
            <FaRegFileWord size={24} />
            <IoIosDocument size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;
