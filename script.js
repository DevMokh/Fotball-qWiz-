// بيانات اللاعبين
let players = [];

// متغيرات اللعبة
let currentPlayer = {};
let currentInfoIndex = 0;
let score = 0;
let cash = 100;
let streak = 0;
let bestStreak = 0;
let usedPlayerIndices = [];
let totalXp = 0;

// إعدادات الصوت
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isSoundMuted = false;
let isVibrationMuted = false;

// إعدادات اللعبة
const POWERUP_COSTS = { '5050': 15, 'nation': 20, 'club': 25, 'hint': 30, 'swap': 35 };
const INITIAL_CASH = 100;
const QUESTION_TIME = 20;
const XP_PER_CORRECT_ANSWER = 10;

const LEVELS = [
    { name: "مبتدئ", minXp: 0, multiplier: 1 },
    { name: "هاوٍ", minXp: 500, multiplier: 1.2 },
    { name: "محترف", minXp: 1500, multiplier: 1.5 },
    { name: "خبير", minXp: 3000, multiplier: 1.8 },
    { name: "أسطورة", minXp: 5000, multiplier: 2 },
];

// نظام الصعوبات
const DIFFICULTY = {
    easy: { name: 'سهل', time: 30, pointsMultiplier: 1, cashMultiplier: 1, infoCount: 1, wrongPenalty: 0 },
    medium: { name: 'متوسط', time: 20, pointsMultiplier: 1.5, cashMultiplier: 1.2, infoCount: 2, wrongPenalty: 2 },
    hard: { name: 'صعب', time: 15, pointsMultiplier: 2, cashMultiplier: 1.5, infoCount: 3, wrongPenalty: 5 },
    expert: { name: 'خبير', time: 10, pointsMultiplier: 3, cashMultiplier: 2, infoCount: 4, wrongPenalty: 10 }
};

let currentDifficulty = 'medium';
let difficultyLevel = DIFFICULTY[currentDifficulty];
let gameMode = 'normal';
let questionTimer;
let timeLeft = QUESTION_TIME;

// عناصر DOM
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const playBtn = document.getElementById('play-btn');
const backToMenuBtnGame = document.getElementById('back-to-menu-btn-game');
const backToMenuBtnEnd = document.getElementById('back-to-menu-btn-end');
const restartBtn = document.getElementById('restart-btn');
const infoBox = document.getElementById('info-box');
const choicesEl = document.getElementById('choices');
const scoreDisplay = document.getElementById('score-display');
const cashDisplay = document.getElementById('game-cash-display');
const streakDisplay = document.getElementById('streak-display');
const playerLevelText = document.getElementById('player-level-text');
const timerBar = document.getElementById('timer-bar');
const loadingSpinner = document.getElementById('loading-spinner');

// دالة عرض التحميل
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('hidden', !show);
    }
}

// تحميل البيانات من JSON
async function loadPlayersData() {
    showLoading(true);
    try {
        const response = await fetch('players.json');
        players = await response.json();
        console.log('✅ تم تحميل', players.length, 'لاعب');
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        players = [
            { name: "ليونيل ميسي", infos: ["فزت بالكرة الذهبية 8 مرات"], nationality: "الأرجنتين", mainClub: "برشلونة", difficulty: "medium" },
            { name: "كريستيانو رونالدو", infos: ["فزت بدوري أبطال أوروبا 5 مرات"], nationality: "البرتغال", mainClub: "ريال مدريد", difficulty: "medium" },
            { name: "محمد صلاح", infos: ["فزت بالحذاء الذهبي 3 مرات"], nationality: "مصر", mainClub: "ليفربول", difficulty: "easy" }
        ];
    } finally {
        showLoading(false);
        initGame();
    }
}

// دالة تغيير الصعوبة
function setDifficulty(level) {
    currentDifficulty = level;
    difficultyLevel = DIFFICULTY[level];
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === level) {
            btn.classList.add('active');
        }
    });
    
    localStorage.setItem('preferredDifficulty', level);
    playSound('click');
}

// دوال الصوت
function playSound(type) {
    if (!audioCtx || isSoundMuted) return;
    
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        switch (type) {
            case 'correct':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
                break;
            case 'wrong':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
                break;
            case 'click':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
                break;
            default:
                return;
        }

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log('Sound error:', e);
    }
}

