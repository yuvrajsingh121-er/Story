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

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-particle');
    heart.innerText = ['❤️', '💖', '✨', '🌸'][Math.floor(Math.random() * 4)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
}
setInterval(createHeart, 800);

// Love Letters Pool for Envelope
const loveLetters = [
    "Tumhe pata hai? Jab bhi mera phone bajta hai, mujhe umeed hoti hai ki wo tumhara message ho. You are my absolute favorite person! 💖",
    "Dur hokar bhi tum mere sabse paas ho. Har ek pal jo tumhare sath bitaya hai, wo meri life ka bestest part hai. ✨",
    "Bas yehi kehna tha ki thank you meri life me aane ke liye aur ise itna khoobsurat banane ke liye. Love you endlessly! 💕",
    "Meri duniya ki sabse pyari smile ke liye: Hamesha haste raho, kyunki tumhari smile hi meri khushi hai! 🌸"
];

function openEnvelope() {
    const randomLetter = loveLetters[Math.floor(Math.random() * loveLetters.length)];
    document.getElementById('letter-text').innerText = `"${randomLetter}"`;
    document.getElementById('letter-content').classList.remove('hidden');
    document.getElementById('envelope-icon').style.transform = 'scale(1.2) rotate(-10deg)';
}

function closeEnvelope() {
    document.getElementById('letter-content').classList.add('hidden');
    document.getElementById('envelope-icon').style.transform = 'scale(1) rotate(0deg)';
}

function selectMood(mood) {
    const responseBox = document.getElementById('mood-response');
    if (mood.includes('Happy')) {
        responseBox.innerText = "Aapki yeh smile hamesha aise hi bani rahe! Bhagwan se yahi dua hai. 🥰✨";
    } else if (mood.includes('Missing')) {
        responseBox.innerText = "Main bhi aapko bahut miss kar raha hoon! Jaldi milte hain na. 🥺❤️";
    } else {
        responseBox.innerText = "Yay! Aapki khushi me hi meri khushi hai! 🎉💖";
    }
}