import React from 'react';
import config from '../config';

const BASE_URL = config.BASE_URL;

const Header = ({ character }) => {
  if (!character) return null;

  const getAvatarUrl = (avatar, type, anime) => {
    if (!avatar) return "/avatars/default.png";

    if (/^https?:\/\//.test(avatar)) return avatar;

    if (type === "custom" || anime === "Custom Character") {
      return `${BASE_URL}/avatars/${avatar.replace(/^\/?avatars\//, "")}`;
    }

    return `/avatars/${avatar.replace(/^\/?avatars\//, "")}`;
  };

  const avatarUrl = getAvatarUrl(character.avatar, character.type, character.anime);

  return (
    <header className="flex items-center space-x-3 border-b border-gray-800 px-6 py-3 select-none flex-shrink-0">
      <img
        src={avatarUrl}
        alt={character.name}
        className="rounded-full w-8 h-8 object-cover"
        width="32"
        height="32"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/avatars/default.png";
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
