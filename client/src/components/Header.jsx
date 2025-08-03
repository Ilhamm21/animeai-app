import React from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL;


const Header = ({ character }) => {
  if (!character) return null;


  return (
    <header className="flex items-center space-x-3 border-b border-gray-800 px-6 py-3 select-none flex-shrink-0">
      <img
        src={
          character.image.startsWith('http')
            ? character.image
            : `${BASE_URL}/avatars/${character.image}`
        }
        alt={character.name}
        className="rounded-full"
        width="32"
        height="32"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `/avatars/default.png`;
          e.target.src = `${BASE_URL}/avatars/default.png`;
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
