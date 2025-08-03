import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import Footer from './components/Footer';
import CharacterList from './components/CharacterList';
import CreateCharacter from './components/CreateCharacter';

const BASE_URL = "https://animeai-app-production.up.railway.app"; // ganti dengan URL backend-mu

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

  const handleCharacterSelect = (character) => {
  const isSameCharacter = activeCharacter?.name === character.name;
  const isCustom = character.anime === 'Custom Character' || character.type === 'custom';

  const normalizedCharacter = {
    ...character,
    image: isCustom
      ? character.image // sudah URL lengkap dari backend
      : `/avatars/${character.image}` // untuk karakter default
  };

  if (!isSameCharacter) {
    setActiveCharacter(normalizedCharacter);
    localStorage.setItem('last-character', JSON.stringify(normalizedCharacter));
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
  const imageUrl = newCharacter.avatar
    ? `https://animeai-app-production.up.railway.app/avatars/${newCharacter.avatar}`
    : "/avatars/default.png";

  const characterWithImage = {
    ...newCharacter,
    image: imageUrl,
    type: 'custom',
  };

  setCustomCharacters((prev) => [...prev, characterWithImage]);
  setActiveCharacter(characterWithImage);
  localStorage.setItem("last-character", JSON.stringify(characterWithImage));
  localStorage.setItem("last-used", new Date().toISOString());
  setViewMode("chat");
};


// const handleCreateCharacter = (newCharacter) => {
//   console.log("📦 Data karakter baru:", newCharacter);

//   if (!newCharacter.avatar) {
//     console.error("❌ Avatar karakter tidak ada!");
//     // alert("Karakter berhasil dibuat, tapi gambar avatar gagal dimuat.");
//     return;
//   }

//   const avatarUrl = `${BASE_URL}/avatars/${newCharacter.avatar}`;

//   const characterWithImage = {
//     ...newCharacter,
//     image: avatarUrl,
//     type: 'custom',
//   };

//   console.log("✅ Karakter dengan image lengkap:", characterWithImage);

//   setCustomCharacters((prev) => [...prev, characterWithImage]);
//   setActiveCharacter(characterWithImage);
//   localStorage.setItem("last-character", JSON.stringify(characterWithImage));
//   localStorage.setItem("last-used", new Date().toISOString());
//   setViewMode("chat");
// };


const handleCharacterDeleted = (deletedName) => {
  const updated = customCharacters.filter((char) => char.name !== deletedName);
  setCustomCharacters(updated);
  localStorage.setItem('chat-characters', JSON.stringify(updated));

  // Jika karakter yang dihapus sedang aktif
  if (activeCharacter?.name === deletedName) {
    localStorage.removeItem('last-character');
    localStorage.removeItem('last-used');
    setActiveCharacter(null);
    setViewMode('discover');
  }

  // Hapus histori chat-nya juga
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
            onCharacterDeleted={handleCharacterDeleted} // ✅ Supaya bisa langsung update UI
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
