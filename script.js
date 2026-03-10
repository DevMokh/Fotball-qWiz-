// --- Audio Context for Sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
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

// --- Database ---
const db = [    { name: "ليونيل ميسي", infos: ["فزت بالكرة الذهبية 8 مرات.", "فزت بكأس العالم 2022 مع الأرجنتين.", "أنا الهداف التاريخي لنادي برشلونة."], nationality: "الأرجنتين", mainClub: "برشلونة" },
    { name: "كريستيانو رونالدو", infos: ["أنا الهداف التاريخي لكرة القدم.", "فزت بدوري أبطال أوروبا 5 مرات.", "فزت ببطولة أمم أوروبا 2016."], nationality: "البرتغال", mainClub: "ريال مدريد" },
    { name: "محمد صلاح", infos: ["فزت بالحذاء الذهبي للدوري الإنجليزي 3 مرات.", "فزت بدوري أبطال أوروبا مع ليفربول 2019.", "بدأت مسيرتي الاحترافية في نادي المقاولون العرب."], nationality: "مصر", mainClub: "ليفربول" },
    { name: "زين الدين زيدان", infos: ["فزت بكأس العالم 1998 مع فرنسا.", "اشتهرت بحركة 'المروحة' (la roulette).", "دربت ريال مدريد وفزت معهم بدوري الأبطال 3 مرات متتالية."], nationality: "فرنسا", mainClub: "ريال مدريد" },
    { name: "رونالدينيو", infos: ["فزت بكأس العالم 2002 والكرة الذهبية 2005.", "اشتهرت بأسلوبي المهاري والمبهج والساحر.", "تلقيت تصفيقًا من جماهير ريال مدريد في ملعبهم وأنا لاعب لبرشلونة."], nationality: "البرازيل", mainClub: "برشلونة" },
    { name: "كيليان مبابي", infos: ["فزت بكأس العالم 2018 وأنا في سن المراهقة.", "ألعب حاليًا في باريس سان جيرمان.", "اشتهر بسرعتي الفائقة."], nationality: "فرنسا", mainClub: "باريس سان جيرمان" },
    { name: "نيمار جونيور", infos: ["كنت جزءًا من ثلاثي MSN الشهير في برشلونة.", "أنا أغلى لاعب في تاريخ كرة القدم.", "ألعب حاليًا في الدوري السعودي."], nationality: "البرازيل", mainClub: "برشلونة" },
    { name: "إيرلينج هالاند", infos: ["اشتهر بقوتي البدنية الهائلة وقدرتي على تسجيل الأهداف.", "فزت بالثلاثية التاريخية مع مانشستر سيتي في 2023.", "أنا من النرويج."], nationality: "النرويج", mainClub: "مانشستر سيتي" },
    { name: "لوكا مودريتش", infos: ["فزت بالكرة الذهبية عام 2018.", "ألعب في خط الوسط مع ريال مدريد.", "وصلت إلى نهائي كأس العالم 2018 مع منتخب كرواتيا."], nationality: "كرواتيا", mainClub: "ريال مدريد" },
    { name: "كيفين دي بروين", infos: ["أعتبر من أفضل صانعي الألعاب في العالم.", "ألعب في نادي مانشستر سيتي.", "أنا من بلجيكا."], nationality: "بلجيكا", mainClub: "مانشستر سيتي" },
    { name: "أندريس إنييستا", infos: ["سجلت هدف الفوز في نهائي كأس العالم 2010.", "كنت جزءًا من خط وسط برشلونة الأسطوري مع تشافي.", "لعبت لسنوات عديدة في الدوري الياباني."], nationality: "إسبانيا", mainClub: "برشلونة" },
    { name: "زلاتان إبراهيموفيتش", infos: ["لعبت لأندية كبيرة مثل يوفنتوس، إنتر، برشلونة، وميلان.", "اشتهر بأهدافي البهلوانية وشخصيتي القوية.", "أنا من السويد."], nationality: "السويد", mainClub: "إنتر ميلان" },
    { name: "رياض محرز", infos: ["فزت بالدوري الإنجليزي مع ناديين مختلفين (ليستر سيتي ومانشستر سيتي).", "فزت بكأس الأمم الأفريقية 2019 مع الجزائر.", "ألعب حاليًا في الدوري السعودي."], nationality: "الجزائر", mainClub: "مانشستر سيتي" },
    { name: "ساديو ماني", infos: ["كنت جزءًا من ثلاثي ليفربول الهجومي الشهير.", "فزت بكأس الأمم الأفريقية 2021 مع السنغال.", "ألعب حاليًا في نادي النصر السعودي."], nationality: "السنغال", mainClub: "ليفربول" },
    { name: "باولو مالديني", infos: ["قضيت مسيرتي بأكملها في نادي إيه سي ميلان.", "فزت بدوري أبطال أوروبا 5 مرات.", "أعتبر من أعظم المدافعين في التاريخ."], nationality: "إيطاليا", mainClub: "إيه سي ميلان" },
    { name: "تشافي هيرنانديز", infos: ["أنا مدرب برشلونة الحالي.", "فزت بكأس العالم 2010 وكأس أوروبا مرتين مع إسبانيا.", "اشتهرت بقدرتي على التمرير الدقيق والتحكم في إيقاع اللعب."], nationality: "إسبانيا", mainClub: "برشلونة" },
    { name: "يوهان كرويف", infos: ["أنا الأب الروحي لفلسفة 'الكرة الشاملة'.", "فزت بالكرة الذهبية 3 مرات.", "لعبت ودربت أندية أياكس وبرشلونة."], nationality: "هولندا", mainClub: "أياكس" },
    { name: "دييغو مارادونا", infos: ["قُدت الأرجنتين للفوز بكأس العالم 1986.", "سجلت 'هدف القرن' و'هدف يد الرب' في نفس المباراة.", "أعتبر أسطورة في نادي نابولي الإيطالي."], nationality: "الأرجنتين", mainClub: "نابولي" },
    { name: "بيليه", infos: ["فزت بكأس العالم 3 مرات مع البرازيل.", "سجلت أكثر من 1000 هدف في مسيرتي.", "يعتبرني الكثيرون 'ملك كرة القدم'."], nationality: "البرازيل", mainClub: "سانتوس" },
    { name: "روبرت ليفاندوفسكي", infos: ["أنا الهداف التاريخي لمنتخب بولندا.", "فزت بجائزة أفضل لاعب في العالم مرتين.", "لعبت لبايرن ميونخ وبرشلونة."], nationality: "بولندا", mainClub: "بايرن ميونخ" },
    { name: "سيرجيو راموس", infos: ["أنا مدافع اشتهر بتسجيل الأهداف الحاسمة.", "فزت بدوري أبطال أوروبا 4 مرات مع ريال مدريد.", "فزت بكأس العالم وكأس أوروبا مرتين مع إسبانيا."], nationality: "إسبانيا", mainClub: "ريال مدريد" },
    { name: "مانويل نوير", infos: ["أنا حارس مرمى ألماني.", "اشتهرت بأسلوب 'الحارس الليبرو' (Sweeper-Keeper).", "فزت بكأس العالم 2014 والثلاثية مرتين مع بايرن ميونخ."], nationality: "ألمانيا", mainClub: "بايرن ميونخ" },
    { name: "آريين روبن", infos: ["اشتهرت بحركتي المميزة: القطع من اليمين والتسديد باليسار.", "لعبت في تشيلسي، ريال مدريد، وبايرن ميونخ.", "أنا من هولندا."], nationality: "هولندا", mainClub: "بايرن ميونخ" },
    { name: "فرانك ريبيري", infos: ["شكّلت ثنائيًا قويًا مع آريين روبن في بايرن ميونخ.", "أنا لاعب فرنسي.", "فزت بالثلاثية التاريخية عام 2013."], nationality: "فرنسا", mainClub: "بايرن ميونخ" },
    { name: "واين روني", infos: ["أنا الهداف التاريخي لنادي مانشستر يونايتد.", "فزت بدوري أبطال أوروبا والدوري الإنجليزي عدة مرات.", "أنا من إنجلترا."], nationality: "إنجلترا", mainClub: "مانشستر يونايتد" },
    { name: "كاكا", infos: ["فزت بالكرة الذهبية عام 2007.", "كنت آخر لاعب يفوز بها قبل حقبة ميسي ورونالدو.", "أنا لاعب برازيلي لعبت لإيه سي ميلان وريال مدريد."], nationality: "البرازيل", mainClub: "إيه سي ميلان" },
    { name: "أندريا بيرلو", infos: ["اشتهرت بقدرتي على التمرير الطويل الدقيق والركلات الحرة.", "فزت بكأس العالم 2006 مع إيطاليا.", "لعبت ليوفنتوس وإيه سي ميلان."], nationality: "إيطاليا", mainClub: "يوفنتوس" },
    { name: "ستيفن جيرارد", infos: ["أنا أسطورة نادي ليفربول.", "اشتهرت بتسديداتي القوية وقيادتي في الملعب.", "لم أفز بلقب الدوري الإنجليزي أبدًا."], nationality: "إنجلترا", mainClub: "ليفربول" },
    { name: "فرانك لامبارد", infos: ["أنا الهداف التاريخي لنادي تشيلسي رغم أنني لاعب خط وسط.", "فزت بدوري أبطال أوروبا 2012.", "أنا من إنجلترا."], nationality: "إنجلترا", mainClub: "تشيلسي" },
    { name: "ديدييه دروجبا", infos: ["أنا أسطورة نادي تشيلسي ومن ساحل العاج.", "اشتهرت بقوتي البدنية وتسجيلي في المباريات النهائية.", "سجلت ركلة الجزاء الحاسمة في نهائي دوري أبطال أوروبا 2012."], nationality: "ساحل العاج", mainClub: "تشيلسي" },
    { name: "فيرجيل فان دايك", infos: ["أنا مدافع هولندي.", "فزت بجائزة أفضل لاعب في أوروبا عام 2019.", "ألعب في نادي ليفربول."], nationality: "هولندا", mainClub: "ليفربول" },
    { name: "أنطوان جريزمان", infos: ["فزت بكأس العالم 2018 مع فرنسا.", "لعبت لأتلتيكو مدريد وبرشلونة.", "أحتفل أحيانًا برقصات من لعبة فورتنايت."], nationality: "فرنسا", mainClub: "أتلتيكو مدريد" },
    { name: "هاري كين", infos: ["أنا الهداف التاريخي لمنتخب إنجلترا ونادي توتنهام.", "ألعب حاليًا في بايرن ميونخ.", "لم أفز بأي لقب كبير في مسيرتي حتى الآن."], nationality: "إنجلترا", mainClub: "توتنهام هوتسبير" },
    { name: "سون هيونج مين", infos: ["أنا لاعب من كوريا الجنوبية.", "ألعب في نادي توتنهام هوتسبير.", "فزت بجائزة الحذاء الذهبي للدوري الإنجليزي."], nationality: "كوريا الجنوبية", mainClub: "توتنهام هوتسبير" },
    { name: "ألفونسو ديفيز", infos: ["أنا لاعب كندي اشتهر بسرعتي الكبيرة.", "ألعب في مركز الظهير الأيسر مع بايرن ميونخ.", "فزت بدوري أبطال أوروبا عام 2020."], nationality: "كندا", mainClub: "بايرن ميونخ" },
    { name: "رونالدو (الظاهرة)", infos: ["فزت بكأس العالم مرتين مع البرازيل (1994 و 2002).", "لعبت لريال مدريد وبرشلونة وإنتر ميلان وإيه سي ميلان.", "اشتهرت بسرعتي وقدرتي على المراوغة وإنهاء الهجمات."], nationality: "البرازيل", mainClub: "إنتر ميلان" },
    { name: "تييري هنري", infos: ["أنا الهداف التاريخي لنادي أرسنال.", "فزت بكأس العالم 1998 مع فرنسا.", "اشتهرت بسرعتي وأناقتي في اللعب."], nationality: "فرنسا", mainClub: "أرسنال" },
    { name: "جيانلويجي بوفون", infos: ["أنا حارس مرمى إيطالي.", "فزت بكأس العالم 2006.", "لعبت معظم مسيرتي في نادي يوفنتوس."], nationality: "إيطاليا", mainClub: "يوفنتوس" },
    { name: "فيليب لام", infos: ["كنت قائد منتخب ألمانيا الفائز بكأس العالم 2014.", "لعبت كظهير أيمن وأيسر ولاعب خط وسط.", "قضيت معظم مسيرتي في بايرن ميونخ."], nationality: "ألمانيا", mainClub: "بايرن ميونخ" },
    { name: "باستيان شفاينشتايجر", infos: ["فزت بكأس العالم 2014 مع ألمانيا.", "كنت لاعب خط وسط في بايرن ميونخ.", "لعبت أيضًا لمانشستر يونايتد."], nationality: "ألمانيا", mainClub: "بايرن ميونخ" },
    { name: "غاريث بيل", infos: ["أنا لاعب من ويلز.", "فزت بدوري أبطال أوروبا 5 مرات مع ريال مدريد.", "اشتهرت بسرعتي الفائقة وأهدافي المذهلة مثل المقصية في نهائي 2018."], nationality: "ويلز", mainClub: "ريال مدريد" },
    { name: "كريم بنزيما", infos: ["فزت بالكرة الذهبية عام 2022.", "فزت بدوري أبطال أوروبا 5 مرات مع ريال مدريد.", "ألعب حاليًا في الدوري السعودي."], nationality: "فرنسا", mainClub: "ريال مدريد" },
    { name: "مارسيلو", infos: ["أنا ظهير أيسر برازيلي.", "اشتهرت بمهاراتي الهجومية العالية.", "فزت بالعديد من الألقاب مع ريال مدريد."], nationality: "البرازيل", mainClub: "ريال مدريد" },
    { name: "توني كروس", infos: ["أنا لاعب خط وسط ألماني.", "فزت بكأس العالم 2014.", "اشتهر بدقة تمريراتي الاستثنائية."], nationality: "ألمانيا", mainClub: "ريال مدريد" },
    { name: "إيدين هازارد", infos: ["أنا لاعب بلجيكي.", "كنت نجم نادي تشيلسي لسنوات عديدة.", "انتقلت إلى ريال مدريد في صفقة كبيرة."], nationality: "بلجيكا", mainClub: "تشيلسي" },
    { name: "بول بوجبا", infos: ["فزت بكأس العالم 2018 مع فرنسا.", "عدت إلى مانشستر يونايتد في صفقة قياسية وقتها.", "اشتهر بتسريحات شعري المتغيرة."], nationality: "فرنسا", mainClub: "مانشستر يونايتد" },
    { name: "نجولو كانتي", infos: ["فزت بالدوري الإنجليزي مع ناديين مختلفين (ليستر سيتي وتشيلسي).", "فزت بكأس العالم 2018 مع فرنسا.", "اشتهر بقدرتي الهائلة على قطع الكرات والجري."], nationality: "فرنسا", mainClub: "تشيلسي" },
    { name: "لويس سواريز", infos: ["كنت جزءًا من ثلاثي MSN الهجومي في برشلونة.", "فزت بالحذاء الذهبي الأوروبي مرتين.", "أنا من الأوروغواي."], nationality: "الأوروغواي", mainClub: "برشلونة" },
    { name: "أليسون بيكر", infos: ["أنا حارس مرمى برازيلي.", "فزت بدوري أبطال أوروبا والدوري الإنجليزي مع ليفربول.", "سجلت هدفًا رأسيًا قاتلاً في الدقيقة الأخيرة."], nationality: "البرازيل", mainClub: "ليفربول" },
    { name: "دافيد سيلفا", infos: ["أنا لاعب خط وسط إسباني.", "أنا أسطورة في نادي مانشستر سيتي.", "فزت بكأس العالم وكأس أوروبا مرتين."], nationality: "إسبانيا", mainClub: "مانشستر سيتي" },
    { name: "سيرجيو أغويرو", infos: ["أنا الهداف التاريخي لنادي مانشستر سيتي.", "سجلت هدف الفوز بالدوري في الدقيقة 93:20 عام 2012.", "أنا من الأرجنتين."], nationality: "الأرجنتين", mainClub: "مانشستر سيتي" },
    { name: "فيكتور أوسيمين", infos: ["قُدت نابولي للفوز بالدوري الإيطالي لأول مرة منذ عقود.", "أنا مهاجم نيجيري.", "اشتهر بارتداء قناع واقٍ على وجهي."], nationality: "نيجيريا", mainClub: "نابولي" },
    { name: "خفيتشا كفاراتسخيليا", infos: ["أنا لاعب من جورجيا.", "لقبت بـ 'كفارادونا' بعد تألقي مع نابولي.", "فزت بالدوري الإيطالي في أول موسم لي."], nationality: "جورجيا", mainClub: "نابولي" },
    { name: "جود بيلينجهام", infos: ["انتقلت إلى ريال مدريد في سن مبكرة وتألقت فورًا.", "أنا لاعب خط وسط إنجليزي.", "بدأت مسيرتي في نادي برمنغهام سيتي."], nationality: "إنجلترا", mainClub: "ريال مدريد" },
    { name: "بوكايو ساكا", infos: ["أنا لاعب شاب في نادي أرسنال ومنتخب إنجلترا.", "ألعب في مركز الجناح.", "اشتهرت بقدرتي على المراوغة وصناعة الأهداف."], nationality: "إنجلترا", mainClub: "أرسنال" }

];

