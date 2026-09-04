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
    if (target) target.classList.add('active');
}

function startGame() {
    showScreen('portal');
    initPortal();
    playSound('sound-click');
}

function restartGame() {
    showScreen('start');
    playSound('sound-click');
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
const syllableGroups = [
    {
        label: '1 ряд: Прямые слоги',
        className: 'crystal-direct',
        list: ['РА', 'РО', 'РУ', 'РЫ', 'РЭ']
    },
    {
        label: '2 ряд: Обратные слоги',
        className: 'crystal-reverse',
        list: ['АР', 'ОР', 'УР', 'ЫР', 'ИР']
    },
    {
        label: '3 ряд: Интервокальные слоги',
        className: 'crystal-intervocalic',
        list: ['АРА', 'ОРО', 'УРУ', 'ЫРЫ', 'ЭРЭ']
    }
];

let crystalsCollected = 0;
let totalCrystals = 0;

function initPortal() {
    const container = document.getElementById('syllables-container');
    container.innerHTML = '';
    crystalsCollected = 0;
    totalCrystals = 0;
    
    syllableGroups.forEach((group, groupIdx) => {
        totalCrystals += group.list.length;
        
        const rowEl = document.createElement('div');
        rowEl.className = 'syllable-row';
        
        group.list.forEach((syl, i) => {
            const div = document.createElement('div');
            div.className = `crystal ${group.className}`;
            div.textContent = syl;
            div.style.animation = `pop 0.3s ease-out ${(groupIdx * 5 + i) * 0.04}s backwards`;
            
            div.onclick = function() {
                if (!this.classList.contains('collected')) {
                    playSound('sound-click');
                    this.classList.add('collected');
                    crystalsCollected++;
                    if (crystalsCollected === totalCrystals) {
                        playSound('sound-success');
                        document.getElementById('btn-next-portal').classList.remove('hidden');
                    }
                }
            };
            rowEl.appendChild(div);
        });
        
        container.appendChild(rowEl);
    });
}

// --- Level 2: Inventory (Words) ---
// Items correspond to assets 8 to 13
const items = [
    { src: 'assets/8.jpeg', name: 'РАКЕТА' },
    { src: 'assets/9.jpeg', name: 'КОРОНА' },
    { src: 'assets/10.jpeg', name: 'РОЛИКИ' },
    { src: 'assets/11.jpeg', name: 'РУБИН' },
    { src: 'assets/12.jpeg', name: 'РОБОТ' },
    { src: 'assets/13.jpeg', name: 'РАЦИЯ' }
];
let itemsRevealed = 0;

function initInventory() {
    const container = document.getElementById('chests-container');
    container.innerHTML = '';
    itemsRevealed = 0;
    
    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'chest-item';
        div.style.animation = `pop 0.3s ease-out ${i * 0.1}s backwards`;
        
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.name;
        div.appendChild(img);
        
        const label = document.createElement('span');
        label.className = 'chest-label';
        label.textContent = item.name;
        div.appendChild(label);
        
        div.onclick = function() {
            if(!this.classList.contains('revealed')) {
                playSound('sound-click');
                this.classList.add('revealed');
                itemsRevealed++;
                
                if(itemsRevealed === items.length) {
                    setTimeout(() => {
                        playSound('sound-success');
                        document.getElementById('btn-next-inventory').classList.remove('hidden');
                    }, 500);
                }
            }
        };
        container.appendChild(div);
    });
}

// --- Level 3: World (Sentences) ---
// Actions correspond to assets 14 to 18
const actions = [
    { src: 'assets/14.jpeg', text: 'Роблоксер строит ракету.' },
    { src: 'assets/15.jpeg', text: 'Роблоксер собирает красные рубины.' },
    { src: 'assets/16.jpeg', text: 'Роблоксер рубит ровное дерево.' },
    { src: 'assets/17.jpeg', text: 'Роблоксер управляет вертолётом.' },
    { src: 'assets/18.jpeg', text: 'Роблоксер разгружает грузовик.' }
];
let actionsCompleted = 0;

function initWorld() {
    const container = document.getElementById('actions-container');
    container.innerHTML = '';
    actionsCompleted = 0;
    
    actions.forEach((action, i) => {
        const div = document.createElement('div');
        div.className = 'action-zone';
        div.style.animation = `pop 0.3s ease-out ${i * 0.1}s backwards`;
        
        const img = document.createElement('img');
        img.src = action.src;
        div.appendChild(img);
        
        div.onclick = function() {
            if(!this.classList.contains('done')) {
                playSound('sound-click');
                this.classList.add('done');
                
                // Show modal
                document.getElementById('action-image').src = action.src;
                document.getElementById('action-text').textContent = action.text;
                document.getElementById('action-modal').classList.add('active');
            }
        };
        container.appendChild(div);
    });
}

function closeActionModal() {
    playSound('sound-click');
    document.getElementById('action-modal').classList.remove('active');
    actionsCompleted++;
    if(actionsCompleted === actions.length) {
        playSound('sound-success');
        document.getElementById('btn-next-world').classList.remove('hidden');
    }
}

// --- Level 4: Memory ---
// Mix some items from the game with some fake/wrong ones (or we just use items and say "что было").
// We'll use all items (8-13) as correct, and maybe add some placeholders for "wrong" ones if we had them.
// Since we don't have "wrong" assets, let's just make it a simple "Select all items you found".
function initMemory() {
    const container = document.getElementById('memory-container');
    container.innerHTML = '';
    
    // We will duplicate items to make a matching pair game! (Simpler and fun)
    const memoryDeck = [...items, ...items].sort(() => 0.5 - Math.random());
    
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matches = 0;
    
    memoryDeck.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'memory-item';
        div.dataset.name = item.name;
        
        // Hide image initially
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.name;
        img.style.opacity = '0';
        div.appendChild(img);
        
        div.onclick = function() {
            if(lockBoard) return;
            if(this === firstCard) return;
            if(this.classList.contains('correct')) return;
            
            playSound('sound-click');
            img.style.opacity = '1';
            this.classList.add('revealed');
            
            if(!firstCard) {
                firstCard = this;
                return;
            }
            
            secondCard = this;
            lockBoard = true;
            
            if(firstCard.dataset.name === secondCard.dataset.name) {
                // Match
                playSound('sound-success');
                firstCard.classList.add('correct');
                secondCard.classList.add('correct');
                
                const itemName = memoryDeck[i].name;
                document.getElementById('memory-sentence').textContent = `Да! В игре была ${itemName.toLowerCase()}!`;
                
                matches++;
                resetBoard();
                
                if(matches === items.length) {
                    setTimeout(() => {
                        document.getElementById('btn-next-memory').classList.remove('hidden');
                    }, 1000);
                }
            } else {
                // No match
                document.getElementById('memory-sentence').textContent = `Не угадал...`;
                setTimeout(() => {
                    firstCard.firstChild.style.opacity = '0';
                    secondCard.firstChild.style.opacity = '0';
                    firstCard.classList.remove('revealed');
                    secondCard.classList.remove('revealed');
                    resetBoard();
                    document.getElementById('memory-sentence').textContent = '';
                }, 1000);
            }
        };
        
        container.appendChild(div);
    });

    function resetBoard() {
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }
}
