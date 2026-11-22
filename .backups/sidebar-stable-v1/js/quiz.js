window.CyberQuiz = (function () {
  const quizPool = [
    {
      q: "Which protocol is used to secure website traffic?",
      o: ["HTTP", "FTP", "HTTPS", "SMTP"],
      a: 2,
    },
    {
      q: "What does 'Phishing' refer to?",
      o: [
        "Fishing for data in a lake",
        "Deceptive emails to steal info",
        "A firewall brand",
        "Encrypting files",
      ],
      a: 1,
    },
    {
      q: "What is a DDoS attack?",
      o: [
        "Direct Data Operation System",
        "Distributed Denial of Service",
        "Dynamic Data Object Storage",
        "Domain Denial of Server",
      ],
      a: 1,
    },
    {
      q: "What is the primary purpose of a Firewall?",
      o: [
        "To speed up internet",
        "To filter network traffic",
        "To store passwords",
        "To delete viruses",
      ],
      a: 1,
    },
    {
      q: "What does VPN stand for?",
      o: [
        "Virtual Private Network",
        "Very Private Node",
        "Visual Protocol Network",
        "Virtual Public Network",
      ],
      a: 0,
    },
    {
      q: "Which of the following is considered strong password practice?",
      o: [
        "Using 'password123'",
        "Using your birthday",
        "Using a mix of letters, numbers, and symbols",
        "Writing it on a sticky note",
      ],
      a: 2,
    },
    {
      q: "What is malware?",
      o: [
        "Malicious software",
        "Hardware failure",
        "A type of firewall",
        "An antivirus program",
      ],
      a: 0,
    },
    {
      q: "What is ransomware?",
      o: [
        "Software that steals passwords",
        "Malware that encrypts files and demands payment",
        "A program to crack passwords",
        "A network monitoring tool",
      ],
      a: 1,
    },
    {
      q: "What is Social Engineering in cybersecurity?",
      o: [
        "Building secure social networks",
        "Manipulating people to give up confidential information",
        "Programming AI to be social",
        "Hacking social media accounts",
      ],
      a: 1,
    },
    {
      q: "Which encryption type uses the same key for encryption and decryption?",
      o: [
        "Asymmetric encryption",
        "Symmetric encryption",
        "Hashing",
        "Steganography",
      ],
      a: 1,
    },
    {
      q: "What does 2FA stand for?",
      o: [
        "Two-Factor Authentication",
        "Two-File Access",
        "To Find All",
        "Two-Firewall Architecture",
      ],
      a: 0,
    },
    {
      q: "What is a Zero-Day vulnerability?",
      o: [
        "A vulnerability discovered on the first day of the month",
        "A vulnerability unknown to the software vendor",
        "A bug that crashes the system immediately",
        "A firewall configuration error",
      ],
      a: 1,
    },
    {
      q: "Which of these is a common hashing algorithm?",
      o: ["RSA", "AES", "SHA-256", "DES"],
      a: 2,
    },
    {
      q: "What is the purpose of penetration testing?",
      o: [
        "To fix broken hardware",
        "To simulate cyber attacks to find vulnerabilities",
        "To write new software",
        "To train employees on phishing",
      ],
      a: 1,
    },
    {
      q: "What is a botnet?",
      o: [
        "A network of infected devices controlled remotely",
        "A robot assembly line",
        "A new internet protocol",
        "A secure network topology",
      ],
      a: 0,
    },
  ];

  let selectedQuestions = [];
  let currentQIndex = 0;
  let correctAnswers = 0;
  let timerInterval = null;
  let secondsElapsed = 0;

  const els = {};

  function init() {
    els.startBtn = document.getElementById("btn-start-quiz");
    els.arena = document.getElementById("cyber-quiz-arena");
    els.time = document.getElementById("quiz-time");
    els.currentQ = document.getElementById("quiz-current-q");
    els.totalQ = document.getElementById("quiz-total-q");
    els.questionText = document.getElementById("quiz-question-text");
    els.optionsContainer = document.getElementById("quiz-options-container");
    els.gameOver = document.getElementById("quiz-game-over");
    els.finalScore = document.getElementById("quiz-final-score");
    els.earnedXp = document.getElementById("quiz-earned-xp");

    if (els.startBtn) {
      els.startBtn.addEventListener("click", startQuiz);
    }
  }

  function formatTime(sec) {
    let m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    let s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function switchScreen(targetId) {
    document.querySelectorAll(".game-content").forEach((el) => {
      if (el.style) el.style.display = "none";
    });
    const target = document.getElementById(targetId);
    if (target) target.style.display = "block";
  }

  function startQuiz() {
    const today = new Date().toISOString().split("T")[0];
    const lastQuiz = localStorage.getItem("lastQuizDate");
    if (lastQuiz === today) {
      alert(
        "You have already completed the Daily Cyber Quiz today. Come back tomorrow!",
      );
      return;
    }

    selectedQuestions = quizPool.sort(() => 0.5 - Math.random()).slice(0, 10);
    currentQIndex = 0;
    correctAnswers = 0;
    secondsElapsed = 3;
    els.time.innerText = "00:03";
    els.gameOver.style.display = "none";
    document.querySelector(".quiz-question-container").style.display = "block";

    switchScreen("cyber-quiz-arena");
    renderQuestion();
  }

  function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 3;
    els.time.innerText = "00:03";
    timerInterval = setInterval(() => {
      secondsElapsed--;
      els.time.innerText = `00:0${secondsElapsed}`;
      if (secondsElapsed <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function renderQuestion() {
    els.currentQ.innerText = currentQIndex + 1;
    els.totalQ.innerText = 10;
    const qData = selectedQuestions[currentQIndex];
    els.questionText.innerText = qData.q;

    els.optionsContainer.innerHTML = "";
    qData.o.forEach((optText, index) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option-btn";
      btn.innerText = optText;
      btn.onclick = () => handleAnswer(index, btn);
      els.optionsContainer.appendChild(btn);
    });

    startTimer();
  }

  function handleTimeout() {
    const allBtns = els.optionsContainer.querySelectorAll(".quiz-option-btn");
    allBtns.forEach((btn) => (btn.disabled = true));

    // Highlight correct answer
    const qData = selectedQuestions[currentQIndex];
    if (allBtns[qData.a]) {
      allBtns[qData.a].classList.add("correct");
    }

    setTimeout(() => {
      currentQIndex++;
      if (currentQIndex < selectedQuestions.length) {
        renderQuestion();
      } else {
        endQuiz();
      }
    }, 1500);
  }

  function handleAnswer(selectedIndex, btnElement) {
    stopTimer();
    const qData = selectedQuestions[currentQIndex];
    const isCorrect = selectedIndex === qData.a;

    const allBtns = els.optionsContainer.querySelectorAll(".quiz-option-btn");
    allBtns.forEach((btn) => (btn.disabled = true));

    if (isCorrect) {
      btnElement.classList.add("correct");
      correctAnswers++;
    } else {
      btnElement.classList.add("wrong");
      allBtns[qData.a].classList.add("correct");
    }

    setTimeout(() => {
      currentQIndex++;
      if (currentQIndex < selectedQuestions.length) {
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  }

  function finishQuiz() {
    stopTimer();

    const xp = correctAnswers * 50;
    els.finalScore.innerText = `${correctAnswers}/10`;
    els.earnedXp.innerText = `+${xp} XP`;

    document.querySelector(".quiz-question-container").style.display = "none";
    els.gameOver.style.display = "block";

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("lastQuizDate", today);

    // Save to leaderboard
    let scores = JSON.parse(
      localStorage.getItem("cyberQuizLeaderboard") || "[]",
    );
    scores.push({ score: correctAnswers, date: today });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5); // Keep top 5
    localStorage.setItem("cyberQuizLeaderboard", JSON.stringify(scores));

    // Update UI if leaderboard element exists
    const lbContainer = document.getElementById("quiz-leaderboard-list");
    if (lbContainer) {
      lbContainer.innerHTML = scores
        .map(
          (s, i) =>
            `<tr><td>#${i + 1}</td><td>${s.score}/10</td><td>${s.date}</td></tr>`,
        )
        .join("");
    }

    if (
      window.Gamification &&
      typeof window.Gamification.addXP === "function"
    ) {
      window.Gamification.addXP(xp, "Daily Cyber Quiz");
    }
  }

  return { init, startQuiz };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (window.CyberQuiz) window.CyberQuiz.init();
});
