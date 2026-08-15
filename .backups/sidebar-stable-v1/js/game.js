/**
 * CYBER ARCADE PORTAL ENGINE with GLOBAL LEADERBOARDS
 * Manages State, Dashboard, Cyber Flyer Game, Stroop Crisis Game, Alias Registration, and Synthetic Leaderboards.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements - Global
  const tab = document.getElementById("game-tab");
  const panel = document.getElementById("game-panel");
  const closeBtn = document.getElementById("close-game-btn");
  const preScreen = document.getElementById("game-pre-screen");
  const btnBacks = document.querySelectorAll(".btn-back-arcade");

  // High Scores Display
  const flyerHighScoreEl = document.getElementById("flyer-high-score");
  const stroopHighScoreEl = document.getElementById("stroop-high-score");

  // DOM Elements - Alias & Leaderboard
  const btnViewLeaderboards = document.getElementById("btn-view-leaderboards");
  const leaderboardsScreen = document.getElementById("leaderboards-screen");
  const lbTabs = document.querySelectorAll(".lb-tab");
  const lbBody = document.getElementById("leaderboard-body");
  const aliasModal = document.getElementById("alias-modal");
  const aliasInput = document.getElementById("alias-input");
  const btnSaveAlias = document.getElementById("btn-save-alias");

  // --- DRAGGABLE TAB LOGIC ---
  if (tab) {
    let isDragging = false;
    let hasDragged = false;
    let startY = 0;
    let initialTop = 0;

    const onStart = (y) => {
      isDragging = true;
      hasDragged = false;
      startY = y;
      const rect = tab.getBoundingClientRect();
      initialTop = rect.top;
      tab.style.transition = "none";
    };

    const onMove = (y) => {
      if (!isDragging) return;
      const dy = y - startY;
      if (Math.abs(dy) > 5) hasDragged = true;
      let newTop = initialTop + dy;

      if (newTop < 0) newTop = 0;
      if (newTop + tab.offsetHeight > window.innerHeight)
        newTop = window.innerHeight - tab.offsetHeight;

      tab.style.top = newTop + "px";
      tab.style.transform = "none";
    };

    const onEnd = () => {
      if (isDragging) {
        isDragging = false;
        tab.style.transition = "";
      }
    };

    tab.addEventListener("mousedown", (e) => {
      if (e.target.closest("#game-tab")) onStart(e.clientY);
    });
    document.addEventListener("mousemove", (e) => onMove(e.clientY));
    document.addEventListener("mouseup", () => onEnd());

    tab.addEventListener("touchstart", (e) => {
      if (e.target.closest("#game-tab")) onStart(e.touches[0].clientY);
    });
    document.addEventListener(
      "touchmove",
      (e) => {
        if (isDragging) onMove(e.touches[0].clientY);
      },
      { passive: true },
    );
    document.addEventListener("touchend", () => onEnd());

    // Prevent click if dragged
    tab.addEventListener(
      "click",
      (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  }

  // DOM Elements - Cyber Flyer
  const btnStartFlyer = document.getElementById("btn-start-flyer");
  const flyerArena = document.getElementById("cyber-flyer-arena");
  const flyerCanvas = document.getElementById("flyer-canvas");
  const flyerCtx = flyerCanvas.getContext("2d");
  const flyerCurrentScoreEl = document.getElementById("flyer-current-score");
  const flyerGameOver = document.getElementById("flyer-game-over");
  const flyerFinalScoreEl = document.getElementById("flyer-final-score");
  const flyerNewRecord = document.getElementById("flyer-new-record");
  const btnRetryFlyer = document.getElementById("btn-retry-flyer");

  // DOM Elements - Stroop Crisis
  const btnStartStroop = document.getElementById("btn-start-stroop");
  const stroopArena = document.getElementById("stroop-crisis-arena");
  const stroopWordEl = document.getElementById("stroop-word");
  const stroopOptionsEl = document.getElementById("stroop-options");
  const timerBar = document.getElementById("game-timer-bar");
  const currentRoundEl = document.getElementById("current-round");
  const comboTracker = document.getElementById("combo-tracker");
  const comboCountEl = document.getElementById("combo-count");
  const timeoutOverlay = document.getElementById("timeout-overlay");

  const stroopGameOver = document.getElementById("stroop-game-over");
  const finalAccuracyEl = document.getElementById("final-accuracy");
  const finalLatencyEl = document.getElementById("final-latency");
  const stroopNewRecord = document.getElementById("stroop-new-record");
  const btnRetryStroop = document.getElementById("btn-retry-stroop");

  // --- GLOBALS & STATE ---
  let currentState = "DASHBOARD"; // DASHBOARD, FLYER, STROOP, LEADERBOARDS
  let playerAlias = localStorage.getItem("arcade_alias") || null;
  let pendingGameStart = null; // Used to resume game after alias modal

  // --- WEB AUDIO API (Retro SFX) ---
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx;

  function playTone(freq, type, duration, vol = 0.1) {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  const SFX = {
    coin: () => {
      playTone(987.77, "square", 0.1, 0.05); // B5
      setTimeout(() => playTone(1318.51, "square", 0.3, 0.05), 100); // E6
    },
    jump: () => playTone(300, "sine", 0.2, 0.05),
    score: () => playTone(800, "square", 0.1, 0.05),
    crash: () => {
      playTone(150, "sawtooth", 0.3, 0.1);
      setTimeout(() => playTone(100, "square", 0.4, 0.1), 100);
    },
    win: () => {
      // Fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, "square", 0.2, 0.1), i * 150);
      });
    },
  };

  // --- SYNTHETIC LEADERBOARDS ---
  let leaderboards = {
    flyer: JSON.parse(localStorage.getItem("lb_flyer")) || [],
    stroop: JSON.parse(localStorage.getItem("lb_stroop")) || [],
  };

  const INDIAN_NAMES = [
    "AARAV_07",
    "SNEHA_PRO",
    "RAHUL_HKS",
    "PRIYA_NEO",
    "VIKRAM_X",
    "ANANYA_99",
    "ROHAN_CYBER",
    "KAVYA_Z",
    "ADITYA_NET",
    "ISHA_001",
    "KUNAL_BOT",
    "NEHA_SYS",
    "VARUN_ARC",
    "MEGHA_X",
    "KARAN_OP",
    "SHREYA_V",
    "DEV_NULL",
    "POOJA_EXE",
    "YASH_ROOT",
    "RITIKA_AI",
  ];

  function generateSyntheticData() {
    // If data exists, check if it's using the old high scores. If so, wipe it so we can regenerate.
    if (leaderboards.flyer.length > 0 && leaderboards.flyer[0].score > 12) {
      leaderboards.flyer = [];
      leaderboards.stroop = [];
    }

    if (leaderboards.flyer.length === 0) {
      let fData = [];
      let sData = [];
      for (let i = 0; i < 25; i++) {
        const name =
          INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)] +
          Math.floor(Math.random() * 99);
        // Flyer Score: max 11 or 12
        fData.push({
          alias: name,
          score: Math.floor(Math.random() * 11) + 2,
          isUser: false,
        });
        // Stroop Score: lowered to make it easier (acc 4 to 6, high latency)
        const acc = Math.floor(Math.random() * 3) + 4; // 4 to 6
        const lat = Math.floor(Math.random() * 400) + 1200; // 1200ms to 1600ms
        sData.push({ alias: name, acc: acc, lat: lat, isUser: false });
      }
      leaderboards.flyer = fData.sort((a, b) => b.score - a.score);
      leaderboards.stroop = sData.sort((a, b) =>
        b.acc === a.acc ? a.lat - b.lat : b.acc - a.acc,
      );

      localStorage.setItem("lb_flyer", JSON.stringify(leaderboards.flyer));
      localStorage.setItem("lb_stroop", JSON.stringify(leaderboards.stroop));
    }
  }

  function getCombinedLeaderboard() {
    // Neural Grandmasters Algorithm
    // Normalizes Flyer and Stroop scores into an 'Arcade Power Score'
    let players = {};

    // Add Flyer points
    leaderboards.flyer.forEach((p) => {
      if (!players[p.alias])
        players[p.alias] = {
          alias: p.alias,
          flyerScore: 0,
          stroopScore: 0,
          isUser: p.isUser,
        };
      players[p.alias].flyerScore = p.score * 10; // e.g. 50 score = 500 pts
    });

    // Add Stroop points
    leaderboards.stroop.forEach((p) => {
      if (!players[p.alias])
        players[p.alias] = {
          alias: p.alias,
          flyerScore: 0,
          stroopScore: 0,
          isUser: p.isUser,
        };
      // Base accuracy pts + latency bonus
      let sPts = p.acc * 100 + Math.max(0, 1500 - p.lat);
      players[p.alias].stroopScore = sPts;
    });

    let combined = Object.values(players).map((p) => {
      return {
        alias: p.alias,
        score: Math.round(p.flyerScore + p.stroopScore),
        isUser: p.isUser,
      };
    });

    // Remove single-game players for grandmaster list? Or just sort. We'll just sort.
    return combined.sort((a, b) => b.score - a.score).slice(0, 25);
  }

  function renderLeaderboard(type) {
    lbBody.innerHTML = "";
    let data = [];
    if (type === "flyer") data = leaderboards.flyer.slice(0, 25);
    else if (type === "stroop") data = leaderboards.stroop.slice(0, 25);
    else if (type === "combined") data = getCombinedLeaderboard();

    data.forEach((entry, idx) => {
      const tr = document.createElement("tr");
      if (idx === 0) tr.className = "rank-1";
      else if (idx === 1) tr.className = "rank-2";
      else if (idx === 2) tr.className = "rank-3";

      if (entry.isUser) tr.classList.add("current-user-row");

      let scoreStr = "";
      if (type === "stroop") scoreStr = `${entry.acc}/10 (${entry.lat}ms)`;
      else scoreStr = entry.score.toString();

      tr.innerHTML = `
        <td>#${idx + 1}</td>
        <td>${entry.alias}</td>
        <td>${scoreStr}</td>
      `;
      lbBody.appendChild(tr);
    });
  }

  // --- ALIAS LOGIC ---
  const arcadeUserModal = document.getElementById("arcade-user-modal");
  const arcadeRegName = document.getElementById("arcade-reg-name");
  const arcadeRegId = document.getElementById("arcade-reg-id");
  const btnSubmitRegistration = document.getElementById(
    "btn-submit-registration",
  );

  function requireAlias(callback) {
    if (playerAlias) {
      SFX.coin();
      callback();
    } else {
      pendingGameStart = callback;
      if (arcadeUserModal) {
        arcadeUserModal.style.display = "flex";
      }
    }
  }

  if (btnSubmitRegistration) {
    btnSubmitRegistration.addEventListener("click", () => {
      const nameVal = arcadeRegName.value.trim().toUpperCase();
      const idVal = arcadeRegId.value.trim();

      if (nameVal.length > 1 && idVal.length > 0) {
        // Random Category Assignment
        const categories = ["Ryujin", "Mawu", "Nymph", "Ukupanipo"];
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        playerAlias = `${nameVal} (${idVal}) - ${randomCategory}`;
        localStorage.setItem("arcade_alias", playerAlias);

        arcadeUserModal.style.display = "none";
        updatePlayerHUD();
        SFX.coin();
        if (pendingGameStart) {
          pendingGameStart();
          pendingGameStart = null;
        }
      } else {
        alert("Please enter a valid Name and Unique ID.");
      }
    });
  }

  function updatePlayerHUD() {
    // Add HUD element if it doesn't exist
    let hud = document.getElementById("arcade-player-hud");
    if (!hud && playerAlias) {
      hud = document.createElement("div");
      hud.id = "arcade-player-hud";
      hud.style.position = "absolute";
      hud.style.bottom = "10px";
      hud.style.right = "15px";
      hud.style.color = "var(--cyan)";
      hud.style.fontFamily = "var(--font-mono)";
      hud.style.fontSize = "12px";
      hud.style.opacity = "0.7";
      hud.style.pointerEvents = "none";
      hud.style.zIndex = "1000";
      document.getElementById("game-panel").appendChild(hud);
    }
    if (hud && playerAlias) {
      hud.textContent = `PLAYER: ${playerAlias}`;
    }
  }

  // Initialize HUD on load if user exists
  if (playerAlias) updatePlayerHUD();

  // --- UI FLOW ---
  function openPanel() {
    generateSyntheticData();
    document.body.classList.add("game-open");
    loadTelemetry();
    showScreen("DASHBOARD");
  }

  function closePanel() {
    document.body.classList.remove("game-open");
    shutdownAllEngines();
  }

  function showScreen(screenType) {
    shutdownAllEngines();
    currentState = screenType;
    preScreen.style.display = "none";
    flyerArena.style.display = "none";
    stroopArena.style.display = "none";
    leaderboardsScreen.style.display = "none";
    const sudokuArena = document.getElementById("sudoku-matrix-arena");
    if (sudokuArena) sudokuArena.style.display = "none";
    const mineArena = document.getElementById("minesweeper-arena");
    if (mineArena) mineArena.style.display = "none";

    if (screenType === "DASHBOARD") preScreen.style.display = "flex";
    if (screenType === "LEADERBOARDS") {
      leaderboardsScreen.style.display = "flex";
      renderLeaderboard("flyer");
    }
    if (screenType === "FLYER") {
      flyerArena.style.display = "flex";
      initFlyer();
    }
    if (screenType === "STROOP") {
      stroopArena.style.display = "flex";
      initStroop();
    }
    if (screenType === "SUDOKU") {
      if (sudokuArena) {
        sudokuArena.style.display = "flex";
        // Always start/restart puzzle when entering sudoku
        if (
          window.SudokuGame &&
          typeof window.SudokuGame.startNewGame === "function"
        ) {
          window.SudokuGame.startNewGame("easy");
        }
      }
    }
    if (screenType === "MINESWEEPER") {
      if (mineArena) {
        mineArena.style.display = "flex";
        if (
          window.MinesweeperGame &&
          typeof window.MinesweeperGame.startNewGame === "function"
        ) {
          window.MinesweeperGame.startNewGame("easy");
        }
      }
    }
  }

  function shutdownAllEngines() {
    stopFlyerEngine();
    stopStroopEngine();
    flyerGameOver.style.display = "none";
    stroopGameOver.style.display = "none";
    if (
      window.SudokuGame &&
      typeof window.SudokuGame.stopTimer === "function"
    ) {
      window.SudokuGame.stopTimer();
    }
    if (
      window.MinesweeperGame &&
      typeof window.MinesweeperGame.stopTimer === "function"
    ) {
      window.MinesweeperGame.stopTimer();
    }
    stroopArena.classList.remove("shake-hard");
    flyerArena.classList.remove("shake-hard");
    timeoutOverlay.style.display = "none";

    // Remove any congrats overlays
    const existingCongrats = document.querySelectorAll(".leaderboard-congrats");
    existingCongrats.forEach((e) => e.remove());
  }

  // Particle System (Shared Canvas FX)
  let particles = [];
  let floatingTexts = [];

  class Particle {
    constructor(x, y, color, speed, size) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
      this.size = size;
      this.life = 1;
      this.decay = 0.02 + Math.random() * 0.03;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.globalAlpha = 1;
    }
  }

  class FloatingText {
    constructor(x, y, text, color) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.life = 1;
      this.vy = -1;
    }
    update() {
      this.y += this.vy;
      this.life -= 0.02;
    }
    draw(ctx) {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.font = "bold 20px Orbitron";
      ctx.fillText(this.text, this.x, this.y);
      ctx.globalAlpha = 1;
    }
  }

  function createExplosion(x, y, color, ctx) {
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(x, y, color, 10, Math.random() * 5 + 2));
    }
  }

  function showCongratsOverlay(parent, msg) {
    const div = document.createElement("div");
    div.className = "leaderboard-congrats";
    div.innerHTML = `<h1>${msg}</h1>`;
    parent.appendChild(div);
  }

  /* =======================================================
     GAME 1: CYBER FLYER
     ======================================================= */
  let flyerAnimId = null;
  let flyerActive = false;

  const flyer = {
    x: 100,
    y: 250,
    size: 15,
    vy: 0,
    gravity: 0.5,
    jumpPower: -8,
    color: "#00E5FF",
  };

  let obstacles = [];
  let flyerScore = 0;
  let flyerFrameCount = 0;

  function initFlyer() {
    flyerCanvas.width = flyerArena.clientWidth;
    flyerCanvas.height = 500;
    flyerActive = true;
    flyerScore = 0;
    flyerFrameCount = 0;
    obstacles = [];
    particles = [];
    floatingTexts = [];
    flyerCurrentScoreEl.textContent = "0";
    flyer.y = flyerCanvas.height / 2;
    flyer.vy = 0;
    flyerGameOver.style.display = "none";

    if (!flyerAnimId) flyerLoop();
  }

  function stopFlyerEngine() {
    flyerActive = false;
    if (flyerAnimId) cancelAnimationFrame(flyerAnimId);
    flyerAnimId = null;
  }

  function flyerJump() {
    if (!flyerActive || flyerGameOver.style.display === "block") return;
    flyer.vy = flyer.jumpPower;
    SFX.jump(); // Play jump sound
    for (let i = 0; i < 5; i++)
      particles.push(
        new Particle(flyer.x, flyer.y + flyer.size, "#FFD700", 3, 3),
      );
  }

  function updateFlyer() {
    if (!flyerActive) return;

    flyer.vy += flyer.gravity;
    flyer.y += flyer.vy;

    // Trail
    if (flyerFrameCount % 3 === 0) {
      particles.push(new Particle(flyer.x, flyer.y, flyer.color, 1, 2));
    }

    // Generate Obstacles
    if (flyerFrameCount % 100 === 0) {
      const gap = 140;
      const minHeight = 50;
      const maxPos = flyerCanvas.height - minHeight - gap;
      const topHeight = Math.max(minHeight, Math.random() * maxPos);
      obstacles.push({
        x: flyerCanvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: 40,
        passed: false,
      });
    }

    // Move & Check Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let obs = obstacles[i];
      obs.x -= 4; // speed

      // Score point
      if (!obs.passed && flyer.x > obs.x + obs.width) {
        obs.passed = true;
        flyerScore++;
        flyerCurrentScoreEl.textContent = flyerScore;
        SFX.score();
        floatingTexts.push(
          new FloatingText(flyer.x, flyer.y - 30, "+1", "#00FF66"),
        );
      }

      // Collision
      if (
        flyer.x + flyer.size > obs.x &&
        flyer.x - flyer.size < obs.x + obs.width
      ) {
        if (
          flyer.y - flyer.size < obs.topHeight ||
          flyer.y + flyer.size > obs.bottomY
        )
          triggerFlyerCrash();
      }

      if (obs.x + obs.width < 0) obstacles.splice(i, 1);
    }

    if (flyer.y + flyer.size > flyerCanvas.height || flyer.y - flyer.size < 0)
      triggerFlyerCrash();

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      floatingTexts[i].update();
      if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }

    flyerFrameCount++;
  }

  function drawFlyer() {
    // Synthwave Grid BG
    flyerCtx.fillStyle = "#050505";
    flyerCtx.fillRect(0, 0, flyerCanvas.width, flyerCanvas.height);

    flyerCtx.strokeStyle = "rgba(144, 98, 255, 0.2)";
    flyerCtx.lineWidth = 1;
    flyerCtx.beginPath();
    let offset = (flyerFrameCount * 2) % 40;
    for (let x = -offset; x < flyerCanvas.width; x += 40) {
      flyerCtx.moveTo(x, 0);
      flyerCtx.lineTo(x, flyerCanvas.height);
    }
    for (let y = 0; y < flyerCanvas.height; y += 40) {
      flyerCtx.moveTo(0, y);
      flyerCtx.lineTo(flyerCanvas.width, y);
    }
    flyerCtx.stroke();

    if (flyerActive) {
      flyerCtx.save();
      flyerCtx.translate(flyer.x, flyer.y);
      flyerCtx.rotate(
        Math.min(Math.PI / 4, Math.max(-Math.PI / 4, flyer.vy * 0.1)),
      );
      flyerCtx.fillStyle = flyer.color;
      flyerCtx.shadowColor = flyer.color;
      flyerCtx.shadowBlur = 15;
      flyerCtx.beginPath();
      flyerCtx.moveTo(flyer.size, 0); // Beak
      flyerCtx.lineTo(-flyer.size, -flyer.size * 0.8); // Top tail
      flyerCtx.lineTo(-flyer.size * 0.5, 0); // Back
      flyerCtx.lineTo(-flyer.size, flyer.size * 0.8); // Bottom tail
      flyerCtx.fill();
      flyerCtx.fillStyle = "#fff";
      flyerCtx.beginPath();
      flyerCtx.arc(flyer.size * 0.3, -flyer.size * 0.3, 2, 0, Math.PI * 2);
      flyerCtx.fill();
      flyerCtx.restore();
    }

    obstacles.forEach((obs) => {
      flyerCtx.fillStyle = "rgba(144, 98, 255, 0.4)";
      flyerCtx.strokeStyle = "#9062FF";
      flyerCtx.lineWidth = 2;
      flyerCtx.shadowColor = "#9062FF";
      flyerCtx.shadowBlur = 10;
      flyerCtx.fillRect(obs.x, 0, obs.width, obs.topHeight);
      flyerCtx.strokeRect(obs.x, 0, obs.width, obs.topHeight);
      flyerCtx.fillRect(
        obs.x,
        obs.bottomY,
        obs.width,
        flyerCanvas.height - obs.bottomY,
      );
      flyerCtx.strokeRect(
        obs.x,
        obs.bottomY,
        obs.width,
        flyerCanvas.height - obs.bottomY,
      );
      flyerCtx.shadowBlur = 0;
    });

    particles.forEach((p) => p.draw(flyerCtx));
    floatingTexts.forEach((t) => t.draw(flyerCtx));
  }

  function flyerLoop() {
    if (currentState !== "FLYER") return;
    updateFlyer();
    drawFlyer();
    flyerAnimId = requestAnimationFrame(flyerLoop);
  }

  function triggerFlyerCrash() {
    flyerActive = false;
    SFX.crash();
    createExplosion(flyer.x, flyer.y, "#9062FF", flyerCtx);
    flyerArena.classList.add("shake-hard");
    setTimeout(() => flyerArena.classList.remove("shake-hard"), 400);

    // Evaluate against Leaderboard
    let isRecord = false;
    // Remove old user entry to prevent duplicates
    leaderboards.flyer = leaderboards.flyer.filter((p) => !p.isUser);

    leaderboards.flyer.push({
      alias: playerAlias,
      score: flyerScore,
      isUser: true,
    });
    leaderboards.flyer.sort((a, b) => b.score - a.score);
    localStorage.setItem("lb_flyer", JSON.stringify(leaderboards.flyer));

    const rankIndex = leaderboards.flyer.findIndex((p) => p.isUser);
    if (rankIndex !== -1 && rankIndex < 25 && flyerScore > 0) {
      isRecord = true;
      SFX.win();
      showCongratsOverlay(flyerArena, "CONGRATULATIONS!");
    }

    // Save Personal Best High Score
    const oldHS = parseInt(localStorage.getItem("flyerHighScore")) || 0;
    if (flyerScore > oldHS) localStorage.setItem("flyerHighScore", flyerScore);

    flyerFinalScoreEl.textContent = flyerScore;
    flyerGameOver.style.display = "block";
  }

  /* =======================================================
     GAME 2: STROOP CRISIS
     ======================================================= */
  const STROOP_ROUNDS = 10;
  const STROOP_TIME_MS = 2000;
  const STROOP_COLORS = [
    { name: "RED", hex: "#FF0055" },
    { name: "BLUE", hex: "#00E5FF" },
    { name: "GREEN", hex: "#00FF66" },
    { name: "YELLOW", hex: "#FFD700" },
  ];

  let stroopRound = 1;
  let stroopCorrect = 0;
  let stroopLatencyTotal = 0;
  let stroopRoundStart = 0;
  let stroopTimerStart = 0;
  let stroopVisualColor = null;
  let stroopTimerId = null;
  let currentCombo = 0;

  function initStroop() {
    stroopRound = 1;
    stroopCorrect = 0;
    stroopLatencyTotal = 0;
    currentCombo = 0;
    comboTracker.style.display = "none";
    stroopGameOver.style.display = "none";
    nextStroopRound();
  }

  function stopStroopEngine() {
    if (stroopTimerId) cancelAnimationFrame(stroopTimerId);
    stroopTimerId = null;
  }

  function nextStroopRound() {
    if (stroopRound > STROOP_ROUNDS) {
      endStroop();
      return;
    }

    currentRoundEl.textContent = stroopRound;
    stroopWordEl.className = Math.random() > 0.5 ? "stroop-glitch" : "";

    const wordObj =
      STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    const colorObj =
      STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];

    stroopVisualColor = colorObj.name;
    stroopWordEl.textContent = wordObj.name;
    stroopWordEl.style.color = colorObj.hex;
    stroopWordEl.style.textShadow = `0 0 30px ${colorObj.hex}`;

    stroopOptionsEl.innerHTML = "";
    let options = STROOP_COLORS.map((c) => c.name).sort(
      () => Math.random() - 0.5,
    );

    options.forEach((optName) => {
      const btn = document.createElement("button");
      btn.className = "stroop-btn";
      btn.textContent = optName;
      btn.addEventListener("mousedown", () => handleStroopSelection(optName));
      stroopOptionsEl.appendChild(btn);
    });

    startStroopTimer();
  }

  function startStroopTimer() {
    stopStroopEngine();
    timerBar.classList.remove("timer-danger");
    stroopTimerStart = performance.now();
    stroopRoundStart = stroopTimerStart;

    const animateTimer = (time) => {
      const elapsed = time - stroopTimerStart;
      const ratio = Math.max(0, 1 - elapsed / STROOP_TIME_MS);

      timerBar.style.transform = `scaleX(${ratio})`;

      if (elapsed > 1000) timerBar.classList.add("timer-danger");

      if (elapsed >= STROOP_TIME_MS) {
        handleStroopSelection(null); // Timeout
      } else {
        stroopTimerId = requestAnimationFrame(animateTimer);
      }
    };
    stroopTimerId = requestAnimationFrame(animateTimer);
  }

  function handleStroopSelection(selectedColor) {
    stopStroopEngine();

    const latency = performance.now() - stroopRoundStart;

    if (selectedColor === stroopVisualColor) {
      SFX.score();
      stroopCorrect++;
      stroopLatencyTotal += latency;

      if (latency < 1000) {
        currentCombo++;
        if (currentCombo > 1) {
          comboCountEl.textContent = currentCombo;
          comboTracker.style.display = "block";
          comboTracker.style.animation = "none";
          comboTracker.offsetHeight;
          comboTracker.style.animation =
            "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        }
      } else {
        currentCombo = 0;
        comboTracker.style.display = "none";
      }
    } else {
      SFX.crash();
      stroopLatencyTotal += STROOP_TIME_MS;
      currentCombo = 0;
      comboTracker.style.display = "none";

      if (selectedColor === null) {
        timeoutOverlay.style.display = "flex";
        stroopArena.classList.add("shake-hard");
        setTimeout(() => {
          timeoutOverlay.style.display = "none";
          stroopArena.classList.remove("shake-hard");
        }, 500);
      }
    }

    stroopRound++;
    setTimeout(() => {
      nextStroopRound();
    }, 250);
  }

  function endStroop() {
    stopStroopEngine();
    stroopOptionsEl.innerHTML = "";
    stroopWordEl.textContent = "DONE";
    stroopWordEl.style.color = "#fff";
    stroopWordEl.style.textShadow = "none";
    stroopWordEl.className = "";
    timerBar.style.transform = "scaleX(0)";
    comboTracker.style.display = "none";

    const avgLatency = Math.round(stroopLatencyTotal / STROOP_ROUNDS);
    finalAccuracyEl.textContent = `${stroopCorrect}/${STROOP_ROUNDS}`;
    finalLatencyEl.textContent = `${avgLatency}ms`;

    // Leaderboard Logic
    leaderboards.stroop = leaderboards.stroop.filter((p) => !p.isUser);
    leaderboards.stroop.push({
      alias: playerAlias,
      acc: stroopCorrect,
      lat: avgLatency,
      isUser: true,
    });
    leaderboards.stroop.sort((a, b) =>
      b.acc === a.acc ? a.lat - b.lat : b.acc - a.acc,
    );
    localStorage.setItem("lb_stroop", JSON.stringify(leaderboards.stroop));

    const rankIndex = leaderboards.stroop.findIndex((p) => p.isUser);
    if (rankIndex !== -1 && rankIndex < 25 && stroopCorrect >= 5) {
      SFX.win();
      showCongratsOverlay(stroopArena, "CONGRATULATIONS!");
    }

    const oldPeakAcc = parseInt(localStorage.getItem("stroopHighScore")) || 0;
    if (stroopCorrect > oldPeakAcc)
      localStorage.setItem("stroopHighScore", stroopCorrect);

    stroopGameOver.style.display = "block";
  }

  // --- Event Listeners ---
  tab.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);

  // Dashboard Actions
  btnStartFlyer.addEventListener("click", () =>
    requireAlias(() => showScreen("FLYER")),
  );
  btnStartStroop.addEventListener("click", () =>
    requireAlias(() => showScreen("STROOP")),
  );

  // Sudoku Integration
  const btnStartSudoku = document.getElementById("btn-start-sudoku");
  if (btnStartSudoku) {
    btnStartSudoku.addEventListener("click", () =>
      requireAlias(() => {
        showScreen("SUDOKU");
        if (window.SudokuGame) {
          window.SudokuGame.startNewGame("medium");
        }
      }),
    );
  }

  // Minesweeper Integration
  const btnStartMinesweeper = document.getElementById("btn-start-minesweeper");
  if (btnStartMinesweeper) {
    btnStartMinesweeper.addEventListener("click", () =>
      requireAlias(() => showScreen("MINESWEEPER")),
    );
  }

  btnViewLeaderboards.addEventListener("click", () =>
    showScreen("LEADERBOARDS"),
  );

  // Retrys
  btnRetryFlyer.addEventListener("click", initFlyer);
  btnRetryStroop.addEventListener("click", initStroop);

  // Back to Dashboard
  btnBacks.forEach((btn) => {
    btn.addEventListener("click", () => {
      showScreen("DASHBOARD");
      loadTelemetry(); // refresh personal high scores
    });
  });

  // Leaderboard Tabs
  lbTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      lbTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderLeaderboard(tab.getAttribute("data-board"));
    });
  });

  // Cyber Flyer Jump Controls
  flyerCanvas.addEventListener("mousedown", flyerJump);
  document.addEventListener("keydown", (e) => {
    if (
      currentState === "FLYER" &&
      (e.code === "Space" || e.code === "ArrowUp")
    ) {
      e.preventDefault();
      flyerJump();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("game-open")) {
      closePanel();
    }
  });
});
