// بيانات اللاعبين
let players = [
    { name: "ليونيل ميسي", infos: ["فزت بالكرة الذهبية 8 مرات", "فزت بكأس العالم 2022"], nationality: "الأرجنتين", mainClub: "برشلونة" },
    { name: "كريستيانو رونالدو", infos: ["فزت بدوري الأبطال 5 مرات", "هداف التاريخ"], nationality: "البرتغال", mainClub: "ريال مدريد" },
    { name: "محمد صلاح", infos: ["فزت بالحذاء الذهبي 3 مرات", "فزت بدوري الأبطال 2019"], nationality: "مصر", mainClub: "ليفربول" }
];

// متغيرات اللعبة
let currentPlayer = {};
let currentInfoIndex = 0;
let score = 0;
let cash = 100;
let streak = 0;
let bestStreak = 0;
let usedPlayers = [];
let totalXp = 0;
let powerupsUsed = 0;
let timer;

// إعدادات الصعوبة
const difficulties = {
    easy: { time: 30, multiplier: 1, cashMultiplier: 1, infoCount: 1 },
    medium: { time: 20, multiplier: 1.5, cashMultiplier: 1.2, infoCount: 2 },
    hard: { time: 15, multiplier: 2, cashMultiplier: 1.5, infoCount: 3 },
    expert: { time: 10, multiplier: 3, cashMultiplier: 2, infoCount: 4 },
    legend: { time: 8, multiplier: 5, cashMultiplier: 3, infoCount: 5 }
};

let currentDifficulty = 'medium';
let gameMode = 'normal';
let timeLeft = 20;

// عناصر DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const settingsModal = document.getElementById('settings-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');

// أزرار
const playBtn = document.getElementById('play-btn');
const backBtn = document.getElementById('back-btn');
const settingsBtn = document.getElementById('settings-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const closeSettings = document.getElementById('close-settings');
const closeLeaderboard = document.getElementById('close-leaderboard');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const giftBtn = document.getElementById('gift-btn');
const nextInfoBtn = document.getElementById('next-info-btn');
const resetData = document.getElementById('reset-data');

// أزرار الأوضاع
const normalMode = document.getElementById('normal-mode');
const challengeMode = document.getElementById('challenge-mode');
const bossMode = document.getElementById('boss-mode');
const blindMode = document.getElementById('blind-mode');

// أزرار الصعوبة
document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('[data-diff]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentDifficulty = this.dataset.diff;
    });
});

// أحداث الأزرار
playBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', () => {
    gameScreen.classList.remove('active');
    gameScreen.classList.add('hidden');
    startScreen.classList.add('active');
    startScreen.classList.remove('hidden');
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

leaderboardBtn.addEventListener('click', () => {
    updateLeaderboard();
    leaderboardModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
});

restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
    endScreen.classList.remove('active');
    endScreen.classList.add('hidden');
    startScreen.classList.add('active');
    startScreen.classList.remove('hidden');
});

giftBtn.addEventListener('click', claimGift);
nextInfoBtn.addEventListener('click', nextInfo);

// دوال اللعبة
function startGame() {
    score = 0;
    streak = 0;
    usedPlayers = [];
    powerupsUsed = 0;
    cash = 100;
    
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    gameScreen.classList.add('active');
    gameScreen.classList.remove('hidden');
    
    loadQuestion();
    updateDisplay();
}

function loadQuestion() {
    clearInterval(timer);
    
    // اختيار لاعب
    let available = players.filter((p, i) => !usedPlayers.includes(i));
    if (available.length === 0) {
        usedPlayers = [];
        available = players;
    }
    
    let randomIndex = Math.floor(Math.random() * available.length);
    let playerName = available[randomIndex].name;
    
    for (let i = 0; i < players.length; i++) {
        if (players[i].name === playerName) {
            currentPlayer = players[i];
            usedPlayers.push(i);
            break;
        }
    }
    
    currentInfoIndex = 0;
    document.getElementById('info-box').innerHTML = `<p>• ${currentPlayer.infos[0]}</p>`;
    
    createChoices();
    startTimer();
}

function createChoices() {
    let choices = [currentPlayer.name];
    let others = players.filter(p => p.name !== currentPlayer.name);
    
    while (choices.length < 3 && others.length > 0) {
        let random = others[Math.floor(Math.random() * others.length)].name;
        if (!choices.includes(random)) {
            choices.push(random);
        }
    }
    
    choices.sort(() => Math.random() - 0.5);
    
    let html = '';
    choices.forEach(choice => {
        html += `<button class="choice-btn" onclick="checkAnswer('${choice}')">${choice}</button>`;
    });
    document.getElementById('choices-area').innerHTML = html;
}

