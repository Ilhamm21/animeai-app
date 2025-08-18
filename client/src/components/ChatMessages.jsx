import React from 'react';
import { Typewriter } from 'react-simple-typewriter';

const ChatMessages = ({ messages = [], isTyping, activeCharacter }) => {
  return (
    <section
      aria-label="Chat messages"
      className="px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {/* Avatar disembunyikan */}
          {false && msg.from === 'bot' && (
            <div className="flex-shrink-0 flex flex-col items-center mr-2">
              <img
                src={activeCharacter?.image || '/default-avatar.png'}
                alt={activeCharacter?.name || 'AI Persona'}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          )}

          <div>
            {/* Nama bot disembunyikan */}
            {false && msg.from === 'bot' && (
              <p className="text-sm text-gray-400 font-semibold mb-1">
                {activeCharacter?.name || 'AI Persona'}
              </p>
            )}
            <div
              className={`p-2 rounded-lg max-w-lg ${
                msg.from === 'user'
                  ? 'bg-[#242529] ml-auto'
                  : 'bg-[#242529] mr-auto'
              }`}
            >
              {msg.from === 'bot' && index === messages.length - 1 && isTyping === false ? (
                <Typewriter words={[msg.text]} typeSpeed={5} />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start animate-pulse">
          {/* Avatar mengetik disembunyikan */}
          {false && (
            <div className="flex-shrink-0 flex flex-col items-center mr-2">
              <img
                src={activeCharacter?.image || '/default-avatar.png'}
                alt={activeCharacter?.name || 'AI Persona'}
                className="w-10 h-10 rounded-full border border-gray-500 object-cover"
              />
            </div>
          )}
          <div>
            {/* Nama mengetik disembunyikan */}
            {false && (
              <p className="text-sm text-gray-400 font-semibold mb-1">
                {activeCharacter?.name || 'AI Persona'}
              </p>
            )}
            <div className="p-2 rounded-lg max-w-lg bg-[#242529] mr-auto">
              <p className="text-gray-400 italic">AI sedang mengetik...</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChatMessages;
