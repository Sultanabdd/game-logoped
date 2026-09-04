// Auto-remove preview notice if JavaScript is running
const qkNotice = document.getElementById('quicklook-notice');
if (qkNotice) qkNotice.remove();

// --- Audio Management (Safe for iOS Safari & Windows) ---
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    ['sound-click', 'sound-success', 'sound-win'].forEach(id => {
        const sound = document.getElementById(id);
        if (sound) {
            try {
                const p = sound.play();
                if (p && p.then) {
                    p.then(() => {
                        sound.pause();
                        sound.currentTime = 0;
                    }).catch(() => {});
                }
            } catch (_) {}
        }
    });
    audioUnlocked = true;
}
document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
document.addEventListener('click', unlockAudio, { once: true, passive: true });

const playSound = (id) => {
    try {
        const sound = document.getElementById(id);
        if (sound) {
            try {
                sound.pause();
                sound.currentTime = 0;
            } catch (_) {}
            const playPromise = sound.play();
            if (playPromise !== undefined && playPromise.catch) {
                playPromise.catch(() => {});
            }
        }
    } catch (_) {}
};

// --- Navigation ---
const screens = ['start', 'portal', 'inventory', 'world', 'memory', 'win'];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${id}`);
    if (target) {
        target.classList.add('active');
    }
}

function startGame() {
    showScreen('portal');
    initPortal();
    try { playSound('sound-click'); } catch (_) {}
}

function restartGame() {
    showScreen('start');
    try { playSound('sound-click'); } catch (_) {}
    initPortal();
    initInventory();
    initWorld();
    initMemory();
}

function nextLevel(levelId) {
    showScreen(levelId);
    if (levelId === 'portal') initPortal();
    if (levelId === 'inventory') initInventory();
    if (levelId === 'world') initWorld();
    if (levelId === 'memory') initMemory();
    if (levelId === 'win') {
        try { playSound('sound-win'); } catch (_) {}
    } else {
        try { playSound('sound-click'); } catch (_) {}
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#screen-', '');
    if (screens.includes(hash)) {
        nextLevel(hash);
    }
});

// --- Level 1: Portal (Syllables) ---
let crystalsCollected = 0;
let totalCrystals = 15;

function onCrystalClick(crystal) {
    if (!crystal || crystal.classList.contains('collected')) return;
    crystal.classList.add('collected');
    crystalsCollected++;
    try { playSound('sound-click'); } catch (_) {}
    const crystals = document.querySelectorAll('#syllables-container .crystal');
    const total = crystals.length || 15;
    if (crystalsCollected >= total) {
        try { playSound('sound-success'); } catch (_) {}
        const nextBtn = document.getElementById('btn-next-portal');
        if (nextBtn) nextBtn.classList.remove('hidden');
    }
}

function initPortal() {
    const crystals = document.querySelectorAll('#syllables-container .crystal');
    totalCrystals = crystals.length || 15;
    crystalsCollected = 0;
    crystals.forEach(crystal => {
        crystal.classList.remove('collected');
    });
}

// --- Level 2: Inventory (Words) ---
let itemsRevealed = 0;

function onChestClick(chest) {
    if (!chest || chest.classList.contains('revealed')) return;
    chest.classList.add('revealed');
    itemsRevealed++;
    try { playSound('sound-click'); } catch (_) {}
    const chests = document.querySelectorAll('#chests-container .chest-item');
    if (itemsRevealed >= chests.length) {
        setTimeout(() => {
            try { playSound('sound-success'); } catch (_) {}
            const nextBtn = document.getElementById('btn-next-inventory');
            if (nextBtn) nextBtn.classList.remove('hidden');
        }, 400);
    }
}

function initInventory() {
    const chests = document.querySelectorAll('#chests-container .chest-item');
    itemsRevealed = 0;
    chests.forEach(chest => {
        chest.classList.remove('revealed');
    });
}

// --- Level 3: World (Sentences) ---
const actions = [
    { src: 'assets/14.jpeg', text: 'Роблоксер строит ракету.' },
    { src: 'assets/15.jpeg', text: 'Роблоксер собирает красные рубины.' },
    { src: 'assets/16.jpeg', text: 'Роблоксер рубит ровное дерево.' },
    { src: 'assets/17.jpeg', text: 'Роблоксер управляет вертолётом.' },
    { src: 'assets/18.jpeg', text: 'Роблоксер разгружает грузовик.' }
];
let actionsCompleted = 0;

function onActionClick(zone, index) {
    if (!zone) return;
    zone.classList.add('done');
    try { playSound('sound-click'); } catch (_) {}
    const action = actions[index];
    if (action) {
        const modalImg = document.getElementById('action-image');
        const modalTxt = document.getElementById('action-text');
        const modal = document.getElementById('action-modal');
        if (modalImg) modalImg.src = action.src;
        if (modalTxt) modalTxt.textContent = action.text;
        if (modal) modal.classList.add('active');
    }
}

function initWorld() {
    const actionZones = document.querySelectorAll('#actions-container .action-zone');
    actionsCompleted = 0;
    actionZones.forEach(zone => {
        zone.classList.remove('done');
    });
}

function closeActionModal() {
    try { playSound('sound-click'); } catch (_) {}
    const modal = document.getElementById('action-modal');
    if (modal) modal.classList.remove('active');
    actionsCompleted++;
    const actionZones = document.querySelectorAll('#actions-container .action-zone');
    if (actionsCompleted >= actionZones.length) {
        try { playSound('sound-success'); } catch (_) {}
        const nextBtn = document.getElementById('btn-next-world');
        if (nextBtn) nextBtn.classList.remove('hidden');
    }
}

// --- Level 4: Memory ---
const itemPhrases = {
    'РАКЕТА': 'Да! В игре была ракета!',
    'КОРОНА': 'Да! В игре была корона!',
    'РОЛИКИ': 'Да! В игре были ролики!',
    'РУБИН': 'Да! В игре был рубин!',
    'РОБОТ': 'Да! В игре был робот!',
    'РАЦИЯ': 'Да! В игре была рация!'
};

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
const totalPairs = 6;

function onMemoryClick(card) {
    if (!card || lockBoard || card === firstCard || card.classList.contains('correct')) return;
    
    try { playSound('sound-click'); } catch (_) {}
    card.classList.add('revealed');
    
    if (!firstCard) {
        firstCard = card;
        return;
    }
    
    secondCard = card;
    lockBoard = true;
    
    if (firstCard.dataset.name === secondCard.dataset.name) {
        try { playSound('sound-success'); } catch (_) {}
        firstCard.classList.add('correct');
        secondCard.classList.add('correct');
        const name = card.dataset.name;
        const feedback = document.getElementById('memory-sentence');
        if (feedback) feedback.textContent = itemPhrases[name] || `Да! В игре ${name.toLowerCase()}!`;
        matches++;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        
        if (matches >= totalPairs) {
            setTimeout(() => {
                const nextBtn = document.getElementById('btn-next-memory');
                if (nextBtn) nextBtn.classList.remove('hidden');
            }, 800);
        }
    } else {
        const feedback = document.getElementById('memory-sentence');
        if (feedback) feedback.textContent = 'Не угадал...';
        setTimeout(() => {
            if (firstCard) firstCard.classList.remove('revealed');
            if (secondCard) secondCard.classList.remove('revealed');
            firstCard = null;
            secondCard = null;
            lockBoard = false;
            if (feedback) feedback.textContent = '';
        }, 900);
    }
}

function initMemory() {
    const container = document.getElementById('memory-container');
    if (!container) return;

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matches = 0;

    const cards = Array.from(container.querySelectorAll('.memory-item'));
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        container.appendChild(cards[j]);
    }

    cards.forEach(card => {
        card.classList.remove('revealed', 'correct');
    });
}

// Auto-init on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPortal();
        initInventory();
        initWorld();
        initMemory();
    });
} else {
    initPortal();
    initInventory();
    initWorld();
    initMemory();
}
