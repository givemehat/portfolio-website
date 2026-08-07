(function() {
  'use strict';

  // State
  let audioCtx;
  let isSoundEnabled = localStorage.getItem('__sound_enabled__') === 'true';
  const MASTER_VOLUME = 0.15; // 15% default volume

  function initAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playTone(freq, type, duration, volScale = 1) {
    if (!isSoundEnabled) return;
    initAudioCtx();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(MASTER_VOLUME * volScale, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  // Preset Sounds
  const SFX = {
    hoverTick: () => playTone(800, 'sine', 0.03, 0.4),
    softClick: () => playTone(300, 'triangle', 0.05, 0.8),
    successChime: () => {
      if (!isSoundEnabled) return;
      playTone(523.25, 'sine', 0.4, 0.5); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.6, 0.5), 100); // E5
    },
    glitch: () => {
      if (!isSoundEnabled) return;
      playTone(1200, 'square', 0.1, 0.6);
      setTimeout(() => playTone(800, 'sawtooth', 0.1, 0.6), 50);
      setTimeout(() => playTone(1500, 'square', 0.1, 0.6), 100);
    }
  };

  // Bind to Window
  window.sfx = SFX;

  // Toggle Function
  window.toggleSound = function() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('__sound_enabled__', isSoundEnabled);
    if (isSoundEnabled) {
      initAudioCtx();
      SFX.successChime();
    }
    updateSoundUI();
  };

  function updateSoundUI() {
    const btns = document.querySelectorAll('.sound-toggle-btn');
    btns.forEach(btn => {
      btn.textContent = isSoundEnabled ? 'Sound: On' : 'Sound: Off';
      btn.classList.toggle('active', isSoundEnabled);
    });
  }

  // Auto-wire UI interactions
  document.addEventListener('DOMContentLoaded', () => {
    updateSoundUI();

    // Click sounds only
    document.querySelectorAll('.btn, a, .card, .pub-thumb-wrap').forEach(el => {
      el.addEventListener('mousedown', () => {
        if (el.dataset.noSound !== "true") {
          SFX.softClick();
        }
      });
    });

    // Sound toggle buttons
    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.toggleSound();
      });
    });
  });

})();
