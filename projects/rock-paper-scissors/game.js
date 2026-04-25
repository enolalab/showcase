// ===== Rock Paper Scissors — AI Camera Game =====
(function () {
  'use strict';

  // ---- Emojis & Choices ----
  const CHOICES = { rock: '✊', scissors: '✌️', paper: '✋' };
  const CHOICE_KEYS = ['rock', 'scissors', 'paper'];
  const WINS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
  const LABELS_VI = { rock: 'Búa', scissors: 'Kéo', paper: 'Bao' };

  // ---- State ----
  let mode = null; // 'camera' | 'manual'
  let scorePlayer = 0;
  let scoreCpu = 0;
  let round = 1;
  let isPlaying = false;
  let cameraReady = false;
  let mpHands = null;
  let mpCamera = null;
  let lastDetectedGesture = null;

  // ---- DOM ----
  const $ = (id) => document.getElementById(id);
  const titleScreen = $('title-screen');
  const gameScreen = $('game-screen');
  const playerGesture = $('player-gesture');
  const cpuGesture = $('cpu-gesture');
  const resultEl = $('result');
  const resultText = $('result-text');
  const scorePlayerEl = $('score-player');
  const scoreCpuEl = $('score-cpu');
  const roundNumEl = $('round-num');
  const vsText = $('vs-text');
  const countdownEl = $('countdown');
  const cameraWrap = $('camera-wrap');
  const cameraVideo = $('camera-video');
  const cameraCanvas = $('camera-canvas');
  const cameraStatus = $('camera-status');
  const manualControls = $('manual-controls');
  const cameraControls = $('camera-controls');
  const btnShoot = $('btn-shoot');

  // ---- Screen transitions ----
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  // ---- Init Menu ----
  $('btn-camera').addEventListener('click', () => startGame('camera'));
  $('btn-manual').addEventListener('click', () => startGame('manual'));
  $('btn-back').addEventListener('click', backToMenu);

  function startGame(m) {
    mode = m;
    scorePlayer = 0;
    scoreCpu = 0;
    round = 1;
    updateScores();
    resetArena();
    showScreen(gameScreen);

    if (mode === 'camera') {
      cameraWrap.style.display = 'block';
      cameraControls.style.display = 'flex';
      manualControls.style.display = 'none';
      initCamera();
    } else {
      cameraWrap.style.display = 'none';
      cameraControls.style.display = 'none';
      manualControls.style.display = 'flex';
    }
  }

  function backToMenu() {
    stopCamera();
    showScreen(titleScreen);
    mode = null;
  }

  // ---- Camera & MediaPipe ----
  function initCamera() {
    cameraStatus.textContent = 'Đang tải AI model...';
    cameraStatus.classList.remove('hidden');

    const canvasCtx = cameraCanvas.getContext('2d');

    mpHands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    mpHands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    mpHands.onResults((results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
      canvasCtx.drawImage(results.image, 0, 0, cameraCanvas.width, cameraCanvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawHandLandmarks(canvasCtx, landmarks);
        lastDetectedGesture = detectGesture(landmarks);

        if (!cameraReady) {
          cameraReady = true;
          cameraStatus.classList.add('hidden');
        }
      } else {
        lastDetectedGesture = null;
      }

      canvasCtx.restore();
    });

    mpCamera = new Camera(cameraVideo, {
      onFrame: async () => {
        cameraCanvas.width = cameraVideo.videoWidth || 320;
        cameraCanvas.height = cameraVideo.videoHeight || 240;
        await mpHands.send({ image: cameraVideo });
      },
      width: 320,
      height: 240,
    });

    mpCamera.start().then(() => {
      cameraStatus.textContent = 'Giơ tay trước camera...';
    }).catch((err) => {
      console.error('Camera error:', err);
      cameraStatus.textContent = '⚠️ Không thể truy cập camera';
    });
  }

  function stopCamera() {
    if (mpCamera) {
      mpCamera.stop();
      mpCamera = null;
    }
    if (mpHands) {
      mpHands.close();
      mpHands = null;
    }
    cameraReady = false;
    lastDetectedGesture = null;
  }

  // ---- Hand Landmark Drawing ----
  function drawHandLandmarks(ctx, landmarks) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Connections
    const connections = [
      [0,1],[1,2],[2,3],[3,4],       // Thumb
      [0,5],[5,6],[6,7],[7,8],       // Index
      [0,9],[9,10],[10,11],[11,12],   // Middle
      [0,13],[13,14],[14,15],[15,16], // Ring
      [0,17],[17,18],[18,19],[19,20], // Pinky
      [5,9],[9,13],[13,17],           // Palm
    ];

    ctx.strokeStyle = 'rgba(124,108,255,0.6)';
    ctx.lineWidth = 2;
    connections.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
      ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      ctx.stroke();
    });

    // Dots
    landmarks.forEach((lm, i) => {
      const x = lm.x * w;
      const y = lm.y * h;
      ctx.beginPath();
      ctx.arc(x, y, i === 0 ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(i) ? '#ff6b8a' : '#7c6cff';
      ctx.fill();
    });
  }

  // ---- Gesture Detection ----
  function detectGesture(landmarks) {
    // Finger tip & pip landmarks
    const tips = [8, 12, 16, 20];  // Index, Middle, Ring, Pinky tips
    const pips = [6, 10, 14, 18];  // Index, Middle, Ring, Pinky PIPs

    // Check if finger is extended: tip is above (lower y) pip
    const fingersUp = tips.map((tip, i) => landmarks[tip].y < landmarks[pips[i]].y);

    // Thumb: tip.x vs ip.x (depends on hand orientation)
    const thumbUp = Math.abs(landmarks[4].x - landmarks[3].x) > 0.04 &&
                    (landmarks[4].x < landmarks[3].x || landmarks[4].x > landmarks[3].x);

    const openFingers = fingersUp.filter(Boolean).length;

    // Rock: all fingers closed (0 or 1 open, including possible thumb)
    if (openFingers <= 1 && !fingersUp[0] && !fingersUp[1]) {
      return 'rock';
    }

    // Scissors: index + middle open, ring + pinky closed
    if (fingersUp[0] && fingersUp[1] && !fingersUp[2] && !fingersUp[3]) {
      return 'scissors';
    }

    // Paper: all fingers open (3+)
    if (openFingers >= 3) {
      return 'paper';
    }

    // Default to paper if most fingers up, scissors if 2, rock if few
    if (openFingers >= 3) return 'paper';
    if (openFingers === 2) return 'scissors';
    return 'rock';
  }

  // ---- Game Logic ----
  function cpuChoice() {
    return CHOICE_KEYS[Math.floor(Math.random() * 3)];
  }

  function judge(player, cpu) {
    if (player === cpu) return 'draw';
    return WINS[player] === cpu ? 'win' : 'lose';
  }

  async function playRound(playerChoice) {
    if (isPlaying) return;
    isPlaying = true;

    // Reset
    resultEl.style.display = 'none';
    playerGesture.className = 'arena-gesture';
    cpuGesture.className = 'arena-gesture';

    // Countdown
    vsText.style.display = 'none';
    countdownEl.style.display = 'block';

    for (let i = 3; i >= 1; i--) {
      countdownEl.textContent = i;
      countdownEl.style.animation = 'none';
      void countdownEl.offsetWidth;
      countdownEl.style.animation = 'countPop .4s ease-out';

      // Shake gestures during countdown
      playerGesture.textContent = CHOICES[CHOICE_KEYS[i % 3]];
      cpuGesture.textContent = CHOICES[CHOICE_KEYS[(i + 1) % 3]];

      await sleep(600);
    }

    countdownEl.style.display = 'none';
    vsText.style.display = 'block';

    // Get CPU choice
    const cpu = cpuChoice();

    // Show results
    playerGesture.textContent = CHOICES[playerChoice];
    cpuGesture.textContent = CHOICES[cpu];

    // Shake animation
    playerGesture.classList.add('shake');
    cpuGesture.classList.add('shake');
    await sleep(400);

    // Judge
    const outcome = judge(playerChoice, cpu);

    playerGesture.classList.remove('shake');
    cpuGesture.classList.remove('shake');

    if (outcome === 'win') {
      scorePlayer++;
      playerGesture.classList.add('win');
      cpuGesture.classList.add('lose');
      showResult('🎉 Bạn thắng!', 'win');
    } else if (outcome === 'lose') {
      scoreCpu++;
      playerGesture.classList.add('lose');
      cpuGesture.classList.add('win');
      showResult('😢 Bạn thua!', 'lose');
    } else {
      playerGesture.classList.add('draw');
      cpuGesture.classList.add('draw');
      showResult('🤝 Hoà!', 'draw');
    }

    updateScores();
    round++;
    roundNumEl.textContent = round;
    isPlaying = false;
  }

  function showResult(text, type) {
    resultText.textContent = text;
    resultText.className = 'result-text ' + type;
    resultEl.style.display = 'block';
  }

  function resetArena() {
    playerGesture.textContent = '❓';
    cpuGesture.textContent = '❓';
    playerGesture.className = 'arena-gesture';
    cpuGesture.className = 'arena-gesture';
    resultEl.style.display = 'none';
    roundNumEl.textContent = '1';
    vsText.style.display = 'block';
    countdownEl.style.display = 'none';
  }

  function updateScores() {
    scorePlayerEl.textContent = scorePlayer;
    scoreCpuEl.textContent = scoreCpu;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ---- Manual Mode Controls ----
  manualControls.addEventListener('click', (e) => {
    const btn = e.target.closest('.choice-btn');
    if (!btn) return;
    playRound(btn.dataset.choice);
  });

  // ---- Camera Mode Controls ----
  btnShoot.addEventListener('click', () => {
    if (!lastDetectedGesture) {
      cameraStatus.textContent = '⚠️ Không phát hiện tay — hãy giơ tay lên!';
      cameraStatus.classList.remove('hidden');
      setTimeout(() => {
        if (cameraReady) cameraStatus.classList.add('hidden');
      }, 2000);
      return;
    }
    playRound(lastDetectedGesture);
  });

  // Keyboard shortcut: Space to shoot
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && mode === 'camera' && gameScreen.classList.contains('active')) {
      e.preventDefault();
      btnShoot.click();
    }
    // Manual shortcuts: 1=rock, 2=scissors, 3=paper
    if (mode === 'manual' && gameScreen.classList.contains('active') && !isPlaying) {
      if (e.key === '1') playRound('rock');
      if (e.key === '2') playRound('scissors');
      if (e.key === '3') playRound('paper');
    }
    // Escape to go back
    if (e.key === 'Escape') backToMenu();
  });
})();