// --- Config ---
const levels = [ { name: "مبتدئ", minScore: 0 }, { name: "هاوٍ", minScore: 500 }, { name: "محترف", minScore: 1500 }, { name: "خبير", minScore: 4000 }, { name: "أسطورة", minScore: 10000 } ];
const POWERUP_COSTS = { '5050': 15, 'nation': 20, 'club': 25, 'hint': 30 };
const INITIAL_CASH = 100;
const QUESTION_TIME = 20;
const CHALLENGE_MODE_DURATION = 60;

// --- Game State ---
let gameMode = 'normal', currentQuestion = {}, currentInfoIndex = 0, score = 0, potentialPoints = 30, streak = 0, cash = 0;
let normalHighScore = 0, challengeHighScore = 0, bestStreak = 0, powerupsUsedCount = 0, usedPlayerIndices = [], questionTimer, mainTimer;

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const playBtn = document.getElementById('play-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const settingsBtn = document.getElementById('settings-btn');
const gameModeDisplay = document.getElementById('game-mode-display');
const mainTimerDisplay = document.getElementById('main-timer-display');
const scoreDisplay = document.getElementById('score-display');
const cashDisplay = document.getElementById('cash-display');
const infoBoxEl = document.getElementById('info-box');
const nextInfoBtn = document.getElementById('next-info-btn');
const choicesEl = document.getElementById('choices');
const resultOverlayEl = document.getElementById('result-overlay');
const resultTextEl = document.getElementById('result-text');
const finalScoreEl = document.getElementById('final-score');
const finalScoreLabel = document.getElementById('final-score-label');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
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
    startScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    endScreen.classList.add('hidden');
}

