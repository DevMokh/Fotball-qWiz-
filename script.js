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
let gameMode = 'normal';
let currentDifficulty = 'medium';
let timer = null;
let timeLeft = 20;

// إعدادات الصعوبة
const difficulties = {
    easy: { time: 30, multiplier: 1, cashMultiplier: 1 },
    medium: { time: 20, multiplier: 1.5, cashMultiplier: 1.2 },
    hard: { time: 15, multiplier: 2, cashMultiplier: 1.5 },
    expert: { time: 10, multiplier: 3, cashMultiplier: 2 },
    legend: { time: 8, multiplier: 5, cashMultiplier: 3 }
};

// عناصر الشاشات
const startScreen = document.getElementById('start-screen');
const modeScreen = document.getElementById('mode-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const settingsModal = document.getElementById('settings-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const resultOverlay = document.getElementById('result-overlay');

// أزرار التنقل
const playBtn = document.getElementById('play-btn');
const backFromMode = document.getElementById('back-from-mode');
const backFromDifficulty = document.getElementById('back-from-difficulty');
const backFromGame = document.getElementById('back-from-game');
const backToMenu = document.getElementById('back-to-menu');
const restartBtn = document.getElementById('restart-btn');

// أزرار الإعدادات
const settingsBtn = document.getElementById('settings-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const closeSettings = document.getElementById('close-settings');
const closeLeaderboard = document.getElementById('close-leaderboard');
const resetData = document.getElementById('reset-data');

// أزرار الأوضاع
const normalMode = document.getElementById('normal-mode');
const challengeMode = document.getElementById('challenge-mode');
const bossMode = document.getElementById('boss-mode');
const blindMode = document.getElementById('blind-mode');

// أزرار الصعوبة
const diffCards = document.querySelectorAll('[data-diff]');

// أزرار اللعبة
const nextInfoBtn = document.getElementById('next-info-btn');
const giftBtn = document.getElementById('gift-btn');

// Power-ups
const powerup5050 = document.getElementById('powerup-5050');
const powerupNation = document.getElementById('powerup-nation');
const powerupClub = document.getElementById('powerup-club');
const powerupHint = document.getElementById('powerup-hint');
const powerupSwap = document.getElementById('powerup-swap');

// ========== دوال التنقل بين الشاشات ==========
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
    screen.classList.add('active');
}

playBtn.addEventListener('click', function() {
    showScreen(modeScreen);
});

backFromMode.addEventListener('click', function() {
    showScreen(startScreen);
});

backFromDifficulty.addEventListener('click', function() {
    showScreen(modeScreen);
});

backFromGame.addEventListener('click', function() {
    clearInterval(timer);
    showScreen(difficultyScreen);
});

backToMenu.addEventListener('click', function() {
    showScreen(startScreen);
});

restartBtn.addEventListener('click', function() {
    showScreen(modeScreen);
});

// ========== اختيار الوضع ==========
normalMode.addEventListener('click', function() {
    gameMode = 'normal';
    showScreen(difficultyScreen);
});

challengeMode.addEventListener('click', function() {
    gameMode = 'challenge';
    showScreen(difficultyScreen);
});

bossMode.addEventListener('click', function() {
    gameMode = 'boss';
    showScreen(difficultyScreen);
});

blindMode.addEventListener('click', function() {
    gameMode = 'blind';
    showScreen(difficultyScreen);
});

// ========== اختيار الصعوبة وبدء اللعبة ==========
diffCards.forEach(card => {
    card.addEventListener('click', function() {
        currentDifficulty = this.dataset.diff;
        startGame();
    });
});

function startGame() {
    score = 0;
    streak = 0;
    usedPlayers = [];
    powerupsUsed = 0;
    cash = 100;
    
    showScreen(gameScreen);
    loadQuestion();
    updateDisplay();
}

// ========== دوال اللعبة ==========
function loadQuestion() {
    clearInterval(timer);
    
    // اختيار لاعب عشوائي
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

window.checkAnswer = function(answer) {
    clearInterval(timer);
    
    if (answer === currentPlayer.name) {
        let points = 10 * difficulties[currentDifficulty].multiplier;
        score += points;
        cash += 5 * difficulties[currentDifficulty].cashMultiplier;
        streak++;
        if (streak > bestStreak) bestStreak = streak;
        totalXp += 10;
        
        showResult('✅ صحيح! +' + points, '#4CAF50');
    } else {
        streak = 0;
        showResult('❌ خطأ! اللاعب هو ' + currentPlayer.name, '#f44336');
    }
    
    updateDisplay();
    loadQuestion();
};

function showResult(text, color) {
    const resultText = document.getElementById('result-text');
    resultText.textContent = text;
    resultText.style.color = color;
    resultOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        resultOverlay.classList.add('hidden');
    }, 1000);
}

