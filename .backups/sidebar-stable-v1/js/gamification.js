const STATE_KEY = "arcade_gamification_state";

const defaultState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLoginDate: null,
  sudokusSolved: 0,
  badges: [],
  certificates: [],
};

function loadState() {
  const stored = localStorage.getItem(STATE_KEY);
  if (stored) {
    return { ...defaultState, ...JSON.parse(stored) };
  }
  return { ...defaultState };
}

function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

window.Gamification = {
  addXP: function (amount, reason) {
    let state = loadState();
    state.xp += amount;

    const newLevel = Math.floor(Math.sqrt(state.xp / 100)) + 1;
    if (newLevel > state.level) {
      state.level = newLevel;
      this.showToast(`Level Up! You are now level ${state.level}!`);
    }

    saveState(state);
    this.updateDashboardUI();
    this.showToast(`+${amount} XP: ${reason}`);
  },

  awardBadge: function (badgeId, badgeName, icon) {
    let state = loadState();
    const hasBadge = state.badges.find((b) => b.id === badgeId);
    if (!hasBadge) {
      state.badges.push({ id: badgeId, name: badgeName, icon: icon });
      saveState(state);
      this.showToast(`New Badge: ${badgeName}!`);
      this.updateDashboardUI();
    }
  },

  awardCertificate: function (certId, title) {
    let state = loadState();
    const hasCert = state.certificates.find((c) => c.id === certId);
    if (!hasCert) {
      state.certificates.push({
        id: certId,
        title: title,
        date: new Date().toISOString(),
      });
      saveState(state);
      this.showToast(`New Certificate: ${title}!`);
    }
  },

  updateLoginStreak: function () {
    let state = loadState();
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (state.lastLoginDate) {
      const lastLogin = new Date(state.lastLoginDate);
      const diffTime = Math.abs(today - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (state.lastLoginDate !== todayStr) {
        if (diffDays === 1) {
          state.streak += 1;
          this.addXP(50, `Login Streak (${state.streak} days)`);
        } else {
          state.streak = 1;
          this.addXP(10, "Daily Login");
        }
        state.lastLoginDate = todayStr;
        saveState(state);
      }
    } else {
      state.streak = 1;
      state.lastLoginDate = todayStr;
      saveState(state);
      this.addXP(10, "First Login");
    }
  },

  updateDashboardUI: function () {
    let state = loadState();

    const levelEl = document.getElementById("dash-level");
    const xpEl = document.getElementById("dash-total-xp");
    const streakEl = document.getElementById("dash-streak-count");
    const xpBarEl = document.getElementById("dash-xp-bar");
    const sudokuEl = document.getElementById("stat-sudoku-completed");
    const badgesStatEl = document.getElementById("stat-badges-earned");
    const badgesGridEl = document.getElementById("dash-badges-grid");

    if (levelEl) levelEl.textContent = state.level;
    if (xpEl) xpEl.textContent = state.xp;
    if (streakEl) streakEl.textContent = state.streak;

    if (xpBarEl) {
      const currentLevelXP = Math.pow(state.level - 1, 2) * 100;
      const nextLevelXP = Math.pow(state.level, 2) * 100;
      const xpIntoLevel = state.xp - currentLevelXP;
      const xpNeeded = nextLevelXP - currentLevelXP;
      const progress = (xpIntoLevel / xpNeeded) * 100;
      xpBarEl.style.width = `${Math.min(progress, 100)}%`;
    }

    if (sudokuEl) sudokuEl.textContent = state.sudokusSolved;
    if (badgesStatEl) badgesStatEl.textContent = state.badges.length;

    if (badgesGridEl) {
      badgesGridEl.innerHTML = "";
      state.badges.forEach((badge) => {
        const badgeEl = document.createElement("div");
        badgeEl.className = "badge-item";
        badgeEl.innerHTML = `<span class="badge-icon">${badge.icon}</span><span class="badge-name">${badge.name}</span>`;
        badgesGridEl.appendChild(badgeEl);
      });
      if (state.badges.length === 0) {
        badgesGridEl.innerHTML =
          '<div class="no-badges">No badges yet. Keep playing!</div>';
      }
    }
  },

  showToast: function (message) {
    console.log("Toast: " + message);
    // Can be connected to a UI toast system later
  },

  getState: function () {
    return loadState();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  window.Gamification.updateLoginStreak();
  window.Gamification.updateDashboardUI();
});