function startGame(mode) {
    gameMode = mode;
    score = 0; streak = 0; cash = INITIAL_CASH; bestStreak = 0; powerupsUsedCount = 0; usedPlayerIndices = [];
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
        if (timeLeft <= 0) { clearInterval(mainTimer); clearInterval(questionTimer); endGame(); }
    }, 1000);
}

function endGame() {
    clearInterval(mainTimer); clearInterval(questionTimer);
    if (gameMode === 'normal') {
        if (score > normalHighScore) { normalHighScore = score; localStorage.setItem('knowThePlayerNormalHighScore', normalHighScore); }
    } else {
        if (score > challengeHighScore) { challengeHighScore = score; localStorage.setItem('knowThePlayerChallengeHighScore', challengeHighScore); }
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
        clearInterval(questionTimer);
        playSound('wrong');
        const msg = gameMode === 'normal' ? `انتهى الوقت! اللاعب هو: ${currentQuestion.name}` : `انتهى الوقت!`;
        showResult(false, msg);
        setTimeout(() => { resultOverlayEl.style.display = 'none'; gameMode === 'normal' ? endGame() : loadQuestion(); }, gameMode === 'normal' ? 2500 : 2000);
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
    currentInfoIndex = 0; potentialPoints = 30; infoBoxEl.innerHTML = ''; choicesEl.innerHTML = ''; nextInfoBtn.disabled = false;
    Object.values(powerups).forEach(btn => btn.disabled = false);
    updateUI();
}

function displayInfo(infoText) {
    const info = document.createElement('p');
    info.innerHTML = infoText || `- ${currentQuestion.infos[currentInfoIndex]}`;
    info.classList.add('fade-in');
    infoBoxEl.appendChild(info);
}

function createChoices() {
    const choices = [currentQuestion.name];
    const otherPlayers = db.filter(player => player.name !== currentQuestion.name);
    while (choices.length < 3 && otherPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherPlayers.length);
        choices.push(otherPlayers.splice(randomIndex, 1)[0].name);
    }
    choices.sort(() => Math.random() - 0.5);
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
    const isCorrect = selectedChoice === currentQuestion.name;
    if (isCorrect) {
        playSound('correct');
        streak++;
        if (streak > bestStreak) { bestStreak = streak; }
        const earnedCash = Math.floor(potentialPoints / 10);
        if (gameMode === 'normal') { score += potentialPoints; } else { score++; }
        cash += earnedCash;
        let resultMsg = `إجابة صحيحة!`;
        if (gameMode === 'normal') resultMsg += ` +${potentialPoints} نقطة`;
        resultMsg += ` | +${earnedCash} نقود`;
        showResult(true, resultMsg);
        setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 1500);
    } else {
        playSound('wrong');
        streak = 0;
        const msg = gameMode === 'normal' ? `إجابة خاطئة! اللاعب هو: ${currentQuestion.name}` : `إجابة خاطئة!`;
        showResult(false, msg);
        setTimeout(() => { resultOverlayEl.style.display = 'none'; gameMode === 'normal' ? endGame() : loadQuestion(); }, gameMode === 'normal' ? 2500 : 1500);
    }
}

