import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import config from '../config'; // ✅ Import config.js

const BASE_URL = config.BASE_URL;



function ChatBox({ character }) {
  const [messages, setMessages] = useState([]);
  const [emotion, setEmotion] = useState('neutral');
  const [isTyping, setIsTyping] = useState(false); // Tambahkan state isTyping
  const scrollRef = useRef(null);

  const getGuestId = () => {
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('guest_id', id);
    }
    return id;
  };

  const guestId = getGuestId();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/history/${guestId}/${encodeURIComponent(character.name)}`);
        const history = res.data.history || [];

        if (history.length === 0) {
          setMessages([{ from: 'bot', text: character.greeting, emotion: 'neutral' }]);
        } else {
          const formatted = history.flatMap(chat => [
            { from: 'user', text: chat.user_message },
            { from: 'bot', text: chat.bot_reply, emotion: chat.bot_emotion || 'neutral' }
          ]);
          setMessages(formatted);
        }

      } catch (error) {
        console.error('Gagal mengambil riwayat chat:', error);
      }
    };

    if (character?.name) {
      fetchHistory();
    }
  }, [character?.name]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: 'user', text }]);
    setIsTyping(true); // Mulai efek mengetik

    try {
      const res = await axios.post(`${BASE_URL}/chat`, {
        user_id: guestId,
        character: character.name,
        message: text,
      });

      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: res.data.reply, emotion: res.data.emotion || 'neutral' },
      ]);

      setEmotion(res.data.emotion || 'neutral');
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
    } finally {
      setIsTyping(false); // Hentikan efek mengetik
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full overflow-hidden" ref={scrollRef}>
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          activeCharacter={character}
        />
      </div>
      <div className="border-t border-gray-700 p-4 bg-[#121212]">
        <MessageInput onSend={handleSendMessage} character={character} />
      </div>
    </div>
  );
}

export default ChatBox;
