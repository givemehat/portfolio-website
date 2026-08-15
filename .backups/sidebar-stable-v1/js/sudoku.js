/**
 * SUDOKU MATRIX — Clean & Fast v4
 * Cyber Arcade — Neural Simulation Terminal
 *
 * • Fast generator: backtracking fill + simple random removal (no per-cell uniqueness
 *   checks that cause 10-second freezes on Hard/Expert)
 * • Zone highlight (row / col / box) + same-number highlight
 * • Undo stack, Notes/pencil mode, 3 hints
 * • Gentle red flash on wrong entry (no punishing lockout)
 * • Confetti + glow celebration on win
 * • localStorage saves best time & streak
 * • Exposes window.SudokuGame for game.js
 */

(function () {
  "use strict";

  /* ─── Difficulty clue counts ────────────────────────────── */
  const CLUES = { easy: 40, medium: 32, hard: 25, expert: 20 };
  const STORAGE_KEY = "sudoku_v4";

  /* ─── State ─────────────────────────────────────────────── */
  let board = [],
    solution = [],
    fixed = [],
    notes = [];
  let history = [];
  let selected = null; // {r,c}
  let notesMode = false;
  let hintsLeft = 3;
  let mistakes = 0;
  let elapsed = 0;
  let timerID = null;
  let difficulty = "easy";
  let isOver = false;
  let profile = loadProfile();

  /* ─── Profile ───────────────────────────────────────────── */
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

  /* ─── Generator ─────────────────────────────────────────── */
  function generatePuzzle(diff) {
    const sol = emptyGrid();
    solveFull(sol);
    solution = sol.map((r) => [...r]);

    const puzzle = sol.map((r) => [...r]);
    const toRemove = 81 - (CLUES[diff] || CLUES.easy);
    shuffleArray(allCells())
      .slice(0, toRemove)
      .forEach(([r, c]) => (puzzle[r][c] = 0));

    board = puzzle;
    fixed = puzzle.map((r) => r.map((v) => v !== 0));
    notes = grid9(() => new Set());
    history = [];
  }

  function emptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }
  function grid9(fn) {
    return Array.from({ length: 9 }, () => Array.from({ length: 9 }, fn));
  }

  function solveFull(g) {
    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    solveStep(g, nums);
  }

  function solveStep(g, order) {
    const cell = firstEmpty(g);
    if (!cell) return true;
    const [r, c] = cell;
    for (const n of order) {
      if (canPlace(g, r, c, n)) {
        g[r][c] = n;
        if (solveStep(g, order)) return true;
        g[r][c] = 0;
      }
    }
    return false;
  }

  function firstEmpty(g) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (g[r][c] === 0) return [r, c];
    return null;
  }

  function canPlace(g, r, c, n) {
    for (let i = 0; i < 9; i++) {
      if (g[r][i] === n || g[i][c] === n) return false;
    }
    const br = r - (r % 3),
      bc = c - (c % 3);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) if (g[br + i][bc + j] === n) return false;
    return true;
  }

  function allCells() {
    const a = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) a.push([r, c]);
    return a;
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ─── DOM helpers ───────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const bEl = () => $("sudoku-board");

  /* ─── Start / New Game ──────────────────────────────────── */
  function startGame(diff) {
    difficulty = (diff || "easy").toLowerCase();
    isOver = false;
    hintsLeft = 3;
    mistakes = 0;
    elapsed = 0;
    selected = null;
    notesMode = false;
    history = [];

    // Hide game-over panel
    const go = $("sudoku-game-over");
    if (go) go.style.display = "none";

    // Show skeleton while puzzle generates
    showSkeleton();

    // Use setTimeout so the skeleton renders first (avoids blank-board flicker)
    setTimeout(() => {
      generatePuzzle(difficulty);
      renderBoard();
      stopTimer();
      startTimer();
      refreshHintBtn();
      refreshMistakes();
      setNotesBtn(false);

      // Mark active difficulty pill
      document
        .querySelectorAll("#sudoku-matrix-arena .btn-diff")
        .forEach((b) =>
          b.classList.toggle("active", b.dataset.diff === difficulty),
        );
    }, 60);
  }

  /* ─── Skeleton ──────────────────────────────────────────── */
  function showSkeleton() {
    const b = bEl();
    if (!b) return;
    b.innerHTML = "";
    b.classList.add("loading");
    for (let i = 0; i < 81; i++) {
      const d = document.createElement("div");
      d.className = "sudoku-cell sudoku-skel";
      b.appendChild(d);
    }
  }

  /* ─── Render ────────────────────────────────────────────── */
  function renderBoard() {
    const b = bEl();
    if (!b || !board.length) return;
    b.classList.remove("loading");
    b.innerHTML = "";

    const selVal = selected ? board[selected.r][selected.c] : 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        const isFixed = fixed[r][c];
        const isSel = selected && selected.r === r && selected.c === c;
        const inZone =
          selected &&
          (selected.r === r ||
            selected.c === c ||
            (Math.floor(selected.r / 3) === Math.floor(r / 3) &&
              Math.floor(selected.c / 3) === Math.floor(c / 3)));
        const sameNum = selVal !== 0 && val === selVal;
        const isWrong = !isFixed && val !== 0 && val !== solution[r][c];

        const cell = document.createElement("div");
        cell.className = "sudoku-cell";
        cell.dataset.r = r;
        cell.dataset.c = c;

        // 3×3 box thick borders
        if (c === 2 || c === 5) cell.classList.add("box-right");
        if (r === 2 || r === 5) cell.classList.add("box-bottom");

        if (isFixed) cell.classList.add("fixed");
        else if (val) cell.classList.add("user");

        if (isSel) cell.classList.add("selected");
        else if (sameNum && val) cell.classList.add("same");
        else if (inZone) cell.classList.add("zone");

        if (isWrong) cell.classList.add("error");

        if (val !== 0) {
          cell.textContent = val;
        } else if (notes[r][c].size > 0) {
          const ng = document.createElement("div");
          ng.className = "sudoku-notes-grid";
          for (let n = 1; n <= 9; n++) {
            const sp = document.createElement("span");
            sp.textContent = notes[r][c].has(n) ? n : "";
            ng.appendChild(sp);
          }
          cell.appendChild(ng);
        }

        b.appendChild(cell);
      }
    }
    refreshNumpad();
  }

  /* ─── Numpad remaining count ────────────────────────────── */
  function refreshNumpad() {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (board[r][c]) counts[board[r][c]]++;

    document.querySelectorAll("#sudoku-numpad .btn-num").forEach((btn) => {
      const n = parseInt(btn.dataset.num || btn.textContent.trim());
      if (!n) return;
      const rem = 9 - counts[n];
      btn.disabled = rem <= 0;
      btn.classList.toggle("exhausted", rem <= 0);
      let badge = btn.querySelector(".num-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "num-badge";
        btn.appendChild(badge);
      }
      badge.textContent = rem > 0 ? rem : "";
    });
  }

  /* ─── Select ────────────────────────────────────────────── */
  function selectCell(r, c) {
    if (isOver) return;
    selected = { r, c };
    renderBoard();
  }

  /* ─── Input number ──────────────────────────────────────── */
  function inputNum(n) {
    if (!selected || isOver) return;
    const { r, c } = selected;
    if (fixed[r][c]) return;

    pushHistory();

    if (notesMode) {
      board[r][c] = 0;
      notes[r][c].has(n) ? notes[r][c].delete(n) : notes[r][c].add(n);
    } else {
      notes[r][c].clear();
      board[r][c] = n;
      if (n !== solution[r][c]) {
        // Wrong — gentle flash, increment counter
        mistakes++;
        refreshMistakes();
        renderBoard();
        // Flash the cell red briefly
        const cellEl = bEl()?.querySelector(`[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) {
          cellEl.classList.add("error-flash");
          setTimeout(() => cellEl.classList.remove("error-flash"), 600);
        }
        return;
      } else {
        // Correct — clear notes that this number resolves
        clearRelatedNotes(r, c, n);
        checkWin();
      }
    }
    renderBoard();
  }

  function eraseCell() {
    if (!selected || isOver) return;
    const { r, c } = selected;
    if (fixed[r][c]) return;
    pushHistory();
    board[r][c] = 0;
    notes[r][c].clear();
    renderBoard();
  }

  function useHint() {
    if (hintsLeft <= 0 || !selected || isOver) return;
    const { r, c } = selected;
    if (fixed[r][c] || board[r][c] === solution[r][c]) return;
    pushHistory();
    board[r][c] = solution[r][c];
    notes[r][c].clear();
    clearRelatedNotes(r, c, board[r][c]);
    hintsLeft--;
    refreshHintBtn();
    checkWin();
    renderBoard();
  }

  function clearRelatedNotes(r, c, n) {
    for (let i = 0; i < 9; i++) {
      notes[r][i].delete(n);
      notes[i][c].delete(n);
    }
    const br = r - (r % 3),
      bc = c - (c % 3);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) notes[br + i][bc + j].delete(n);
  }

  /* ─── Undo ──────────────────────────────────────────────── */
  function pushHistory() {
    history.push({
      board: board.map((row) => [...row]),
      notes: notes.map((row) => row.map((s) => new Set(s))),
    });
    if (history.length > 100) history.shift();
  }
  function undo() {
    if (!history.length || isOver) return;
    const prev = history.pop();
    board = prev.board;
    notes = prev.notes;
    renderBoard();
  }

  /* ─── Notes mode ────────────────────────────────────────── */
  function toggleNotes() {
    notesMode = !notesMode;
    setNotesBtn(notesMode);
  }
  function setNotesBtn(on) {
    const btn = $("btn-sudoku-pencil");
    if (btn) btn.classList.toggle("active", on);
    const sp = $("pencil-status");
    if (sp) sp.textContent = on ? "(ON)" : "(OFF)";
  }

  /* ─── Timer ─────────────────────────────────────────────── */
  function stopTimer() {
    clearInterval(timerID);
    timerID = null;
  }
  function startTimer() {
    stopTimer();
    timerID = setInterval(() => {
      if (!isOver) {
        elapsed++;
        renderTimer();
      }
    }, 1000);
  }
  function renderTimer() {
    const el = $("sudoku-time");
    if (!el) return;
    el.textContent = fmt(elapsed);
  }
  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  /* ─── Misc UI ───────────────────────────────────────────── */
  function refreshMistakes() {
    const el = $("sudoku-mistake-count");
    if (el) el.textContent = `${mistakes}/3`;
  }
  function refreshHintBtn() {
    const el = $("sudoku-hint-count");
    if (el) el.textContent = hintsLeft;
    const btn = $("btn-sudoku-hint");
    if (btn) btn.disabled = hintsLeft <= 0;
  }

  /* ─── Win check ─────────────────────────────────────────── */
  function checkWin() {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (board[r][c] !== solution[r][c]) return;
    endGame(true);
  }

  /* ─── End game ──────────────────────────────────────────── */
  function endGame(win) {
    isOver = true;
    stopTimer();

    if (win) {
      // Save best time
      const key = `best_${difficulty}`;
      if (!profile[key] || elapsed < profile[key]) profile[key] = elapsed;
      profile.streak = (profile.streak || 0) + 1;
      profile.lastWin = new Date().toDateString();
      saveProfile();
      // Update card badge
      const badge = $("sudoku-best-time");
      if (badge && profile[key]) badge.textContent = fmt(profile[key]);
    }

    const go = $("sudoku-game-over");
    if (!go) return;
    go.style.display = "flex";

    const title = go.querySelector("h2");
    if (title) {
      title.textContent = win ? "✦ PUZZLE SOLVED!" : "✗ GAME OVER";
      title.style.color = win ? "#00E5FF" : "#FF0055";
    }

    const ft = $("sudoku-final-time");
    if (ft) ft.textContent = fmt(elapsed);
    const fd = $("sudoku-final-diff");
    if (fd) fd.textContent = difficulty.toUpperCase();
    const nr = $("sudoku-new-record");
    if (nr)
      nr.style.display =
        win && profile[`best_${difficulty}`] === elapsed ? "block" : "none";

    if (win) launchConfetti();
  }

  /* ─── Confetti ──────────────────────────────────────────── */
  function launchConfetti() {
    const arena = $("sudoku-matrix-arena");
    if (!arena) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:300;";
    arena.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = arena.offsetWidth;
    canvas.height = arena.offsetHeight;

    const colors = [
      "#00E5FF",
      "#FFD700",
      "#FF0055",
      "#00FF88",
      "#a855f7",
      "#f97316",
    ];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      rspeed: (Math.random() - 0.5) * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 7,
    }));

    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rspeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      frame++;
      if (frame < 120) requestAnimationFrame(tick);
      else canvas.remove();
    }
    requestAnimationFrame(tick);
  }

  /* ─── Events ────────────────────────────────────────────── */
  function bindEvents() {
    // Board click
    const b = bEl();
    if (b) {
      b.addEventListener("click", (e) => {
        const cell = e.target.closest(".sudoku-cell");
        if (cell && !cell.classList.contains("sudoku-skel")) {
          selectCell(+cell.dataset.r, +cell.dataset.c);
        }
      });
    }

    // Numpad
    const np = $("sudoku-numpad");
    if (np) {
      np.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-num,.numpad-btn");
        if (!btn) return;
        const n = parseInt(btn.dataset.num || btn.textContent.trim());
        if (n >= 1 && n <= 9) inputNum(n);
      });
    }

    // Control buttons
    $("btn-sudoku-undo")?.addEventListener("click", undo);
    $("btn-sudoku-erase")?.addEventListener("click", eraseCell);
    $("btn-sudoku-pencil")?.addEventListener("click", toggleNotes);
    $("btn-sudoku-hint")?.addEventListener("click", useHint);

    // Difficulty pills (scoped to arena so they don't clash with minesweeper pills)
    const arena = $("sudoku-matrix-arena");
    if (arena) {
      arena
        .querySelectorAll(".btn-diff")
        .forEach((btn) =>
          btn.addEventListener("click", () => startGame(btn.dataset.diff)),
        );
    }

    // Game-over actions
    $("btn-sudoku-next")?.addEventListener("click", () => {
      const order = ["easy", "medium", "hard", "expert"];
      startGame(order[Math.min(order.indexOf(difficulty) + 1, 3)]);
    });
    $("btn-retry-sudoku")?.addEventListener("click", () =>
      startGame(difficulty),
    );

    // Keyboard
    document.addEventListener("keydown", (e) => {
      const arena = $("sudoku-matrix-arena");
      if (!arena || arena.style.display === "none") return;

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        inputNum(+e.key);
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        eraseCell();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undo();
        return;
      }
      if (e.key === "n" || e.key === "N") {
        toggleNotes();
        return;
      }

      if (!selected) return;
      let { r, c } = selected;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        r = Math.max(0, r - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        r = Math.min(8, r + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        c = Math.max(0, c - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        c = Math.min(8, c + 1);
      } else return;
      selectCell(r, c);
    });
  }

  /* ─── Boot ──────────────────────────────────────────────── */
  function init() {
    // Auto-stamp data-num on numpad buttons that use textContent
    document
      .querySelectorAll("#sudoku-numpad .btn-num,.btn-num")
      .forEach((btn) => {
        if (!btn.dataset.num)
          btn.dataset.num = btn.textContent.trim().replace(/\D/g, "");
      });
    bindEvents();

    // Expose API to game.js
    window.SudokuGame = {
      startNewGame: startGame,
      stopTimer: stopTimer,
      restart: () => startGame(difficulty),
    };
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