function checkAnswer(answer) {
    clearInterval(timer);
    
    if (answer === currentPlayer.name) {
        score += 10 * difficulties[currentDifficulty].multiplier;
        cash += 5 * difficulties[currentDifficulty].cashMultiplier;
        streak++;
        if (streak > bestStreak) bestStreak = streak;
        totalXp += 10;
        
        showResult('✅ صحيح!', '#4caf50');
    } else {
        streak = 0;
        showResult(`❌ خطأ! اللاعب هو ${currentPlayer.name}`, '#f44336');
    }
    
    updateDisplay();
    loadQuestion();
}

function showResult(text, color) {
    const overlay = document.getElementById('result-overlay');
    const resultText = document.getElementById('result-text');
    resultText.textContent = text;
    resultText.style.color = color;
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 1000);
}

function startTimer() {
    timeLeft = difficulties[currentDifficulty].time;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';
    
    timer = setInterval(() => {
        timeLeft--;
        timerBar.style.width = (timeLeft / difficulties[currentDifficulty].time) * 100 + '%';
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer('');
        }
    }, 1000);
}

function nextInfo() {
    if (currentInfoIndex < currentPlayer.infos.length - 1) {
        currentInfoIndex++;
        let info = document.createElement('p');
        info.textContent = `• ${currentPlayer.infos[currentInfoIndex]}`;
        document.getElementById('info-box').appendChild(info);
    }
}

function claimGift() {
    let lastGift = localStorage.getItem('lastGift');
    let today = new Date().toDateString();
    
    if (lastGift === today) {
        alert('لقد أخذت هديتك اليوم!');
        return;
    }
    
    let gifts = [50, 100, 150, 200];
    let amount = gifts[Math.floor(Math.random() * gifts.length)];
    cash += amount;
    
    localStorage.setItem('lastGift', today);
    alert(`🎁 حصلت على ${amount} كاش!`);
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('score-display').textContent = score;
    document.getElementById('cash-display-game').textContent = cash;
    document.getElementById('points-display').textContent = (3 - currentInfoIndex) * 10;
}

function updateLeaderboard() {
    let list = document.getElementById('leaderboard-list');
    list.innerHTML = '<li>🏆 أفضل النتائج</li>';
}

// Power-ups
document.getElementById('powerup-5050').addEventListener('click', function() {
    if (cash >= 15) {
        cash -= 15;
        powerupsUsed++;
        alert('تم تفعيل 50/50');
        updateDisplay();
    } else {
        alert('الكاش غير كافي');
    }
});

document.getElementById('powerup-nation').addEventListener('click', function() {
    if (cash >= 20) {
        cash -= 20;
        powerupsUsed++;
        alert(`الجنسية: ${currentPlayer.nationality}`);
        updateDisplay();
    } else {
        alert('الكاش غير كافي');
    }
});

document.getElementById('powerup-club').addEventListener('click', function() {
    if (cash >= 25) {
        cash -= 25;
        powerupsUsed++;
        alert(`النادي: ${currentPlayer.mainClub}`);
        updateDisplay();
    } else {
        alert('الكاش غير كافي');
    }
});

document.getElementById('powerup-hint').addEventListener('click', function() {
    if (cash >= 30) {
        cash -= 30;
        powerupsUsed++;
        alert(`أول حرف: ${currentPlayer.name[0]}`);
        updateDisplay();
    } else {
        alert('الكاش غير كافي');
    }
});

document.getElementById('powerup-swap').addEventListener('click', function() {
    if (cash >= 35) {
        cash -= 35;
        powerupsUsed++;
        usedPlayers.push(players.indexOf(currentPlayer));
        loadQuestion();
        updateDisplay();
    } else {
        alert('الكاش غير كافي');
    }
});

// أزرار الأوضاع
normalMode.addEventListener('click', function() {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    gameMode = 'normal';
});

challengeMode.addEventListener('click', function() {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    gameMode = 'challenge';
});

bossMode.addEventListener('click', function() {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    gameMode = 'boss';
});

blindMode.addEventListener('click', function() {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    gameMode = 'blind';
});

// Reset data
resetData.addEventListener('click', function() {
    if (confirm('هل أنت متأكد؟')) {
        localStorage.clear();
        alert('تم إعادة تعيين البيانات');
    }
});

// Load saved data
function loadGame() {
    score = parseInt(localStorage.getItem('score') || '0');
    cash = parseInt(localStorage.getItem('cash') || '100');
    bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
    totalXp = parseInt(localStorage.getItem('totalXp') || '0');
}

loadGame();
