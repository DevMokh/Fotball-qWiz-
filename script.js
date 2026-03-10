// --- Audio Context for Sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);

    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    } else if (type === 'wrong') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    } else if (type === 'click') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    }

    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    oscillator.stop(audioCtx.currentTime + 0.2);
}


// --- Database (50 Players) ---
const db = [
    { name: "ليونيل ميسي", infos: ["فزت بالكرة الذهبية 8 مرات.", "قُدت الأرجنتين للفوز بكأس العالم 2022.", "أنا الهداف التاريخي لنادي برشلونة."], decoys: ["كريستيانو رونالدو", "نيمار جونيور"], mainClub: "برشلونة", nationality: "🇦🇷" },
    { name: "كريستيانو رونالدو", infos: ["أنا الهداف التاريخي لكرة القدم.", "فزت بدوري الأبطال 5 مرات.", "فزت ببطولة أمم أوروبا 2016."], decoys: ["ليونيل ميسي", "لويس فيغو"], mainClub: "ريال مدريد", nationality: "🇵🇹" },
    { name: "محمد صلاح", infos: ["فزت بالحذاء الذهبي للدوري الإنجليزي 3 مرات.", "فزت بدوري الأبطال مع ليفربول 2019.", "بدأت مسيرتي الأوروبية في بازل."], decoys: ["رياض محرز", "حكيم زياش"], mainClub: "ليفربول", nationality: "🇪🇬" },
    { name: "زين الدين زيدان", infos: ["فزت بكأس العالم 1998.", "فزت بدوري الأبطال كلاعب ومدرب مع ريال مدريد.", "اشتهرت بحركة 'المروحة'."], decoys: ["ميشيل بلاتيني", "تييري هنري"], mainClub: "ريال مدريد", nationality: "🇫🇷" },
    { name: "رونالدينيو", infos: ["فزت بكأس العالم 2002 والكرة الذهبية 2005.", "اشتهرت بأسلوبي المبهج والساحر.", "تلقيت تصفيقًا من جماهير ريال مدريد."], decoys: ["كاكا", "ريفالدو"], mainClub: "برشلونة", nationality: "🇧🇷" },
    // Add the other 45 players here
];

// --- Config ---
const levels = [ { name: "مبتدئ", minScore: 0 }, { name: "هاوٍ", minScore: 500 }, { name: "محترف", minScore: 1500 }, { name: "خبير", minScore: 4000 }, { name: "أسطورة", minScore: 10000 } ];
const POWERUP_COSTS = { '5050': 15, 'nation': 20, 'club': 25, 'hint': 30 };
const INITIAL_COINS = 100;
const QUESTION_TIME = 20;
const CHALLENGE_MODE_DURATION = 60;

