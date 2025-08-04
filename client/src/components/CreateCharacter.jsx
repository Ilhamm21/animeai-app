import React, { useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;


const CreateCharacter = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [creator, setCreator] = useState("");
  const [personality, setPersonality] = useState("");
  const [speechStyle, setSpeechStyle] = useState("");
  const [greeting, setGreeting] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!name || !personality || !speechStyle || !greeting || !avatar) {
      alert("Semua field wajib diisi kecuali kreator!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("creator", creator || "Anonim");
    formData.append("personality", personality);
    formData.append("speechStyle", speechStyle);
    formData.append("greeting", greeting);
    formData.append("avatar", avatar);

    try {
      await axios.post(`${BASE_URL}/create-character`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("newCharacter:", S); // ⬅️ Tambahkan ini
      const newCharacter = {
        name,
        anime: "Custom Character",
        description: "Karakter buatan user.",
        greeting,
        type: "custom",
        avatar: `${name.toLowerCase().replace(/ /g, "_")}.${avatar.name.split(".").pop().toLowerCase()}`, // Simpan nama file sesuai format
      };

      onCreated(newCharacter);
    } catch (err) {
      console.error("❌ Gagal membuat karakter:", err);
      alert("Gagal membuat karakter");
    }

    // Reset form
    setName("");
    setCreator("");
    setPersonality("");
    setSpeechStyle("");
    setGreeting("");
    setAvatar(null);
    setPreview(null);
  };

  return (
    <div className="w-full px-4 py-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#1f1f1f] rounded-xl p-6 text-white shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Buat Karakter Baru</h2>

        {/* Upload Avatar */}
        <div className="mb-4">
          <label className="font-medium">Avatar</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 w-full" />
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
        </div>

        {/* Creator */}
        <div className="mb-4">
          <label className="text-sm">Kreator (Opsional)</label>
          <input
            type="text"
            maxLength={30}
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="Anonim"
            className="w-full p-3 mt-1 rounded-xl bg-[#18181B] border border-gray-600 text-sm"
          />
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
