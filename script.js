// متغيرات اللعبة
let currentScreen = 'splash';
let currentPlayer = null;
let score = 0;
let streak = 0;
let currentLevel = 1;
let hintsUsed = 0;
let coins = 0;
let timerInterval = null;
let timeLeft = 15;
let soundsEnabled = true;
let darkMode = false;
const totalLevels = 20;
const maxHints = 10;

// بيانات اللاعبين
let players = [];

// إحصائيات الإنجازات
let stats = {
    correctAnswers: 0,
    totalScore: 0,
    maxStreak: 0,
    hintsUsed: 0,
    maxLevel: 1,
    unlockedAchievements: []
};

// الإنجازات
const achievements = [
    { 
        id: 1, 
        name: "بداية قوية", 
        desc: "احصل على أول إجابة صحيحة",
        icon: "🎯",
        condition: (stats) => stats.correctAnswers >= 1,
        progress: (stats) => Math.min(100, (stats.correctAnswers / 1) * 100)
    },
    { 
        id: 2, 
        name: "سلسلة ذهبية", 
        desc: "احصل على 3 إجابات متتالية",
        icon: "🔥",
        condition: (stats) => stats.maxStreak >= 3,
        progress: (stats) => Math.min(100, (stats.maxStreak / 3) * 100)
    },
    { 
        id: 3, 
        name: "جامع النقاط", 
        desc: "اجمع 100 نقطة",
        icon: "💰",
        condition: (stats) => stats.totalScore >= 100,
        progress: (stats) => Math.min(100, (stats.totalScore / 100) * 100)
    }
];

// تحميل بيانات اللاعبين من ملف JSON
fetch('players.json')
    .then(response => response.json())
    .then(data => {
        players = data.players;
        console.log('تم تحميل اللاعبين:', players.length);
    })
    .catch(error => {
        console.error('خطأ في تحميل اللاعبين:', error);
    });

// تهيئة اللعبة
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    loadStats();
    
    setTimeout(() => {
        showScreen('main');
    }, 2000);
    
    document.getElementById('total-levels').textContent = totalLevels;
});

// تحميل الإحصائيات
function loadStats() {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// حفظ الإحصائيات
function saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(stats));
}

// التحقق من الإنجازات
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!stats.unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
            stats.unlockedAchievements.push(achievement.id);
            showNewAchievement(achievement);
        }
    });
    saveStats();
}

// إظهار إنجاز جديد
function showNewAchievement(achievement) {
    const div = document.createElement('div');
    div.className = 'new-achievement';
    div.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 10px;">${achievement.icon}</div>
        <h2>إنجاز جديد! 🎉</h2>
        <p style="font-size: 20px; margin: 10px 0;">${achievement.name}</p>
        <p style="font-size: 14px;">${achievement.desc}</p>
    `;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}

// رسم الإنجازات
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = stats.unlockedAchievements.includes(achievement.id);
        const progress = achievement.progress(stats);
        
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            ${isUnlocked ? '<div class="achievement-badge">✅</div>' : ''}
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
            <div class="achievement-progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
        `;
        
        grid.appendChild(item);
    });
}

// إظهار شاشة معينة
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        
        if (screenId === 'main') {
            updateUI();
        } else if (screenId === 'game') {
            startLevel();
        } else if (screenId === 'levels') {
            renderLevels();
        } else if (screenId === 'achievements') {
            renderAchievements();
        } else if (screenId === 'leaderboard') {
            renderLeaderboard();
        } else if (screenId === 'settings') {
            loadSettings();
        }
    }
}

// تحديث واجهة المستخدم
function updateUI() {
    document.getElementById('coin-count').textContent = coins;
    document.getElementById('current-score').textContent = score;
    document.getElementById('streak-count').textContent = streak;
    document.getElementById('hint-count').textContent = maxHints - hintsUsed;
}

// العودة للشاشة الرئيسية
function goBack() {
    if (currentScreen === 'game') {
        clearTimer();
    }
    showScreen('main');
}

// بدء اللعبة
function startGame() {
    currentLevel = 1;
    score = 0;
    streak = 0;
    hintsUsed = 0;
    coins = 0;
    showScreen('game');
}

// بدء مستوى (شاشة التحدي)
function startLevel() {
    clearTimer();
    
    if (players.length === 0) {
        console.log('في انتظار تحميل اللاعبين...');
        setTimeout(startLevel, 500);
        return;
    }
    
    const availablePlayers = players.filter(p => p.level <= currentLevel);
    if (availablePlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        currentPlayer = availablePlayers[randomIndex];
        
        // تحديث صورة اللاعب - هنا بيضاف الـ blur في التحدي فقط
        const playerImage = document.getElementById('player-image');
        if (currentPlayer.image) {
            playerImage.style.backgroundImage = `url('${currentPlayer.image}')`;
            // إضافة blur في شاشة التحدي فقط
            playerImage.classList.add('blurred');
            playerImage.classList.remove('revealed');
        }
        
        generateOptions();
        
        document.getElementById('current-level').textContent = currentLevel;
        document.getElementById('current-score').textContent = score;
        document.getElementById('hint-display').innerHTML = '';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-count').textContent = maxHints - hintsUsed;
        
        startTimer(15);
    }
}

