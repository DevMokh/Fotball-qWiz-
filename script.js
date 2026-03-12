let current = 0, score = 0, coins = 100, lives = 3, streak = 0, timer;

function showScreen(id) {
  document.querySelectorAll('.game > div').forEach(d => d.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function startNormalGame() {
  current = 0; score = 0; lives = 3;
  showScreen('play');
  nextQuestion();
}

function nextQuestion() {
  if (current >= questions.length) { endGame(); return; }
  document.getElementById('question').textContent = questions[current].q;
  const choices = document.getElementById('choices');
  choices.innerHTML = '';
  questions[current].a.forEach((ans, i) => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(i === questions[current].c, btn);
    choices.appendChild(btn);
  });
  document.getElementById('feedback').textContent = '';
  startTimer(25);
}

function checkAnswer(correct, btn) {
  clearInterval(timer);
  document.querySelectorAll('.choice').forEach(b => b.onclick = null);
  if (correct) {
    score += 10; streak++; coins += 5;
    btn.classList.add('correct');
    document.getElementById('feedback').textContent = 'صحيح! ✅';
  } else {
    lives--; streak = 0;
    btn.classList.add('wrong');
    document.getElementById('feedback').textContent = 'خطأ! الصح: ' + questions[current].a[questions[current].c];
  }
  document.getElementById('score').textContent = score;
  document.getElementById('coins').textContent = coins;
  document.getElementById('lives').textContent = lives;
  document.getElementById('streak').textContent = streak;
  current++;
  setTimeout(nextQuestion, 2000);
}

function startTimer(seconds) {
  let time = seconds;
  document.getElementById('timer-bar').style.width = '100%';
  timer = setInterval(() => {
    time--;
    document.getElementById('timer-bar').style.width = (time/seconds*100) + '%';
    if (time <= 0) {
      lives--;
      document.getElementById('lives').textContent = lives;
      current++;
      nextQuestion();
    }
  }, 1000);
}

function useHint() {
  if (coins >= 30) {
    coins -= 30;
    document.getElementById('coins').textContent = coins;
    document.getElementById('feedback').textContent = 'تلميح: ' + questions[current].h;
  }
}

function endGame() {
  clearInterval(timer);
  document.getElementById('finalScore').textContent = score;
  showScreen('end');
}

// بدء اللعبة
startNormalGame();