function startTimer() {
    timeLeft = difficulties[currentDifficulty].time;
    const timerFill = document.getElementById('timer-fill');
    timerFill.style.width = '100%';
    
    timer = setInterval(() => {
        timeLeft--;
        timerFill.style.width = (timeLeft / difficulties[currentDifficulty].time) * 100 + '%';
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer('');
        }
    }, 1000);
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('game-cash').textContent = cash;
    document.getElementById('points').textContent = (3 - currentInfoIndex) * 10;
    document.getElementById('streak').textContent = streak;
    document.getElementById('highscore').textContent = bestStreak;
}

// ========== المعلومة التالية ==========
nextInfoBtn.addEventListener('click', function() {
    if (currentInfoIndex < currentPlayer.infos.length - 1) {
        currentInfoIndex++;
        let info = document.createElement('p');
        info.textContent = `• ${currentPlayer.infos[currentInfoIndex]}`;
        document.getElementById('info-box').appendChild(info);
        updateDisplay();
    }
});

// ========== هدية اليوم ==========
giftBtn.addEventListener('click', function() {
    let lastGift = localStorage.getItem('lastGift');
    let today = new Date().toDateString();
    
    if (lastGift === today) {
        alert('لقد أخذت هديتك اليوم! عد غداً');
        return;
    }
    
    let amount = Math.floor(Math.random() * 100) + 50;
    cash += amount;
    localStorage.setItem('lastGift', today);
    alert(`🎁 حصلت على ${amount} كاش!`);
    updateDisplay();
});

// ========== Power-ups ==========
powerup5050.addEventListener('click', function() {
    if (cash >= 15) {
        cash -= 15;
        powerupsUsed++;
        alert('تم تفعيل 50/50 - تم حذف إجابتين');
        updateDisplay();
    } else {
        alert('💰 الكاش غير كافي');
    }
});

powerupNation.addEventListener('click', function() {
    if (cash >= 20) {
        cash -= 20;
        powerupsUsed++;
        alert(`🌍 الجنسية: ${currentPlayer.nationality}`);
        updateDisplay();
    } else {
        alert('💰 الكاش غير كافي');
    }
});

powerupClub.addEventListener('click', function() {
    if (cash >= 25) {
        cash -= 25;
        powerupsUsed++;
        alert(`👕 النادي: ${currentPlayer.mainClub}`);
        updateDisplay();
    } else {
        alert('💰 الكاش غير كافي');
    }
});

powerupHint.addEventListener('click', function() {
    if (cash >= 30) {
        cash -= 30;
        powerupsUsed++;
        alert(`🔤 أول حرف: ${currentPlayer.name[0]}`);
        updateDisplay();
    } else {
        alert('💰 الكاش غير كافي');
    }
});

powerupSwap.addEventListener('click', function() {
    if (cash >= 35) {
        cash -= 35;
        powerupsUsed++;
        usedPlayers.push(players.indexOf(currentPlayer));
        loadQuestion();
        updateDisplay();
    } else {
        alert('💰 الكاش غير كافي');
    }
});

// ========== الإعدادات ==========
settingsBtn.addEventListener('click', function() {
    settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', function() {
    settingsModal.classList.add('hidden');
});

leaderboardBtn.addEventListener('click', function() {
    leaderboardModal.classList.remove('hidden');
});

closeLeaderboard.addEventListener('click', function() {
    leaderboardModal.classList.add('hidden');
});

resetData.addEventListener('click', function() {
    if (confirm('هل أنت متأكد من حذف كل البيانات؟')) {
        localStorage.clear();
        alert('✅ تم إعادة تعيين البيانات');
    }
});

// ========== الصوت والاهتزاز ==========
document.getElementById('sound-toggle').addEventListener('change', function(e) {
    console.log('Sound:', e.target.checked);
});

document.getElementById('vibration-toggle').addEventListener('change', function(e) {
    console.log('Vibration:', e.target.checked);
});

// ========== تحميل البيانات المحفوظة ==========
function loadSavedData() {
    score = parseInt(localStorage.getItem('score') || '0');
    cash = parseInt(localStorage.getItem('cash') || '100');
    bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
    totalXp = parseInt(localStorage.getItem('totalXp') || '0');
    
    document.getElementById('highscore').textContent = bestStreak;
    document.getElementById('cash').textContent = cash;
}

loadSavedData();