// --- Game State ---
let gameMode = 'normal';
let currentQuestion = {}, currentInfoIndex = 0, score = 0, potentialPoints = 30, streak = 0, coins = 0;
let normalHighScore = 0, challengeHighScore = 0;
let bestStreak = 0;
let powerupsUsedCount = 0;
let usedPlayerIndices = [];
let questionTimer, mainTimer;

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const startNormalBtn = document.getElementById('start-normal-btn');
const startChallengeBtn = document.getElementById('start-challenge-btn');
const gameModeDisplay = document.getElementById('game-mode-display');
const mainTimerDisplay = document.getElementById('main-timer-display');
const scoreEl = document.getElementById('score');
const coinsDisplay = document.getElementById('coins-display');
const potentialPointsEl = document.getElementById('potential-points');
const infoBoxEl = document.getElementById('info-box');
const nextInfoBtn = document.getElementById('next-info-btn');
const choicesEl = document.getElementById('choices');
const resultOverlayEl = document.getElementById('result-overlay');
const resultTextEl = document.getElementById('result-text');
const finalScoreEl = document.getElementById('final-score');
const finalScoreLabel = document.getElementById('final-score-label');
const restartBtn = document.getElementById('restart-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const highScoreDisplay = document.getElementById('high-score-display');
const challengeHighScoreDisplay = document.getElementById('challenge-high-score-display');
const highScoreEndDisplay = document.getElementById('high-score-end-display');
const challengeHighScoreEndDisplay = document.getElementById('challenge-high-score-end-display');
const bestStreakDisplay = document.getElementById('best-streak-display');
const powerupsUsedDisplay = document.getElementById('powerups-used-display');
const playerLevelEl = document.getElementById('player-level');
const progressBarEl = document.getElementById('progress-bar');
const timerBar = document.getElementById('timer-bar');
const powerups = {
    '5050': document.getElementById('powerup-5050'), 'nation': document.getElementById('powerup-nation'),
    'club': document.getElementById('powerup-club'), 'hint': document.getElementById('powerup-hint')
};

// --- Game Logic ---
function initGame() {
    normalHighScore = localStorage.getItem('knowThePlayerNormalHighScore') || 0;
    challengeHighScore = localStorage.getItem('knowThePlayerChallengeHighScore') || 0;
    highScoreDisplay.textContent = normalHighScore;
    challengeHighScoreDisplay.textContent = challengeHighScore;
    
    startScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    endScreen.classList.add('hidden');
}

function startGame(mode) {
    gameMode = mode;
    score = 0;
    streak = 0;
    coins = INITIAL_COINS;
    bestStreak = 0;
    powerupsUsedCount = 0;
    usedPlayerIndices = [];
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    if (gameMode === 'challenge') {
        startMainTimer();
        gameModeDisplay.textContent = "تحدي الـ 60 ثانية";
        playerLevelEl.style.display = 'none';
        progressBarEl.parentElement.style.display = 'none';
    } else {
        mainTimerDisplay.textContent = "";
        gameModeDisplay.textContent = "الوضع العادي";
        playerLevelEl.style.display = 'block';
        progressBarEl.parentElement.style.display = 'block';
    }
    
    loadQuestion();
}

function startMainTimer() {
    clearInterval(mainTimer);
    let timeLeft = CHALLENGE_MODE_DURATION;
    mainTimerDisplay.textContent = `الوقت: ${timeLeft}`;
    mainTimer = setInterval(() => {
        timeLeft--;
        mainTimerDisplay.textContent = `الوقت: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(mainTimer);
            clearInterval(questionTimer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(mainTimer);
    clearInterval(questionTimer);

    if (gameMode === 'normal') {
        if (score > normalHighScore) {
            normalHighScore = score;
            localStorage.setItem('knowThePlayerNormalHighScore', normalHighScore);
        }
    } else {
        if (score > challengeHighScore) {
            challengeHighScore = score;
            localStorage.setItem('knowThePlayerChallengeHighScore', challengeHighScore);
        }
    }
    
    finalScoreLabel.textContent = gameMode === 'normal' ? "نتيجتك النهائية:" : "الأسئلة الصحيحة:";
    finalScoreEl.textContent = score;
    highScoreEndDisplay.textContent = normalHighScore;
    challengeHighScoreEndDisplay.textContent = challengeHighScore;
    bestStreakDisplay.textContent = bestStreak;
    powerupsUsedDisplay.textContent = powerupsUsedCount;
    
    gameContainer.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

function startQuestionTimer() {
    clearInterval(questionTimer);
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    
    setTimeout(() => {
        timerBar.style.transition = `width ${QUESTION_TIME}s linear`;
        timerBar.style.width = '0%';
    }, 100);

    questionTimer = setInterval(() => {
        if (gameMode === 'normal') {
            clearInterval(questionTimer);
            playSound('wrong');
            showResult(false, `انتهى الوقت! اللاعب هو: ${currentQuestion.name}`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; endGame(); }, 2500);
        } else {
            clearInterval(questionTimer);
            playSound('wrong');
            showResult(false, `انتهى الوقت!`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 2000);
        }
    }, QUESTION_TIME * 1000);
}

function loadQuestion() {
    if (usedPlayerIndices.length === db.length) usedPlayerIndices = [];
    let playerIndex;
    do { playerIndex = Math.floor(Math.random() * db.length); } while (usedPlayerIndices.includes(playerIndex));
    usedPlayerIndices.push(playerIndex);
    currentQuestion = db[playerIndex];
    
    resetQuestionUI();
    displayInfo();
    createChoices();
    startQuestionTimer();
}

function resetQuestionUI() {
    currentInfoIndex = 0;
    potentialPoints = 30;
    infoBoxEl.innerHTML = '';
    choicesEl.innerHTML = '';
    nextInfoBtn.disabled = false;
    updateUI();
}

function displayInfo(infoText) {
    const info = document.createElement('p');
    info.innerHTML = infoText || `- ${currentQuestion.infos[currentInfoIndex]}`;
    infoBoxEl.appendChild(info);
}

function createChoices() {
    const choices = [...currentQuestion.decoys, currentQuestion.name].sort(() => Math.random() - 0.5);
    choicesEl.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => checkAnswer(choice);
        choicesEl.appendChild(button);
    });
}

function checkAnswer(selectedChoice) {
    clearInterval(questionTimer);
    let isCorrect = selectedChoice === currentQuestion.name;
    
    if (isCorrect) {
        playSound('correct');
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        let earnedCoins = Math.floor(potentialPoints / 10);
        if (gameMode === 'normal') {
            score += potentialPoints;
        } else {
            score++;
        }
        coins += earnedCoins;
        let resultMsg = `إجابة صحيحة!`;
        if (gameMode === 'normal') resultMsg += ` +${potentialPoints} نقطة`;
        resultMsg += ` | +${earnedCoins} عملة`;
        
        showResult(true, resultMsg);
        setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 1500);
    } else {
        playSound('wrong');
        streak = 0;
        if (gameMode === 'normal') {
            showResult(false, `إجابة خاطئة! اللاعب هو: ${currentQuestion.name}`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; endGame(); }, 2500);
        } else {
            showResult(false, `إجابة خاطئة!`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 1500);
        }
    }
}

function showResult(isCorrect, text) {
    resultTextEl.textContent = text;
    resultOverlayEl.className = isCorrect ? 'result-overlay correct' : 'result-overlay wrong';
    resultOverlayEl.style.display = 'flex';
}

function updateUI() {
    const scoreLabel = gameMode === 'normal' ? "النقاط" : "الصحيحة";
    scoreEl.textContent = `${scoreLabel}: ${score}`;
    coinsDisplay.textContent = `💰 ${coins}`;
    potentialPointsEl.textContent = `النقاط: ${potentialPoints}`;
    
    Object.entries(powerups).forEach(([key, btn]) => {
        btn.disabled = coins < POWERUP_COSTS[key];
    });
    
    if (gameMode === 'normal') {
        let currentLevel = levels.filter(l => score >= l.minScore).pop() || levels[0];
        let nextLevel = levels[levels.indexOf(currentLevel) + 1];
        playerLevelEl.textContent = currentLevel.name;
        if (nextLevel) {
            let scoreInLevel = score - currentLevel.minScore;
            let levelScoreRange = nextLevel.minScore - currentLevel.minScore;
            progressBarEl.style.width = `${(scoreInLevel / levelScoreRange) * 100}%`;
        } else {
            progressBarEl.style.width = '100%';
        }
    }
}

// --- Event Listeners ---
nextInfoBtn.addEventListener('click', () => {
    currentInfoIndex++;
    if (currentInfoIndex < currentQuestion.infos.length) {
        displayInfo();
        potentialPoints = (currentInfoIndex === 1) ? 20 : 10;
        updateUI();
        if (currentInfoIndex === 2) nextInfoBtn.disabled = true;
    }
});

Object.entries(powerups).forEach(([key, btn]) => {
    btn.addEventListener('click', () => {
        const cost = POWERUP_COSTS[key];
        if (coins >= cost) {
            coins -= cost;
            powerupsUsedCount++;
            btn.disabled = true;
            switch (key) {
                case '5050':
                    const buttons = Array.from(choicesEl.children);
                    const wrongChoice = buttons.find(b => b.textContent !== currentQuestion.name);
                    if(wrongChoice) wrongChoice.disabled = true;
                    break;
                case 'nation':
                    displayInfo(`<b>تلميح:</b> جنسية اللاعب هي ${currentQuestion.nationality}`);
                    break;
                case 'club':
                    displayInfo(`<b>تلميح:</b> من أبرز الأندية التي لعب لها ${currentQuestion.mainClub}`);
                    break;
                case 'hint':
                    displayInfo(`<b>تلميح:</b> اسم اللاعب يبدأ بحرف '${currentQuestion.name[0]}'`);
                    break;
            }
            updateUI();
        }
    });
});

startNormalBtn.addEventListener('click', () => startGame('normal'));
startChallengeBtn.addEventListener('click', () => startGame('challenge'));
restartBtn.addEventListener('click', () => startGame(gameMode)); // Modified to restart the same mode
backToMenuBtn.addEventListener('click', initGame);

// Add click sound to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => playSound('click'));
});

// --- Initial Load ---
initGame();
