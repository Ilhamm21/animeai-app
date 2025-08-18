import React, { useState, useEffect, useRef } from 'react';
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from 'react-icons/io';
import config from '../config';

const BASE_URL = config.BASE_URL;

const Sidebar = ({ onClearChat, onDiscoverClick, onCreateClick, activeCharacter, onCharacterSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastUsed, setLastUsed] = useState('');
  const [chatCharacters, setChatCharacters] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dropdownRef = useRef();

  

  // Fungsi untuk sync daftar karakter dari localStorage
  const syncChatCharacters = () => {
    const saved = localStorage.getItem('chat-characters');
    if (saved) {
      try {
        setChatCharacters(JSON.parse(saved));
      } catch {
        setChatCharacters([]);
      }
    } else {
      setChatCharacters([]);
    }
  };

  // Initial load & sync jika localStorage berubah (misalnya dari App.jsx)
  useEffect(() => {
    syncChatCharacters();

    const handleStorageChange = (e) => {
      if (e.key === 'chat-characters') {
        syncChatCharacters();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update last used & daftar karakter kalau activeCharacter berubah
  useEffect(() => {
    if (activeCharacter) {
      setLastUsed(new Date().toLocaleString());

      const existing = JSON.parse(localStorage.getItem('chat-characters')) || [];
      const alreadyExists = existing.some(c => c.name === activeCharacter.name);

      if (!alreadyExists) {
        const updated = [...existing, activeCharacter];
        localStorage.setItem('chat-characters', JSON.stringify(updated));
        setChatCharacters(updated); // langsung update state
      }
    }
  }, [activeCharacter]);

  useEffect(() => {
    const saved = localStorage.getItem('last-used');
    if (saved) setLastUsed(new Date(saved).toLocaleString());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteChat = async (char) => {
    const confirmDelete = window.confirm(`Hapus semua chat dengan ${char.name}?`);
    if (!confirmDelete) return;

    const updated = chatCharacters.filter((c) => c.name !== char.name);
    localStorage.setItem('chat-characters', JSON.stringify(updated));
    setChatCharacters(updated);

    const guestId = localStorage.getItem('guest_id');
    if (guestId) {
      try {
        await fetch(`${BASE_URL}/history/${guestId}/${encodeURIComponent(char.name)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Gagal menghapus history dari database:', error);
      }
    }

    if (activeCharacter?.name === char.name) {
      localStorage.removeItem('last-character');
      localStorage.removeItem('last-used');
      onClearChat(char.name);
    }
  };

  return (
    <>
      {/* Toggle button hanya tampil di mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed top-1/2 z-50 -translate-y-1/2 bg-[#1c1c1c] text-white p-3 rounded-r-xl shadow-lg backdrop-blur-sm hover:bg-[#1c1c1c] transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-0'
          }`}
      >
        {isSidebarOpen ? <IoIosArrowDroprightCircle size={28} /> : <IoIosArrowDropleftCircle size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 bg-[#1c1c1c] text-white w-64 h-full transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex flex-col px-4 py-6 select-none`}
      >
        <div className="flex items-center space-x-1 mb-6">
          <span className="text-white font-extrabold text-lg cursor-default">AnimeAI</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onCreateClick();
            setIsSidebarOpen(false);
          }}
          className="flex items-center space-x-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-md px-3 py-2 text-white text-sm font-semibold mb-6 w-full"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Add Character</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onDiscoverClick();
            setIsSidebarOpen(false);
          }}
          className="flex items-center space-x-2 text-gray-300 hover:text-white mb-6 text-sm font-semibold"
        >
          <i className="fas fa-compass text-sm"></i>
          <span>Discover</span>
        </button>

        <div className="text-[10px] text-gray-500 mb-2 select-text">
          A While Ago {lastUsed && `(${lastUsed})`}
        </div>

        {chatCharacters.length > 0 && (
          <div className="mb-4 overflow-y-auto max-h-[250px] pr-1">
            <div className="space-y-2">
              {chatCharacters.map((char, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${activeCharacter?.name === char.name ? 'bg-[#3a3a3a]' : 'bg-[#2a2a2a]'
                    } hover:bg-[#3a3a3a]`}
                  onClick={() => {
                    if (activeCharacter?.name !== char.name) {
                      localStorage.setItem('last-character', JSON.stringify(char));
                      localStorage.setItem('last-used', new Date().toISOString());
                      onCharacterSelect(char);
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={
                        !char.avatar
                          ? "/avatars/default.png"
                          : char.avatar.startsWith("http")
                            ? char.avatar
                            : (() => {
                              const cleanName = char.avatar.replace(/^\/?avatars\//, "");
                              return char.type === "custom" || char.anime === "Custom Character"
                                ? `${BASE_URL}/avatars/${cleanName}`
                                : `/avatars/${cleanName}`;
                            })()
                      }
                      alt={char.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/avatars/default.png";
                      }}
                    />
                    <span className="truncate text-white text-sm">{char.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(char);
                    }}
                    className="text-red-400 hover:text-red-500 text-xs"
                    title="Hapus chat"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto text-[10px] text-gray-500 space-x-1 select-text">
          <a className="hover:underline">Privacy Policy</a>
          <span>•</span>
          <a className="hover:underline">Terms of Service</a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
