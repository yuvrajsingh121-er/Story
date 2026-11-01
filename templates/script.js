// 1. PIN Lock System
async function unlockApp() {
    const inputPin = document.getElementById('pin-input').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch('/api/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: inputPin })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            document.getElementById('lock-screen').classList.add('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            startCountdown();
            fetchSavedMemories();
        } else {
            errorMsg.innerText = data.message || "Incorrect PIN!";
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Error verifying PIN:", error);
    }
}

// 2. Fetch Note
async function fetchSecretNote() {
    try {
        const response = await fetch('/api/get-note');
        const data = await response.json();
        document.getElementById('secret-note-display').innerText = `"${data.note}"`;
    } catch (error) {
        console.error("Error fetching note:", error);
    }
}

// 3. Countdown Timer
function startCountdown() {
    const targetDate = new Date("2026-12-31T00:00:00").getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('countdown').innerText = 
                `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            document.getElementById('countdown').innerText = "It's Special Day Today! 🎉";
        }
    }, 1000);
}

// Delete Memory Function
async function deleteMemory(memoryId, element) {
    if (!confirm("Kya aap sach me ye memory delete karna chahte ho?")) return;

    try {
        const response = await fetch(`/api/delete-memory/${memoryId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            element.parentElement.remove();
        } else {
            alert(data.message || "Delete karne me error aaya!");
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
}

// Render Memory Card
function renderMemoryCard(data) {
    const timeline = document.getElementById('timeline-container');
    if (!timeline) return;

    const newMemoryCard = document.createElement('div');
    newMemoryCard.className = 'timeline-item';
    newMemoryCard.style.position = 'relative';
    
    newMemoryCard.innerHTML = `
        <h4>${data.title}</h4>
        <p>${data.description}</p>
        <img src="${data.image_url}" class="timeline-img" alt="${data.title}">
        <br>
        <button onclick="deleteMemory('${data.id}', this)" style="background: #ff4d4d; color: white; padding: 5px 12px; margin-top: 8px; font-size: 0.8rem;">
            🗑️ Delete
        </button>
    `;
    timeline.appendChild(newMemoryCard);
}

// Fetch saved memories
async function fetchSavedMemories() {
    try {
        const response = await fetch('/api/get-memories');
        const memories = await response.json();
        
        const timeline = document.getElementById('timeline-container');
        if (timeline) timeline.innerHTML = "<h3>📖 Our Journey</h3>"; 

        memories.forEach(memory => renderMemoryCard(memory));
    } catch (err) {
        console.error("Error fetching saved memories:", err);
    }
}

// Memory Upload Handler
document.getElementById('memory-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('memory-title').value;
    const desc = document.getElementById('memory-desc').value;
    const imageFile = document.getElementById('memory-image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('image', imageFile);

    try {
        const response = await fetch('/api/upload-memory', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            renderMemoryCard(data);
            document.getElementById('memory-form').reset();
        } else {
            alert("Failed to upload memory: " + (data.message || "Error"));
        }
    } catch (err) {
        console.error("Upload error:", err);
    }
});

// Music Toggle Functionality
function toggleMusic() {
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');

    if (music.paused) {
        music.play();
        musicBtn.innerText = "⏸️ Pause Music";
        musicBtn.classList.add('playing');
    } else {
        music.pause();
        musicBtn.innerText = "🎵 Play Music";
        musicBtn.classList.remove('playing');
    }
}