/**
 * MINESWEEPER — Bomb Grid
 * Cyber Arcade — Neural Simulation Terminal
 *
 * Classic Minesweeper with:
 * • First-click safety (bombs placed after 1st click, avoiding clicked cell + its neighbors)
 * • Cascade / flood-fill reveal for 0-neighbour cells
 * • Right-click + flag-mode toggle button for mobile flagging
 * • Staggered reveal animations
 * • Win confetti + loss screen-shake
 * • localStorage best times and win streak
 * • Exposes window.MinesweeperGame for game.js
 */

(function () {
  "use strict";

  /* ── Difficulty configs ─────────────────────────────────── */
  const CONFIGS = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 13, cols: 13, mines: 25 },
    hard: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
  };

  /* ── Number colours (classic Minesweeper convention) ─────── */
  const NUM_COLORS = [
    "",
    "#3b82f6",
    "#22c55e",
    "#ef4444",
    "#1d4ed8",
    "#991b1b",
    "#0891b2",
    "#1f2937",
    "#6b7280",
  ];

  const STORAGE_KEY = "minesweeper_v1";

  /* ── State ──────────────────────────────────────────────── */
  let cfg = CONFIGS.easy;
  let difficulty = "easy";
  let grid = []; // [{mine,revealed,flagged,neighbors}]
  let isOver = false;
  let isWon = false;
  let firstClick = true;
  let flagMode = false; // mobile flag-toggle
  let flagCount = 0;
  let elapsed = 0;
  let timerID = null;
  let profile = loadProfile();
  let longPressTimer = null;

  /* ── Profile ─────────────────────────────────────────────── */
  function loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }

  /* ── DOM helpers ─────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);

  function boardEl() {
    return $("mine-board");
  }
  function arenaEl() {
    return $("minesweeper-arena");
  }

  /* ── Grid init ──────────────────────────────────────────── */
  function createGrid() {
    grid = [];
    for (let i = 0; i < cfg.rows * cfg.cols; i++) {
      grid.push({ mine: false, revealed: false, flagged: false, neighbors: 0 });
    }
  }

  function idx(r, c) {
    return r * cfg.cols + c;
  }

  function placeMines(safeR, safeC) {
    // Safe zone: clicked cell + all 8 neighbors
    const safe = new Set();
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const r = safeR + dr,
          c = safeC + dc;
        if (r >= 0 && r < cfg.rows && c >= 0 && c < cfg.cols)
          safe.add(idx(r, c));
      }

    // Collect candidate positions
    let candidates = [];
    for (let i = 0; i < cfg.rows * cfg.cols; i++)
      if (!safe.has(i)) candidates.push(i);

    // Shuffle and pick mines
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, cfg.mines).forEach((i) => (grid[i].mine = true));

    // Compute neighbor counts
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        if (grid[idx(r, c)].mine) continue;
        let count = 0;
        eachNeighbor(r, c, (nr, nc) => {
          if (grid[idx(nr, nc)].mine) count++;
        });
        grid[idx(r, c)].neighbors = count;
      }
    }
  }

  function eachNeighbor(r, c, fn) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols) fn(nr, nc);
      }
  }

  /* ── Start game ─────────────────────────────────────────── */
  function startGame(diff) {
    difficulty = (diff || "easy").toLowerCase();
    cfg = CONFIGS[difficulty] || CONFIGS.easy;
    isOver = false;
    isWon = false;
    firstClick = true;
    flagMode = false;
    flagCount = 0;
    elapsed = 0;

    stopTimer();
    createGrid();
    setFlagModeUI(false);
    renderBoard();
    updateBombCounter();
    updateTimer();

    const go = $("mine-game-over");
    if (go) go.style.display = "none";

    // Active difficulty pill
    const arena = arenaEl();
    if (arena) {
      arena
        .querySelectorAll(".btn-diff")
        .forEach((b) =>
          b.classList.toggle("active", b.dataset.diff === difficulty),
        );
    }
  }

  /* ── Render board ───────────────────────────────────────── */
  function renderBoard() {
    const board = boardEl();
    if (!board) return;

    // Set CSS grid columns dynamically
    board.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
    // Clamp cell size so the board fits on screen
    const maxW = Math.min(arenaEl()?.offsetWidth || 500, 500);
    const cellPx = Math.max(22, Math.floor(maxW / cfg.cols));
    board.style.setProperty("--cell-size", `${cellPx}px`);

    board.innerHTML = "";
    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        board.appendChild(buildCell(r, c));
      }
    }
  }

  function buildCell(r, c) {
    const cell = grid[idx(r, c)];
    const el = document.createElement("div");
    el.className = "mine-cell";
    el.dataset.r = r;
    el.dataset.c = c;

    if (cell.revealed) {
      el.classList.add("revealed");
      if (cell.mine) {
        el.classList.add("mine");
        el.textContent = "💥";
      } else if (cell.neighbors > 0) {
        el.textContent = cell.neighbors;
        el.style.color = NUM_COLORS[cell.neighbors] || "";
      }
    } else if (cell.flagged) {
      el.classList.add("flagged");
      el.textContent = "🚩";
    }

    return el;
  }

  function updateCell(r, c) {
    const board = boardEl();
    if (!board) return;
    const old = board.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (!old) return;
    const fresh = buildCell(r, c);
    board.replaceChild(fresh, old);
  }

  /* ── Click handling ─────────────────────────────────────── */
  function handleReveal(r, c) {
    if (isOver) return;
    const cell = grid[idx(r, c)];
    if (cell.flagged || cell.revealed) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
    }

    if (cell.mine) {
      // BOOM
      cell.revealed = true;
      cell.boom = true;
      endGame(false, r, c);
      return;
    }

    revealCell(r, c);
    updateBombCounter();
    checkWin();
    // Re-render is done inside revealCell cascade
  }

  function handleFlag(r, c) {
    if (isOver) return;
    const cell = grid[idx(r, c)];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    flagCount += cell.flagged ? 1 : -1;
    updateCell(r, c);
    updateBombCounter();

    // Animate flag
    const el = boardEl()?.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (el) {
      el.classList.add("flag-pop");
      setTimeout(() => el.classList.remove("flag-pop"), 300);
    }
  }

  /* ── Reveal + cascade ───────────────────────────────────── */
  function revealCell(r, c) {
    const cell = grid[idx(r, c)];
    if (cell.revealed || cell.flagged || cell.mine) return;
    cell.revealed = true;

    if (cell.neighbors === 0) {
      // BFS cascade
      const queue = [[r, c]];
      const seen = new Set([idx(r, c)]);
      let delay = 0;

      while (queue.length) {
        const [cr, cc] = queue.shift();
        const delayLocal = delay;
        setTimeout(() => {
          updateCell(cr, cc);
          // pop animation
          const el = boardEl()?.querySelector(
            `[data-r="${cr}"][data-c="${cc}"]`,
          );
          if (el) {
            el.classList.add("cell-pop");
            setTimeout(() => el.classList.remove("cell-pop"), 250);
          }
        }, delayLocal);

        eachNeighbor(cr, cc, (nr, nc) => {
          const ni = idx(nr, nc);
          if (!seen.has(ni)) {
            const ncell = grid[ni];
            if (!ncell.revealed && !ncell.flagged && !ncell.mine) {
              seen.add(ni);
              ncell.revealed = true;
              queue.push([nr, nc]);
              delay += 8; // tiny stagger for cascade feel
            }
          }
        });

        delay += 0; // queue items all go through the same outer delay
      }
      // After cascade finishes, check win
      setTimeout(() => {
        checkWin();
      }, delay + 50);
    } else {
      updateCell(r, c);
      const el = boardEl()?.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (el) {
        el.classList.add("cell-pop");
        setTimeout(() => el.classList.remove("cell-pop"), 250);
      }
    }
  }

  /* ── Win check ──────────────────────────────────────────── */
  function checkWin() {
    const safeCells = cfg.rows * cfg.cols - cfg.mines;
    const revealed = grid.filter((c) => c.revealed && !c.mine).length;
    if (revealed >= safeCells) endGame(true);
  }

  /* ── End game ───────────────────────────────────────────── */
  function endGame(win, boomR, boomC) {
    isOver = true;
    isWon = win;
    stopTimer();

    if (win) {
      const key = `best_${difficulty}`;
      if (!profile[key] || elapsed < profile[key]) profile[key] = elapsed;
      profile.wins = (profile.wins || 0) + 1;
      profile.streak = (profile.streak || 0) + 1;
      saveProfile();
      const badge = $("mine-best-time");
      if (badge && profile[key]) badge.textContent = fmtTime(profile[key]);
    } else {
      profile.losses = (profile.losses || 0) + 1;
      profile.streak = 0;
      saveProfile();
    }

    if (!win) {
      // Reveal all mines with stagger
      let delay = 0;
      grid.forEach((cell, i) => {
        if (cell.mine && !cell.flagged) {
          const r = Math.floor(i / cfg.cols);
          const c = i % cfg.cols;
          setTimeout(() => {
            cell.revealed = true;
            updateCell(r, c);
            const el = boardEl()?.querySelector(
              `[data-r="${r}"][data-c="${c}"]`,
            );
            if (el) {
              if (r === boomR && c === boomC) el.classList.add("mine-hit");
              el.classList.add("mine-reveal");
            }
          }, delay);
          delay += 30;
        }
      });

      // Screen shake
      const arena = arenaEl();
      if (arena) {
        setTimeout(() => {
          arena.classList.add("shake-hard");
          setTimeout(() => arena.classList.remove("shake-hard"), 600);
        }, 50);
      }

      setTimeout(() => showOverlay(false), delay + 200);
    } else {
      showOverlay(true);
      launchConfetti();
    }
  }

  function showOverlay(win) {
    const go = $("mine-game-over");
    if (!go) return;
    go.style.display = "flex";

    const title = go.querySelector("h2");
    if (title) {
      title.textContent = win ? "✦ FIELD CLEARED!" : "💥 DETONATED!";
      title.style.color = win ? "#00E5FF" : "#FF0055";
    }
    const ft = $("mine-final-time");
    if (ft) ft.textContent = fmtTime(elapsed);
    const fd = $("mine-final-diff");
    if (fd) fd.textContent = difficulty.toUpperCase();
    const nm = $("mine-mine-count");
    if (nm) nm.textContent = cfg.mines;
  }

  /* ── Confetti ────────────────────────────────────────────── */
  function launchConfetti() {
    const arena = arenaEl();
    if (!arena) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:300;";
    arena.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = arena.offsetWidth;
    canvas.height = arena.offsetHeight;
    const colors = ["#00E5FF", "#FFD700", "#FF0055", "#00FF88", "#a855f7"];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 6,
      color: colors[(Math.random() * colors.length) | 0],
      size: 6 + Math.random() * 6,
    }));
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rs;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (++frame < 120) requestAnimationFrame(tick);
      else canvas.remove();
    }
    requestAnimationFrame(tick);
  }

  /* ── Timer ───────────────────────────────────────────────── */
  function stopTimer() {
    clearInterval(timerID);
    timerID = null;
  }
  function startTimer() {
    stopTimer();
    timerID = setInterval(() => {
      if (!isOver) {
        elapsed++;
        updateTimer();
      }
    }, 1000);
  }
  function updateTimer() {
    const el = $("mine-timer");
    if (el) el.textContent = fmtTime(elapsed);
  }
  function fmtTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }
  function updateBombCounter() {
    const el = $("mine-bomb-count");
    if (el) el.textContent = cfg.mines - flagCount;
  }

  /* ── Flag mode UI ────────────────────────────────────────── */
  function setFlagModeUI(on) {
    flagMode = on;
    const btn = $("btn-mine-flag-toggle");
    if (btn) btn.classList.toggle("active", on);
    const lbl = $("flag-mode-label");
    if (lbl) lbl.textContent = on ? "(ON)" : "(OFF)";
  }

  /* ── Events ──────────────────────────────────────────────── */
  function bindEvents() {
    // Board events (delegated)
    const board = boardEl();
    if (board) {
      board.addEventListener("click", (e) => {
        if (flagMode) return; // left click does nothing in flag mode
        const el = e.target.closest(".mine-cell");
        if (!el) return;
        handleReveal(+el.dataset.r, +el.dataset.c);
      });

      board.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const el = e.target.closest(".mine-cell");
        if (!el) return;
        handleFlag(+el.dataset.r, +el.dataset.c);
      });

      // Mobile: long-press to flag
      board.addEventListener(
        "touchstart",
        (e) => {
          const el = e.target.closest(".mine-cell");
          if (!el) return;
          longPressTimer = setTimeout(() => {
            handleFlag(+el.dataset.r, +el.dataset.c);
            longPressTimer = null;
          }, 500);
        },
        { passive: true },
      );

      board.addEventListener("touchend", () => {
        clearTimeout(longPressTimer);
      });

      board.addEventListener("touchmove", () => {
        clearTimeout(longPressTimer);
      });

      // Mobile flag mode: tap on flagged-mode cell = flag
      board.addEventListener("touchend", (e) => {
        if (!flagMode) return;
        e.preventDefault();
        const el = e.target.closest(".mine-cell");
        if (!el) return;
        const cell = grid[idx(+el.dataset.r, +el.dataset.c)];
        if (cell && !cell.revealed) {
          handleFlag(+el.dataset.r, +el.dataset.c);
        }
      });

      // Flag mode tap reveal
      board.addEventListener("click", (e) => {
        if (!flagMode) return;
        const el = e.target.closest(".mine-cell");
        if (!el) return;
        const cell = grid[idx(+el.dataset.r, +el.dataset.c)];
        if (cell && !cell.revealed && !cell.flagged) {
          handleFlag(+el.dataset.r, +el.dataset.c);
        }
      });
    }

    // Controls
    $("btn-mine-restart")?.addEventListener("click", () =>
      startGame(difficulty),
    );
    $("btn-mine-flag-toggle")?.addEventListener("click", () =>
      setFlagModeUI(!flagMode),
    );

    // Difficulty pills (scoped to arena)
    const arena = arenaEl();
    if (arena) {
      arena
        .querySelectorAll(".btn-diff")
        .forEach((btn) =>
          btn.addEventListener("click", () => startGame(btn.dataset.diff)),
        );
    }

    // Game-over actions
    $("btn-mine-retry")?.addEventListener("click", () => startGame(difficulty));
    $("btn-mine-next")?.addEventListener("click", () => {
      const order = ["easy", "medium", "hard", "expert"];
      startGame(order[Math.min(order.indexOf(difficulty) + 1, 3)]);
    });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function init() {
    bindEvents();

    // Restore best-time badge on card
    ["easy", "medium", "hard", "expert"].forEach((d) => {
      const key = `best_${d}`;
      if (profile[key]) {
        const badge = $("mine-best-time");
        if (badge && d === "easy") badge.textContent = fmtTime(profile[key]);
      }
    });

    window.MinesweeperGame = {
      startNewGame: startGame,
      stopTimer: stopTimer,
    };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
