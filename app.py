from flask import Flask, render_template, jsonify, request, send_from_directory
import random
import os
import json
import cloudinary
import cloudinary.uploader

app = Flask(__name__)

# Cloudinary Setup (Environment variables se securely load hoga)
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", "k2whstzb"),
    api_key=os.environ.get("CLOUDINARY_API_KEY", "893793997386734"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "aw9oNSmr340UcJbsXaDRX_LJIkc"),
    secure=True
)

JSON_FILE = os.path.join(app.root_path, 'memories.json')

# Persistent JSON Helpers
def load_memories():
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r') as f:
            return json.load(f)
    return []

def save_all_memories(memories_list):
    with open(JSON_FILE, 'w') as f:
        json.dump(memories_list, f, indent=4)

NOTES_POOL = [
    "Aapki smile poore din ki tiredness dur kar deti hai! ✨",
    "Remember our first coffee date? Best day ever! ☕❤️",
    "You are my favorite notification. 📱💖",
    "Thank you for being my constant support and best friend. 🌸",
    "No matter how busy life gets, you'll always be my priority. 💫"
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/styles.css')
def serve_css():
    return send_from_directory('templates', 'styles.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('templates', 'script.js')

@app.route('/love.mp3')
def serve_audio():
    return send_from_directory('.', 'love.mp3')

@app.route('/api/get-memories', methods=['GET'])
def get_memories():
    return jsonify(load_memories())

@app.route('/api/verify-pin', methods=['POST'])
def verify_pin():
    data = request.json or {}
    pin = data.get('pin')
    SECRET_PIN = "3001"
    
    if pin == SECRET_PIN:
        return jsonify({"status": "success", "message": "Access Granted!"})
    else:
        return jsonify({"status": "error", "message": "Incorrect Passcode!"}), 401

@app.route('/api/get-note', methods=['GET'])
def get_random_note():
    random_note = random.choice(NOTES_POOL)
    return jsonify({"note": random_note, "status": "success"})

# Cloudinary Memory Upload Route
@app.route('/api/upload-memory', methods=['POST'])
def upload_memory():
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image uploaded"}), 400
    
    file = request.files['image']
    title = request.form.get('title', 'Special Memory')
    desc = request.form.get('description', '')

    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    try:
        # Image ko Cloudinary Cloud par upload kar rahe hain
        upload_result = cloudinary.uploader.upload(file)
        image_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id")

        memory_id = str(random.randint(100000, 999999))
        
        memory_data = {
            "id": memory_id,
            "title": title,
            "description": desc,
            "image_url": image_url,
            "public_id": public_id
        }

        memories = load_memories()
        memories.append(memory_data)
        save_all_memories(memories)

        return jsonify({"status": "success", **memory_data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Memory aur Cloudinary Image Delete Route
@app.route('/api/delete-memory/<memory_id>', methods=['DELETE'])
def delete_memory(memory_id):
    memories = load_memories()
    target_memory = next((m for m in memories if m.get('id') == memory_id), None)

    if target_memory:
        public_id = target_memory.get('public_id')
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
            except Exception as e:
                print("Cloudinary destroy error:", e)

        updated_memories = [m for m in memories if m.get('id') != memory_id]
        save_all_memories(updated_memories)

        return jsonify({"status": "success", "message": "Memory deleted!"})
    
    return jsonify({"status": "error", "message": "Memory not found!"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)