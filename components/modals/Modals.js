// components/modals/Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-xs">
      <div className="bg-white rounded-md  mx-4 relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className=" font-semibold">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 text-xs">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;