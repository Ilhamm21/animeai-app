from flask import Flask, request, jsonify
from openai import OpenAI  
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import json
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask import send_from_directory

load_dotenv()

app = Flask(__name__)
CORS(app)

if not os.path.exists('avatars'):
    os.makedirs('avatars')

print("✅ Flask app starting...")

@app.route("/")
def hello():
    return "Hello from Flask + Railway!"

# Koneksi ke MongoDB
# Koneksi ke MongoDB (tambahkan pengecekan)
mongodb_uri = os.getenv("MONGODB_URI")
if not mongodb_uri:
    raise ValueError("MONGODB_URI is not set in environment variables")

client_db = MongoClient(mongodb_uri)
db = client_db.ai_chatbot  # Nama database
chats_collection = db.chats  # Koleksi chat

import os
if not os.path.exists("./avatars"):
    os.makedirs("./avatars")

# API Key untuk OpenAI
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")

client = OpenAI(
    base_url="https://api.openai.com/v1",
    api_key=openai_key
)

print("OPENAI:", os.getenv("OPENAI_API_KEY"))
print("MONGODB:", os.getenv("MONGODB_URI"))


# Baca karakter dari JSON
with open("characters.json", "r", encoding="utf-8") as f:
    characters = json.load(f)

# Baca notes karakter (optional, kalau mau digabungkan nanti)
with open("characters_notes.txt", "r", encoding="utf-8") as f:
    characters_notes = f.read().strip()


# Fungsi untuk menyimpan chat ke MongoDB
def save_chat(user_id, character, user_input, bot_reply, bot_emotion="neutral"):
    chat_data = {
        "user_id": user_id,
        "character": character,
        "user_message": user_input,
        "bot_reply": bot_reply,
        "bot_emotion": bot_emotion,
        "created_at": datetime.utcnow(),
    }
    chats_collection.insert_one(chat_data)

# Prompt global agar karakter merasa hidup di dunia anime mereka
with open("global_prompt_anime.txt", "r", encoding="utf-8") as f:
    prompt_global = f.read()

print("CHARACTERS:", characters.keys())
print("CHAR REM:", characters.get("Rem"))
# API untuk chatbot AI
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        print("DATA MASUK:", data)

        # Ambil data dari request
        user_id = data.get("user_id", "guest")
        selected_character = data.get("character", "Rem")
        user_input = data.get("message", "")

        # Cek karakter bawaan atau custom
        if selected_character in characters:
            base_prompt = characters[selected_character]
        else:
            custom_char = db.characters.find_one({"name": selected_character})
            if custom_char and "prompt" in custom_char:
                base_prompt = custom_char["prompt"]
            else:
                base_prompt = characters.get("Rem", "")

        # Gabungkan dengan prompt global
        system_prompt = f"""
{prompt_global.strip()}

{base_prompt.strip()}

Petunjuk:
- Jangan pernah keluar dari karakter anime.
"""

        # Ambil history chat terakhir dari MongoDB (maks 5)
        chat_history = list(chats_collection.find(
            {"user_id": user_id, "character": selected_character},
            {"_id": 0, "user_message": 1, "bot_reply": 1}
        ).sort("_id", -1).limit(5))

        
        # Susun history untuk OpenAI
        conversation_history = [{"role": "system", "content": system_prompt}]
        for chat in reversed(chat_history):
            conversation_history.append({"role": "user", "content": chat["user_message"]})
            conversation_history.append({"role": "assistant", "content": chat["bot_reply"]})

        # Tambahkan input terbaru pengguna
        conversation_history.append({"role": "user", "content": user_input})

        # Kirim ke OpenAI
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=conversation_history
        )
        
        print("✅ RESPON OPENAI:", response)


        bot_text = response.choices[0].message.content

        # Simpan chat ke MongoDB
        save_chat(user_id, selected_character, user_input, bot_text)

        # Kirim balasan ke frontend
        return jsonify({"reply": bot_text})

    except Exception as e:
        import traceback
        print("❌ ERROR TERJADI DI /chat")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    


# API untuk membuat karakter

@app.route("/create-character", methods=["POST"])
def create_character():
    name = request.form.get("name")
    creator = request.form.get("creator")
    personality = request.form.get("personality")
    speech_style = request.form.get("speechStyle")
    greeting = request.form.get("greeting")
    avatar_file = request.files.get("avatar")

    if not name or not personality or not speech_style or not greeting or not avatar_file:
        return jsonify({"error": "Semua field wajib diisi kecuali kreator!"}), 400

    # Cek duplikasi nama karakter
    if db.characters.find_one({"name": name}):
        return jsonify({"error": "Karakter dengan nama ini sudah ada."}), 400

    # Ambil ekstensi asli dan buat nama file aman
    ext = os.path.splitext(avatar_file.filename)[1]
    filename_raw = f"{name.lower().replace(' ', '_')}{ext}"
    filename = secure_filename(filename_raw)

    # Pastikan folder avatars/ ada
    os.makedirs("avatars", exist_ok=True)

    # Simpan avatar
    avatar_file.save(os.path.join("avatars", filename))

    # Prompt format
    prompt = f"""{name} adalah karakter yang memiliki kepribadian sebagai berikut:
{personality}

Gaya bicaranya:
{speech_style}

NOTE: Jangan pernah keluar dari karakter."""

    # Simpan ke DB
    db.characters.insert_one({
        "name": name,
        "creator": creator,
        "prompt": prompt,
        "greeting": greeting,
        "avatar": filename
    })

    return jsonify({
        "message": "Karakter berhasil dibuat!",
        "character": {
            "name": name,
            "anime": "Custom Character",
            "description": personality,
            "greeting": greeting,
            "type": "custom",
            "avatar": filename  # ini penting agar frontend tahu nama file yg benar
        }
    }), 200


