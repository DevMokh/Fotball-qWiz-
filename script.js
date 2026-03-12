// --- Database (55 Players) ---
const db = [
    // ... (قاعدة البيانات الكاملة كما هي) ...
];

// --- Audio & Vibration ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isSoundMuted = false;
let isVibrationMuted = false; // متغير جديد للاهتزاز

function playSound(type) {
    if (!audioCtx || isSoundMuted) return;
    // ... (باقي دالة الصوت كما هي)
}

function vibrate(pattern) {
    if (isVibrationMuted) return;
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// --- Config (كما هو) ---
const POWERUP_COSTS = { '5050': 15, 'nation': 20, 'club': 25, 'hint': 30 };
const INITIAL_CASH = 100;
const QUESTION_TIME = 20;
const POINTS_PER_QUESTION = 20;

// --- Game State (كما هو) ---
let currentQuestion = {};
let score = 0;
let cash = 0;
// ... (باقي متغيرات الحالة)

// --- DOM Elements ---
// ... (كل العناصر السابقة)
const vibrationToggleBtn = document.getElementById('vibration-toggle'); // زر الاهتزاز الجديد

// --- Game Logic ---
function initGame() {
    // ... (باقي الدالة)
    isSoundMuted = localStorage.getItem('knowThePlayerSoundMuted') === 'true';
    isVibrationMuted = localStorage.getItem('knowThePlayerVibrationMuted') === 'true'; // تحميل حالة الاهتزاز
    updateUI();
}

function startGame() {
    // ... (كما هي)
}

function loadQuestion() {
    // ... (كما هي)
}

function checkAnswer(selectedChoice) {
    clearInterval(questionTimer);
    let isCorrect = selectedChoice === currentQuestion.name;
    
    if (isCorrect) {
        playSound('correct');
        vibrate(100); // اهتزاز قصير للنجاح
        // ... (باقي منطق الإجابة الصحيحة)
    } else {
        playSound('wrong');
        vibrate([200, 50, 200]); // اهتزاز مزدوج للفشل
        // ... (باقي منطق الإجابة الخاطئة)
    }
    // ... (باقي الدالة)
}

// ... (باقي الدوال كما هي)

function updateUI() {
    // ... (باقي الدالة)
    soundToggleBtn.textContent = isSoundMuted ? '🔇' : '🔊';
    vibrationToggleBtn.textContent = isVibrationMuted ? '📳' : '📳'; // يمكنك تغيير الأيقونة
    vibrationToggleBtn.style.opacity = isVibrationMuted ? 0.5 : 1;
}

// --- Event Listeners ---
// ... (كل المستمعات السابقة)

soundToggleBtn.addEventListener('click', () => {
    isSoundMuted = !isSoundMuted;
    localStorage.setItem('knowThePlayerSoundMuted', isSoundMuted);
    updateUI();
    playSound('click');
});

// مستمع جديد لزر الاهتزاز
vibrationToggleBtn.addEventListener('click', () => {
    isVibrationMuted = !isVibrationMuted;
    localStorage.setItem('knowThePlayerVibrationMuted', isVibrationMuted);
    updateUI();
    vibrate(50); // اهتزاز قصير عند الضغط
});

// ... (باقي المستمعات)

// --- Initial Load ---
initGame();