function vibrate(duration) {
    if (isVibrationMuted) return;
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// بدء اللعبة
function initGame() {
    loadGame();
    startScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    endScreen.classList.add('hidden');
    updateUI();
}

function startGame() {
    if (!players || players.length === 0) {
        alert('⚠️ لم يتم تحميل البيانات بعد، انتظر قليلاً');
        return;
    }
    
    score = 0;
    cash = INITIAL_CASH;
    streak = 0;
    usedPlayerIndices = [];
    powerupsUsedCount = 0;
    
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    endScreen.classList.add('hidden');
    loadQuestion();
    updateUI();
}

function loadQuestion() {
    clearTimeout(questionTimer);
    if (timerBar) timerBar.style.width = '100%';
    timeLeft = difficultyLevel.time;
    
    let availablePlayers = players.filter((_, index) => !usedPlayerIndices.includes(index));
    if (availablePlayers.length === 0) {
        usedPlayerIndices = [];
        availablePlayers = players;
    }

    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    currentPlayer = availablePlayers[randomIndex];
    usedPlayerIndices.push(players.indexOf(currentPlayer));

    currentInfoIndex = 0;
    if (infoBox) {
        infoBox.innerHTML = '';
        for (let i = 0; i < difficultyLevel.infoCount; i++) {
            if (i < currentPlayer.infos.length) {
                displayInfo(currentPlayer.infos[i]);
            }
        }
    }
    
    createChoices();
    updateUI();
    startQuestionTimer();

    document.querySelectorAll('.powerup-btn').forEach(btn => btn.disabled = false);
}

function displayInfo(infoText) {
    const info = document.createElement('p');
    info.textContent = `• ${infoText}`;
    infoBox.appendChild(info);
}

function createChoices() {
    let choices = [currentPlayer.name];
    let otherPlayers = players.filter(p => p.name !== currentPlayer.name);
    
    while (choices.length < 4 && otherPlayers.length > 0) {
        let randomIndex = Math.floor(Math.random() * otherPlayers.length);
        let decoy = otherPlayers.splice(randomIndex, 1)[0].name;
        if (!choices.includes(decoy)) {
            choices.push(decoy);
        }
    }

    choices.sort(() => Math.random() - 0.5);

    if (choicesEl) {
        choicesEl.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice;
            button.onclick = () => checkAnswer(choice);
            choicesEl.appendChild(button);
        });
    }
}

function checkAnswer(selectedAnswer) {
    clearTimeout(questionTimer);
    
    if (selectedAnswer === currentPlayer.name) {
        playSound('correct');
        vibrate(100);
        
        let pointsEarned = 10 * difficultyLevel.pointsMultiplier;
        
        score += pointsEarned;
        cash += 5 * difficultyLevel.cashMultiplier;
        streak++;
        
        if (streak > bestStreak) bestStreak = streak;
        
        totalXp += XP_PER_CORRECT_ANSWER;
        updatePlayerLevel();
        
        alert(`✅ صحيح! +${pointsEarned} نقطة`);
    } else {
        playSound('wrong');
        vibrate(200);
        streak = 0;
        cash = Math.max(0, cash - difficultyLevel.wrongPenalty);
        alert(`❌ خطأ! اللاعب هو ${currentPlayer.name}`);
    }
    
    updateUI();
    loadQuestion();
    saveGame();
}

function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (cashDisplay) cashDisplay.textContent = cash;
    if (streakDisplay) streakDisplay.textContent = `🔥 ${streak}`;
    
    const currentLevel = getCurrentLevel(totalXp);
    if (playerLevelText) playerLevelText.textContent = currentLevel.name;
    
    document.querySelectorAll('.powerup-cost').forEach((el, index) => {
        const costs = [15, 20, 25, 30, 35];
        if (el.id) {
            el.textContent = costs[index] || 0;
        }
    });
}

function startQuestionTimer() {
    timeLeft = difficultyLevel.time;
    if (timerBar) timerBar.style.width = '100%';
    
    questionTimer = setInterval(() => {
        timeLeft--;
        if (timerBar) {
            timerBar.style.width = `${(timeLeft / difficultyLevel.time) * 100}%`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            checkAnswer('');
        }
    }, 1000);
}

