import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {/* ✅ Scrollable content */}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Modal;