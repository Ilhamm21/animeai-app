import React, { useState } from "react";
import axios from "axios";
import config from '../config'; // ✅ Import config.js

const BASE_URL = config.BASE_URL;

const CreateCharacter = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [anime, setAnime] = useState("");
  const [personality, setPersonality] = useState("");
  const [speechStyle, setSpeechStyle] = useState("");
  const [greeting, setGreeting] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Nama karakter wajib diisi";
    if (!anime.trim()) newErrors.anime = "Anime wajib diisi";
    if (anime.trim().toLowerCase() === "custom character") newErrors.anime = "Anime tidak boleh 'Custom Character'";
    if (!personality.trim()) newErrors.personality = "Kepribadian wajib diisi";
    if (!speechStyle.trim()) newErrors.speechStyle = "Gaya bicara wajib diisi";
    if (!greeting.trim()) newErrors.greeting = "Greeting wajib diisi";
    if (!avatar) newErrors.avatar = "Avatar wajib diupload";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("anime", anime.trim());
    formData.append("personality", personality.trim());
    formData.append("speechStyle", speechStyle.trim());
    formData.append("greeting", greeting.trim());
    formData.append("avatar", avatar);

    try {
      await axios.post(`${BASE_URL}/create-character`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newCharacter = {
        name: name.trim(),
        anime: anime.trim(),
        description: personality.trim(),
        greeting: greeting.trim(),
        type: "custom",
        avatar: `${name.trim().toLowerCase().replace(/ /g, "_")}.${avatar.name.split(".").pop().toLowerCase()}`,
      };

      onCreated(newCharacter);

      // Reset form setelah berhasil submit
      setName("");
      setAnime("");
      setPersonality("");
      setSpeechStyle("");
      setGreeting("");
      setAvatar(null);
      setPreview(null);
      setErrors({});
    } catch (err) {
      console.error("❌ Gagal membuat karakter:", err);
      alert("Gagal membuat karakter");
    }
  };

  return (
    <div className="w-full px-4 py-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#1f1f1f] rounded-xl p-6 text-white shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Tambah Karakter</h2>

        {/* Upload Avatar */}
        <div className="mb-4">
          <label className="font-medium">Avatar</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 w-full" />
          {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 w-24 h-24 object-cover rounded-full border border-gray-500"
            />
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-sm">Nama Karakter</label>
          <input
            type="text"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Sasuke Uchiha"
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Anime */}
        <div className="mb-4">
          <label className="text-sm">Anime</label>
          <input
            type="text"
            maxLength={30}
            value={anime}
            onChange={(e) => setAnime(e.target.value)}
            placeholder="Contoh: Naruto"
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm"
          />
          {errors.anime && <p className="text-red-500 text-sm mt-1">{errors.anime}</p>}
        </div>

        {/* Personality */}
        <div className="mb-4">
          <label className="text-sm">Kepribadian Karakter</label>
          <textarea
            maxLength={500}
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="Contoh: Pendiam, tegas, selalu serius..."
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm resize-none h-24"
          />
          {errors.personality && <p className="text-red-500 text-sm mt-1">{errors.personality}</p>}
        </div>

        {/* Speech Style */}
        <div className="mb-4">
          <label className="text-sm">Gaya Bicara</label>
          <textarea
            maxLength={500}
            value={speechStyle}
            onChange={(e) => setSpeechStyle(e.target.value)}
            placeholder="Contoh: Bicara singkat, nada serius, kadang sinis..."
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm resize-none h-24"
          />
          {errors.speechStyle && <p className="text-red-500 text-sm mt-1">{errors.speechStyle}</p>}
        </div>

        {/* Greeting */}
        <div className="mb-4">
          <label className="text-sm">Greeting Awal</label>
          <textarea
            maxLength={300}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Contoh: Halo, aku Kirito. Ada yang bisa kubantu?"
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm resize-none h-20"
          />
          {errors.greeting && <p className="text-red-500 text-sm mt-1">{errors.greeting}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full text-center font-medium bg-[#89898A] hover:bg-white transition-all p-3 rounded-xl mt-4 text-[#18181B]"
        >
          Buat Karakter
        </button>
      </form>
    </div>
  );
};

export default CreateCharacter;