function getCurrentLevel(xp) {
    return LEVELS.filter(level => xp >= level.minXp).pop() || LEVELS[0];
}

function updatePlayerLevel() {
    const currentLevel = getCurrentLevel(totalXp);
    localStorage.setItem('currentLevel', currentLevel.name);
}

function saveGame() {
    localStorage.setItem('score', score);
    localStorage.setItem('cash', cash);
    localStorage.setItem('bestStreak', bestStreak);
    localStorage.setItem('totalXp', totalXp);
}

function loadGame() {
    score = parseInt(localStorage.getItem('score') || '0');
    cash = parseInt(localStorage.getItem('cash') || INITIAL_CASH.toString());
    bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
    totalXp = parseInt(localStorage.getItem('totalXp') || '0');
}

// أحداث الأزرار
if (playBtn) {
    playBtn.onclick = function() {
        playSound('click');
        startGame();
    };
}

if (backToMenuBtnGame) {
    backToMenuBtnGame.onclick = function() {
        playSound('click');
        clearTimeout(questionTimer);
        gameContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
    };
}

if (backToMenuBtnEnd) {
    backToMenuBtnEnd.onclick = function() {
        playSound('click');
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    };
}

if (restartBtn) {
    restartBtn.onclick = function() {
        playSound('click');
        startGame();
    };
}

// أزرار الصعوبة
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.onclick = function(e) {
        setDifficulty(e.target.dataset.difficulty);
    };
});

// أزرار power-ups
document.getElementById('powerup-5050').onclick = function() {
    if (cash >= 15) {
        cash -= 15;
        alert('🎮 50/50: تم إزالة إجابتين');
        updateUI();
    } else {
        alert('💰 لا يوجد كاش كافي');
    }
};

document.getElementById('powerup-nation').onclick = function() {
    if (cash >= 20) {
        cash -= 20;
        displayInfo(`🌍 الجنسية: ${currentPlayer.nationality}`);
        updateUI();
    } else {
        alert('💰 لا يوجد كاش كافي');
    }
};

document.getElementById('powerup-club').onclick = function() {
    if (cash >= 25) {
        cash -= 25;
        displayInfo(`👕 النادي: ${currentPlayer.mainClub}`);
        updateUI();
    } else {
        alert('💰 لا يوجد كاش كافي');
    }
};

document.getElementById('powerup-hint').onclick = function() {
    if (cash >= 30) {
        cash -= 30;
        displayInfo(`🔤 أول حرف: ${currentPlayer.name[0]}`);
        updateUI();
    } else {
        alert('💰 لا يوجد كاش كافي');
    }
};

document.getElementById('powerup-swap').onclick = function() {
    if (cash >= 35) {
        cash -= 35;
        usedPlayerIndices.push(players.indexOf(currentPlayer));
        loadQuestion();
        updateUI();
    } else {
        alert('💰 لا يوجد كاش كافي');
    }
};

// باقي الأزرار
document.getElementById('settings-btn').onclick = function() {
    document.getElementById('settings-modal').classList.remove('hidden');
};

document.getElementById('leaderboard-btn').onclick = function() {
    document.getElementById('leaderboard-modal').classList.remove('hidden');
};

document.getElementById('close-settings-btn').onclick = function() {
    document.getElementById('settings-modal').classList.add('hidden');
};

document.getElementById('close-leaderboard-btn').onclick = function() {
    document.getElementById('leaderboard-modal').classList.add('hidden');
};

document.getElementById('sound-toggle').onchange = function(e) {
    isSoundMuted = !e.target.checked;
};

document.getElementById('vibration-toggle').onchange = function(e) {
    isVibrationMuted = !e.target.checked;
};

document.getElementById('reset-game-data').onclick = function() {
    if (confirm('هل أنت متأكد من حذف كل البيانات؟')) {
        localStorage.clear();
        alert('✅ تم إعادة تعيين البيانات');
        location.reload();
    }
};

// بدء تحميل البيانات
window.onload = function() {
    loadPlayersData();
    
    // إضافة أصوات للنقر
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => playSound('click'));
    });
    
    // تحميل الصعوبة المخزنة
    const savedDifficulty = localStorage.getItem('preferredDifficulty');
    if (savedDifficulty) {
        setDifficulty(savedDifficulty);
    }
};

// متغيرات إضافية
let powerupsUsedCount = 0;