// إنشاء الخيارات
function generateOptions() {
    let options = [currentPlayer.name];
    const otherPlayers = players.filter(p => p.id !== currentPlayer.id);
    
    while (options.length < 4 && otherPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherPlayers.length);
        const randomName = otherPlayers[randomIndex].name;
        
        if (!options.includes(randomName)) {
            options.push(randomName);
        }
        
        otherPlayers.splice(randomIndex, 1);
    }
    
    options = shuffleArray(options);
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        container.appendChild(button);
    });
}

// خلط المصفوفة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// بدء المؤقت
function startTimer(seconds) {
    timeLeft = seconds;
    document.getElementById('timer-text').textContent = timeLeft;
    document.getElementById('timer-bar').style.width = '100%';
    document.getElementById('timer-bar').style.background = '#4CAF50';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = timeLeft;
        document.getElementById('timer-bar').style.width = (timeLeft / seconds) * 100 + '%';
        
        if (timeLeft <= 5) {
            document.getElementById('timer-bar').style.background = '#f44336';
        }
        
        if (timeLeft <= 0) {
            clearTimer();
            showResult('timeout');
        }
    }, 1000);
}

// إيقاف المؤقت
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// التحقق من الإجابة
function checkAnswer(selected) {
    clearTimer();
    
    const options = document.querySelectorAll('.option-btn');
    let pointsEarned = 0;
    
    if (selected === currentPlayer.name) {
        streak++;
        pointsEarned = 10;
        
        stats.correctAnswers++;
        stats.totalScore += pointsEarned;
        if (streak > stats.maxStreak) {
            stats.maxStreak = streak;
        }
        
        if (streak % 3 === 0) {
            pointsEarned += 20;
            showBonusMessage('🔥 سلسلة! +20 نقطة!');
        }
        
        score += pointsEarned;
        coins += 5;
        
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
            if (btn.textContent === currentPlayer.name) {
                btn.classList.add('correct');
            }
        });
        
        // إزالة blur بعد الإجابة الصحيحة
        document.getElementById('player-image').classList.remove('blurred');
        document.getElementById('player-image').classList.add('revealed');
        
        showResult('correct', pointsEarned);
    } else {
        streak = 0;
        
        options.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
            if (btn.textContent === selected) {
                btn.classList.add('wrong');
            }
            if (btn.textContent === currentPlayer.name) {
                btn.classList.add('correct');
            }
        });
        
        // إزالة blur بعد الإجابة الغلط
        document.getElementById('player-image').classList.remove('blurred');
        document.getElementById('player-image').classList.add('revealed');
        
        showResult('wrong');
    }
    
    if (currentLevel > stats.maxLevel) {
        stats.maxLevel = currentLevel;
    }
    
    updateUI();
    checkAchievements();
    saveGameData();
    saveStats();
}

// إظهار رسالة المكافأة
function showBonusMessage(message) {
    const bonusDiv = document.createElement('div');
    bonusDiv.className = 'bonus-message';
    bonusDiv.textContent = message;
    document.body.appendChild(bonusDiv);
    
    setTimeout(() => {
        bonusDiv.remove();
    }, 2000);
}

// إظهار النتيجة
function showResult(type, points = 0) {
    const resultCard = document.getElementById('result-card');
    const resultScreen = document.getElementById('result-screen');
    
    let icon, message, pointsText;
    
    if (type === 'correct') {
        icon = '🎉';
        message = 'إجابة صحيحة!';
        pointsText = `+${points} نقطة`;
        resultCard.className = 'result-card correct';
    } else if (type === 'wrong') {
        icon = '😞';
        message = 'إجابة خاطئة!';
        pointsText = `الإجابة: ${currentPlayer.name}`;
        resultCard.className = 'result-card wrong';
    } else {
        icon = '⏰';
        message = 'انتهى الوقت!';
        pointsText = `الإجابة: ${currentPlayer.name}`;
        resultCard.className = 'result-card wrong';
    }
    
    resultCard.innerHTML = `
        <div class="result-icon">${icon}</div>
        <div class="result-message">${message}</div>
        <div class="result-points">${pointsText}</div>
        <button class="result-next-btn" onclick="window.nextLevel()">التالي</button>
    `;
    
    resultScreen.classList.add('active');
}