function showResult(isCorrect, text) {
    resultTextEl.textContent = text;
    resultOverlayEl.className = isCorrect ? 'result-overlay correct' : 'result-overlay wrong';
    resultOverlayEl.style.display = 'flex';
}

function updateUI() {
    scoreDisplay.textContent = `🏆 ${score}`;
    cashDisplay.textContent = `💲 ${cash}`;
    Object.entries(powerups).forEach(([key, btn]) => { if (!btn.disabled) { btn.disabled = cash < POWERUP_COSTS[key]; } });
    if (gameMode === 'normal') {
        let currentLevel = levels.filter(l => score >= l.minScore).pop() || levels[0];
        let nextLevel = levels[levels.indexOf(currentLevel) + 1];
        playerLevelEl.textContent = currentLevel.name;
        progressBarEl.style.width = nextLevel ? `${((score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100}%` : '100%';
    }
}

// --- Event Listeners ---
playBtn.addEventListener('click', () => { playSound('click'); startGame('normal'); });
leaderboardBtn.addEventListener('click', () => { playSound('click'); alert("لوحة المتصدرين - سيتم إضافتها قريبًا!"); });
settingsBtn.addEventListener('click', () => { playSound('click'); alert("الإعدادات - سيتم إضافتها قريبًا!"); });
nextInfoBtn.addEventListener('click', () => {
    playSound('click');
    currentInfoIndex++;
    if (currentInfoIndex < currentQuestion.infos.length) {
        displayInfo();
        potentialPoints = (currentInfoIndex === 1) ? 20 : 10;
        updateUI();
        if (currentInfoIndex === 2) { nextInfoBtn.disabled = true; }
    }
});
Object.entries(powerups).forEach(([key, btn]) => {
    btn.addEventListener('click', () => {
        const cost = POWERUP_COSTS[key];
        if (btn.disabled && cash < cost) return;
        if (cash >= cost) {
            playSound('click');
            cash -= cost; powerupsUsedCount++; btn.disabled = true;
            switch (key) {
                case '5050':
                    const wrongChoice = Array.from(choicesEl.children).find(b => !b.disabled && b.textContent !== currentQuestion.name);
                    if (wrongChoice) wrongChoice.disabled = true;
                    break;
                case 'nation': displayInfo(`<b>تلميح:</b> جنسية اللاعب هي ${currentQuestion.nationality}`); break;
                case 'club': displayInfo(`<b>تلميح:</b> من أبرز الأندية التي لعب لها ${currentQuestion.mainClub}`); break;
                case 'hint': displayInfo(`<b>تلميح:</b> اسم اللاعب يبدأ بحرف '${currentQuestion.name[0]}'`); break;
            }
            updateUI();
        } else { playSound('wrong'); }
    });
});
restartBtn.addEventListener('click', () => { playSound('click'); startGame(gameMode); });
backToMenuBtn.addEventListener('click', () => { playSound('click'); initGame(); });
shareBtn.addEventListener('click', () => {
    playSound('click');
    const gameUrl = "https://alihhhhyyyyyyyy.github.io/Fotball-qWiz-/";
    const modeText = gameMode === 'normal' ? "الوضع العادي" : "تحدي الـ 60 ثانية";
    const scoreText = gameMode === 'normal' ? `${score} نقطة` : `${score} إجابة صحيحة`;
    const shareText = `🏆 لقد حققت ${scoreText} في لعبة "اعرف اللاعب" (${modeText})! \n\nهل يمكنك التفوق عليّ؟ 🤔\n\nالعب الآن: ${gameUrl}`;
    navigator.clipboard.writeText(shareText).then(() => {
        shareBtn.textContent = "✅ تم النسخ!";
        setTimeout(() => { shareBtn.textContent = "🏆 مشاركة النتيجة"; }, 2000);
    }).catch(err => { console.error('Failed to copy: ', err); });
});

// --- Initial Load ---
initGame();