# Ambil karakter buatan user dari database jika tidak ditemukan di karakter default
def get_character_prompt(character_name):
    if character_name in characters:
        return characters[character_name]
    
    custom_char = db.characters.find_one({"name": character_name})
    return custom_char["prompt"] if custom_char else characters["Rem"]

# Menampilkan daftar karakter yang tersedia
# Menampilkan daftar karakter yang tersedia (tanpa NOTE global)
@app.route("/characters", methods=["GET"])
def list_characters():
    # Ambil karakter default
    default_characters = list(characters.keys())
    
    # Ambil karakter custom dari database MongoDB
    custom_characters = list(db.characters.find({}, {"_id": 0, "name": 1, "creator": 1, "avatar": 1}))

    # Format response agar frontend bisa tahu mana custom dan mana default
    response = {
        "default": [{"name": name, "type": "default"} for name in default_characters],
        "custom": [
            {
                "name": c["name"],
                "type": "custom",
                "creator": c.get("creator", "unknown"),
                "avatar": c.get("avatar", None)
            }
            for c in custom_characters
        ]
    }
    
    return jsonify(response)

# API untuk mengambil riwayat chat
@app.route("/history/<user_id>", methods=["GET"])
def history(user_id):
    character = request.args.get("character")
    query = {"user_id": user_id}
    if character:
        query["character"] = character

    history = list(chats_collection.find(query, {"_id": 0}).sort("_id", 1))
    return jsonify({"history": history})

# API untuk mengambil riwayat chat berdasarkan user_id dan karakter
@app.route("/history/<user_id>/<character>", methods=["GET"])
def get_character_chat_history(user_id, character):
    history = list(chats_collection.find(
        {"user_id": user_id, "character": character},
        {"_id": 0}
    ).sort("_id", 1))  # sort ASC biar urutan dari awal ke akhir
    return jsonify({"history": history})

# API untuk menghapus karakter buatan user
@app.route("/character/<name>", methods=["DELETE"])
def delete_character(name):
    # Cari karakter custom di database
    character = db.characters.find_one({"name": name})
    if not character:
        return jsonify({"error": f"Karakter '{name}' tidak ditemukan atau bukan karakter custom."}), 404

    # Hapus data karakter dari database
    result = db.characters.delete_one({"name": name})

    # Jika karakter ditemukan dan berhasil dihapus
    if result.deleted_count > 0:
        # Hapus file avatar jika ada
        avatar_filename = character.get("avatar")
        avatar_path = os.path.join("avatars", avatar_filename)
        if avatar_filename and os.path.exists(avatar_path):
            os.remove(avatar_path)
            print(f"🗑️ Avatar '{avatar_filename}' berhasil dihapus.")
        else:
            print(f"⚠️ Avatar '{avatar_filename}' tidak ditemukan atau sudah dihapus sebelumnya.")

        return jsonify({"message": f"Karakter '{name}' dan avatar-nya berhasil dihapus."})
    else:
        return jsonify({"error": f"Gagal menghapus karakter '{name}'."}), 500


from flask import send_file, abort

@app.route('/avatars/<path:filename>')
def serve_avatar(filename):
    path = os.path.join(os.getcwd(), 'avatars', filename)

    if not os.path.isfile(path):
        abort(404)

    ext = filename.lower().split('.')[-1]
    mimetype = f'image/{ext if ext != "jpg" else "jpeg"}'

    return send_file(path, mimetype=mimetype)

@app.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    avatar = request.files['avatar']
    filename = secure_filename(avatar.filename)
    save_path = os.path.join('avatars', filename)
    avatar.save(save_path)
    return jsonify({'message': 'Upload berhasil', 'filename': filename})

# @app.route('/avatars/<filename>')
# def serve_avatar(filename):
#     return send_from_directory('avatars', filename)


@app.route("/history/<user_id>", methods=["DELETE"])
def delete_all_user_chats(user_id):
    result = chats_collection.delete_many({"user_id": user_id})
    return jsonify({"message": f"{result.deleted_count} chat dari user '{user_id}' telah dihapus."})


# API untuk menghapus riwayat chat berdasarkan user_id dan karakter
@app.route("/history/<user_id>/<character>", methods=["DELETE"])
def delete_chat_history(user_id, character):
    result = chats_collection.delete_many({
        "user_id": user_id,
        "character": character
    })
    return jsonify({"message": f"{result.deleted_count} chat berhasil dihapus untuk karakter '{character}' dan user '{user_id}'."})



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)



