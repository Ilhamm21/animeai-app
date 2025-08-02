import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import Footer from './components/Footer';
import CharacterList from './components/CharacterList';
import CreateCharacter from './components/CreateCharacter';

const App = () => {
  const savedCharacter = localStorage.getItem('last-character');
  const [activeCharacter, setActiveCharacter] = useState(
    savedCharacter ? JSON.parse(savedCharacter) : null
  );
  const [viewMode, setViewMode] = useState(savedCharacter ? 'chat' : 'discover');

  const [customCharacters, setCustomCharacters] = useState(() => {
    const stored = localStorage.getItem('chat-characters');
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Fungsi untuk menghasilkan URL avatar yang benar
  const getAvatarUrl = (character) => {
    if (character.type === 'custom') {
      // Jika sudah URL lengkap
      if (character.avatar.startsWith('http')) {
        return character.avatar;
      }
      // Jika hanya path dari backend
      return `https://animeai-app-production.up.railway.app/${character.avatar}`;
    } else {
      // Karakter default
      return `/avatars/${character.name.toLowerCase().replace(/ /g, "_")}.png`;
    }
  };

  const handleCharacterSelect = (character) => {
    const isSameCharacter = activeCharacter?.name === character.name;

    const avatarUrl = getAvatarUrl(character);
    const characterData = {
      ...character,
      image: avatarUrl,
    };

    if (!isSameCharacter) {
      setActiveCharacter(characterData);
      localStorage.setItem('last-character', JSON.stringify(characterData));
      localStorage.setItem('last-used', new Date().toISOString());
    }

    setViewMode('chat');
  };

  const handleClearChat = (characterName) => {
    const name = characterName || activeCharacter?.name;
    if (name) {
      const characterKey = `chat-history-${name}`;
      localStorage.removeItem(characterKey);
    }

    localStorage.removeItem('last-character');
    localStorage.removeItem('last-used');
    setActiveCharacter(null);
    setViewMode('discover');
  };

  const handleCreateCharacter = (newCharacter) => {
    const avatarUrl = newCharacter.avatar.startsWith('http')
      ? newCharacter.avatar
      : `https://animeai-app-production.up.railway.app/${newCharacter.avatar}`;

    const characterWithImage = {
      ...newCharacter,
      image: avatarUrl,
    };

    setCustomCharacters((prev) => [...prev, characterWithImage]);
    setActiveCharacter(characterWithImage);
    localStorage.setItem("last-character", JSON.stringify(characterWithImage));
    localStorage.setItem("last-used", new Date().toISOString());
    setViewMode("chat");
  };

  const handleCharacterDeleted = (deletedName) => {
    const updated = customCharacters.filter((char) => char.name !== deletedName);
    setCustomCharacters(updated);
    localStorage.setItem('chat-characters', JSON.stringify(updated));

    if (activeCharacter?.name === deletedName) {
      localStorage.removeItem('last-character');
      localStorage.removeItem('last-used');
      setActiveCharacter(null);
      setViewMode('discover');
    }

    localStorage.removeItem(`chat-history-${deletedName}`);
  };

  return (
    <div className="bg-[#121212] text-white font-sans min-h-screen flex flex h-screen">
      <Sidebar
        onDiscoverClick={() => setViewMode('discover')}
        onCreateClick={() => setViewMode('create')}
        onClearChat={handleClearChat}
        activeCharacter={activeCharacter}
        onCharacterSelect={handleCharacterSelect}
        customCharacters={customCharacters}
      />
      <main className="flex flex-col h-screen flex-1 bg-[#121212]">
        {viewMode === 'chat' && activeCharacter && (
          <Header character={activeCharacter} />
        )}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'chat' && activeCharacter && (
            <ChatBox character={activeCharacter} />
          )}

          {viewMode === 'discover' && (
            <CharacterList
              onSelectCharacter={handleCharacterSelect}
              onCharacterDeleted={handleCharacterDeleted}
              customCharacters={customCharacters}
            />
          )}

          {viewMode === 'create' && (
            <CreateCharacter onCreated={handleCreateCharacter} />
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default App;
