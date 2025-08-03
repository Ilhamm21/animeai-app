import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { characters as defaultCharacters } from './characters';
const BASE_URL = import.meta.env.VITE_BASE_URL;



const CharacterList = ({ onSelectCharacter, onCharacterDeleted }) => {
  const [customCharacters, setCustomCharacters] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState('All');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = () => {
    axios.get(`${BASE_URL}/characters`)
      .then((res) => {
        const custom = res.data.custom.map(char => ({
          name: char.name,
          anime: 'Custom Character',
          description: 'Karakter buatan user.',
          image: char.avatar
            ? `${BASE_URL}/avatars/${char.avatar}`
            : `${BASE_URL}/avatars/default.png`,

        }));

        setCustomCharacters(custom);
      })

      .catch((err) => {
        console.error('Gagal mengambil karakter:', err);
      });
  };

  const handleDelete = (name) => {
    if (window.confirm(`Hapus karakter "${name}"?`)) {
      axios.delete(`${BASE_URL}/character/${encodeURIComponent(name)}`)
        .then(() => {
          setCustomCharacters(prev => prev.filter(c => c.name !== name));
          onCharacterDeleted && onCharacterDeleted(name); // Hapus dari localStorage + sidebar
        })
        .catch((err) => {
          console.error('Gagal menghapus karakter:', err);
          alert('Gagal menghapus karakter.');
        });
    }
  };

  const combinedCharacters = [...customCharacters, ...defaultCharacters];

  const animeList = ['All', ...new Set(combinedCharacters.map(char => char.anime))];

  const filteredCharacters =
    selectedAnime === 'All'
      ? combinedCharacters
      : combinedCharacters.filter(char => char.anime === selectedAnime);

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex flex-wrap gap-2 mb-6">
        {animeList.map((anime, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedAnime === anime ? 'bg-[#4b5563]' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
              }`}
            onClick={() => setSelectedAnime(anime)}
          >
            {anime}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCharacters.map((char, idx) => (
          <div
            key={idx}
            className="bg-[#1e1e1e] rounded-xl p-4 hover:bg-[#2a2a2a] transition-all duration-200 cursor-pointer relative"
            onClick={() => onSelectCharacter(char)}
          >
            <div className="flex space-x-4">
              <img
                src={char.image}
                alt={char.name}
                className="w-20 h-24 rounded-xl object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/avatars/default.png`;
                }}
              />

              <div className="flex flex-col justify-between max-w-[180px]">
                <div>
                  <p className="text-lg font-bold">{char.name}</p>
                  <p className="text-sm text-gray-400">Anime: {char.anime}</p>
                </div>
                <p className="text-sm text-gray-300 mt-2 break-words line-clamp-3">{char.description}</p>
              </div>
            </div>

            {char.anime === 'Custom Character' && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Biar gak trigger select
                  handleDelete(char.name);
                }}
                className="absolute top-2 right-2 text-red-400 hover:text-red-500 text-xs"
                title="Hapus karakter"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            )}
          </div>
        ))}

        {filteredCharacters.length === 0 && (
          <div className="text-gray-400 text-sm col-span-full text-center">
            Tidak ada karakter di anime ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterList;
