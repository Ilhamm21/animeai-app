import React, { useState } from 'react';

const MessageInput = ({ onSend, character }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSend(message); 
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-3 px-4 py-2 select-none"
    >
      <input
        type="text"
        className="flex-1 bg-[#1c1c1c] rounded-lg py-2 px-4 text-gray-400 placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#4b5563]"
        placeholder={`Message ${character?.name || 'AI'}...`}
        aria-label="Message input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      
      <button
        type="submit"
        aria-label="Send message"
        className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white"
      >
        <i className="fas fa-arrow-right"></i>
      </button>
      
    </form>
  );
};

export default MessageInput;
