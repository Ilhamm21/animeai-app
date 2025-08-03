import React from 'react';

const Header = ({ character }) => {
  if (!character) return null;

  const getAvatarSrc = (image) => {
    if (image.startsWith('http')) return image; // dari backend
    if (image.startsWith('/avatars')) return image; // path full dari character.js
    return `/avatars/${image}`; // fallback kalau image cuma nama file
  };


  return (
    <header className="flex items-center space-x-3 border-b border-gray-800 px-6 py-3 select-none flex-shrink-0">
      <img
        src={getAvatarSrc(character.image)}
        alt={character.name}
        className="rounded-full"
        width="32"
        height="32"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `/avatars/default.png`;
        }}
      />



      <div className="flex flex-col leading-tight">
        <span className="text-white font-semibold text-sm">{character.name}</span>
        {character.anime && (
          <span className="text-gray-500 text-xs">Anime: {character.anime}</span>
        )}
      </div>
    </header>
  );
};

export default Header;
