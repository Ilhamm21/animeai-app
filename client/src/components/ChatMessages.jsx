import React from 'react';
import { Typewriter } from 'react-simple-typewriter';

const ChatMessages = ({ messages = [], isTyping }) => {
  return (
    <section
      aria-label="Chat messages"
      className="px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 rounded-lg max-w-lg ${
            msg.from === 'user' ? 'bg-[#242529] self-end ml-auto' : 'bg-[#242529] self-start mr-auto'
          }`}
        >
          {msg.from === 'bot' && index === messages.length - 1 && isTyping === false ? (
            <Typewriter
              words={[msg.text]}
              typeSpeed={5} 
            />
          ) : (
            <p>{msg.text}</p>
          )}
        </div>
      ))}
      {isTyping && (
        <div className="p-2 rounded-lg max-w-lg bg-[#242529] self-start mr-auto animate-pulse">
          <p className="text-gray-400 italic">AI sedang mengetik...</p>
        </div>
      )}
    </section>
  );
};

export default ChatMessages;