// المستوى التالي
function nextLevel() {
    document.getElementById('result-screen').classList.remove('active');
    
    if (currentLevel < totalLevels) {
        currentLevel++;
        startLevel();
    } else {
        alert('🎉 مبروك! أكملت جميع المستويات!');
        showScreen('main');
    }
}

// استخدام تلميح
function useHint() {
    if (hintsUsed >= maxHints) {
        alert('😞 لقد استنفدت جميع التلميحات!');
        return;
    }
    
    hintsUsed++;
    stats.hintsUsed++;
    
    const hints = [
        `النادي: ${currentPlayer.club}`,
        `البلد: ${currentPlayer.nationality}`,
        `المركز: ${currentPlayer.position}`
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    document.getElementById('hint-display').innerHTML = `
        <div class="hint">💡 ${randomHint}</div>
    `;
    
    document.getElementById('hint-count').textContent = maxHints - hintsUsed;
    
    if (hintsUsed >= maxHints) {
        document.getElementById('hint-btn').disabled = true;
    }
    
    checkAchievements();
    saveGameData();
    saveStats();
}

// عرض المستويات
function showLevels() {
    showScreen('levels');
}

// عرض الإنجازات
function showAchievements() {
    showScreen('achievements');
}

// رسم المستويات
function renderLevels() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= totalLevels; i++) {
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';
        
        if (i < currentLevel) {
            levelItem.classList.add('completed');
            levelItem.innerHTML = `<span>${i}</span><div class="level-stars">⭐⭐⭐</div>`;
        } else if (i === currentLevel) {
            levelItem.classList.add('current');
            levelItem.innerHTML = `<span>${i}</span>`;
        } else {
            levelItem.classList.add('locked');
            levelItem.innerHTML = `<span>🔒 ${i}</span>`;
        }
        
        levelItem.onclick = () => {
            if (i <= currentLevel) {
                currentLevel = i;
                showScreen('game');
            }
        };
        
        grid.appendChild(levelItem);
    }
}

// عرض أفضل اللاعبين
function showLeaderboard() {
    showScreen('leaderboard');
}

// رسم أفضل اللاعبين
function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    
    const leaderboard = [
        { rank: 1, name: 'أحمد محمد', score: 1250 },
        { rank: 2, name: 'عمر حسن', score: 1100 },
        { rank: 3, name: 'سارة أحمد', score: 950 }
    ];
    
    list.innerHTML = leaderboard.map(player => `
        <div class="leaderboard-item">
            <div class="leaderboard-rank">#${player.rank}</div>
            <div class="leaderboard-name">${player.name}</div>
            <div class="leaderboard-score">${player.score}</div>
        </div>
    `).join('');
}

// عرض الإعدادات
function showSettings() {
    showScreen('settings');
}

// تحميل الإعدادات
function loadSettings() {
    document.getElementById('sound-effect').checked = soundsEnabled;
    document.getElementById('dark-mode').checked = darkMode;
    
    if (darkMode) {
        document.body.style.background = '#333';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// إعادة تعيين التقدم
function resetProgress() {
    if (confirm('⚠️ هل أنت متأكد؟')) {
        score = 0;
        streak = 0;
        currentLevel = 1;
        hintsUsed = 0;
        coins = 0;
        
        stats = {
            correctAnswers: 0,
            totalScore: 0,
            maxStreak: 0,
            hintsUsed: 0,
            maxLevel: 1,
            unlockedAchievements: []
        };
        
        saveGameData();
        saveStats();
        updateUI();
        alert('✅ تم إعادة التعيين');
        showScreen('main');
    }
}

// حفظ البيانات
function saveGameData() {
    const gameData = { score, streak, currentLevel, hintsUsed, coins, soundsEnabled, darkMode };
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// تحميل البيانات
function loadGameData() {
    try {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            score = gameData.score || 0;
            streak = gameData.streak || 0;
            currentLevel = gameData.currentLevel || 1;
            hintsUsed = gameData.hintsUsed || 0;
            coins = gameData.coins || 0;
            soundsEnabled = gameData.soundsEnabled !== false;
            darkMode = gameData.darkMode || false;
        }
    } catch (e) {
        console.log('لا توجد بيانات محفوظة');
    }
}

// ربط الدوال بالـ window
window.showScreen = showScreen;
window.startGame = startGame;
window.showLevels = showLevels;
window.showAchievements = showAchievements;
window.showLeaderboard = showLeaderboard;
window.showSettings = showSettings;
window.goBack = goBack;
window.useHint = useHint;
window.nextLevel = nextLevel;
window.resetProgress = resetProgress;
window.checkAnswer = checkAnswer;
