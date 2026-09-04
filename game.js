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
    playSound('sound-click');
}

function restartGame() {
    showScreen('start');
    playSound('sound-click');
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
    if (levelId === 'win') playSound('sound-win');
    else playSound('sound-click');
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

function initPortal() {
    const crystals = document.querySelectorAll('#syllables-container .crystal');
    totalCrystals = crystals.length || 15;
    crystalsCollected = 0;
    
    crystals.forEach(crystal => {
        crystal.classList.remove('collected');
        crystal.onclick = function() {
            if (!this.classList.contains('collected')) {
                playSound('sound-click');
                this.classList.add('collected');
                crystalsCollected++;
                if (crystalsCollected === totalCrystals) {
                    playSound('sound-success');
                    const nextBtn = document.getElementById('btn-next-portal');
                    if (nextBtn) nextBtn.classList.remove('hidden');
                }
            }
        };
    });
}

// --- Level 2: Inventory (Words) ---
let itemsRevealed = 0;

function initInventory() {
    const chests = document.querySelectorAll('#chests-container .chest-item');
    itemsRevealed = 0;
    
    chests.forEach(chest => {
        chest.classList.remove('revealed');
        chest.onclick = function() {
            if (!this.classList.contains('revealed')) {
                playSound('sound-click');
                this.classList.add('revealed');
                itemsRevealed++;
                
                if (itemsRevealed === chests.length) {
                    setTimeout(() => {
                        playSound('sound-success');
                        const nextBtn = document.getElementById('btn-next-inventory');
                        if (nextBtn) nextBtn.classList.remove('hidden');
                    }, 500);
                }
            }
        };
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

function initWorld() {
    const actionZones = document.querySelectorAll('#actions-container .action-zone');
    actionsCompleted = 0;
    
    actionZones.forEach((zone, i) => {
        zone.classList.remove('done');
        zone.onclick = function() {
            if (!this.classList.contains('done')) {
                playSound('sound-click');
                this.classList.add('done');
                
                const action = actions[i];
                if (action) {
                    document.getElementById('action-image').src = action.src;
                    document.getElementById('action-text').textContent = action.text;
                    document.getElementById('action-modal').classList.add('active');
                }
            }
        };
    });
}

function closeActionModal() {
    playSound('sound-click');
    document.getElementById('action-modal').classList.remove('active');
    actionsCompleted++;
    const actionZones = document.querySelectorAll('#actions-container .action-zone');
    if (actionsCompleted >= actionZones.length) {
        playSound('sound-success');
        const nextBtn = document.getElementById('btn-next-world');
        if (nextBtn) nextBtn.classList.remove('hidden');
    }
}

// --- Level 4: Memory ---
function initMemory() {
    const cards = Array.from(document.querySelectorAll('#memory-container .memory-item'));
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matches = 0;
    const totalPairs = 6;
    
    cards.forEach(card => {
        card.classList.remove('revealed', 'correct');
        const img = card.querySelector('img');
        if (img) img.style.opacity = '0';
        
        card.onclick = function() {
            if (lockBoard || this === firstCard || this.classList.contains('correct')) return;
            
            playSound('sound-click');
            if (img) img.style.opacity = '1';
            this.classList.add('revealed');
            
            if (!firstCard) {
                firstCard = this;
                return;
            }
            
            secondCard = this;
            lockBoard = true;
            
            if (firstCard.dataset.name === secondCard.dataset.name) {
                playSound('sound-success');
                firstCard.classList.add('correct');
                secondCard.classList.add('correct');
                const name = this.dataset.name;
                const feedback = document.getElementById('memory-sentence');
                if (feedback) feedback.textContent = `Да! В игре была ${name.toLowerCase()}!`;
                matches++;
                firstCard = null;
                secondCard = null;
                lockBoard = false;
                
                if (matches === totalPairs) {
                    setTimeout(() => {
                        const nextBtn = document.getElementById('btn-next-memory');
                        if (nextBtn) nextBtn.classList.remove('hidden');
                    }, 800);
                }
            } else {
                const feedback = document.getElementById('memory-sentence');
                if (feedback) feedback.textContent = `Не угадал...`;
                setTimeout(() => {
                    const img1 = firstCard ? firstCard.querySelector('img') : null;
                    const img2 = secondCard ? secondCard.querySelector('img') : null;
                    if (img1) img1.style.opacity = '0';
                    if (img2) img2.style.opacity = '0';
                    if (firstCard) firstCard.classList.remove('revealed');
                    if (secondCard) secondCard.classList.remove('revealed');
                    firstCard = null;
                    secondCard = null;
                    lockBoard = false;
                    if (feedback) feedback.textContent = '';
                }, 900);
            }
        };
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
