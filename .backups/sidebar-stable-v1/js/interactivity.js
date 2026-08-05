(function() {
  'use strict';

  // Safety clear of any NaN sidebar widths in storage
  if (sessionStorage.getItem('__sidebar_width__') === 'NaN') {
    sessionStorage.removeItem('__sidebar_width__');
  }

  document.addEventListener('DOMContentLoaded', function() {
    initScrollProgressBar();
    initBackToTopButton();
    initTimeGreeting();
    initTabSaver();
    initEasterEggs();
    initTabTitleChanger();
    initCardGlows();
    initEmailCopy();
    initCommandPalette();
    initButtonPressEffects();
    initSidebarResizer();
  });

  // ===== 1. BUTTON PRESS EFFECTS & LINKS HOVER =====
  function initButtonPressEffects() {
    document.addEventListener('mousedown', function(e) {
      var btn = e.target.closest('.btn, .icon-btn, .tab-pill, #sidebar-collapse-btn, #game-tab');
      if (btn) {
        btn.style.transform = 'scale(0.95)';
        btn.style.transition = 'transform 100ms ease';
      }
    });

    document.addEventListener('mouseup', function(e) {
      var btn = e.target.closest('.btn, .icon-btn, .tab-pill, #sidebar-collapse-btn, #game-tab');
      if (btn) {
        btn.style.transform = '';
      }
    });
  }

  // ===== 2. SCROLL PROGRESS BAR =====
  function initScrollProgressBar() {
    // Scroll progress bar already exists in index.html as #scroll-progress
    var bar = document.getElementById('scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress';
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
    }

    window.addEventListener('scroll', function() {
      var winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrolled = height > 0 ? (winScroll / height) : 0;
      bar.style.transform = 'scaleX(' + scrolled + ')';
    }, { passive: true });
  }

  // ===== 3. BACK TO TOP BUTTON =====
  function initBackToTopButton() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>';
    
    // Style inline or via CSS
    btn.style.cssText = 'position:fixed; bottom:90px; left:24px; width:44px; height:44px; border-radius:50%; background:rgba(11,17,32,0.85); backdrop-filter:blur(8px); border:1.5px solid rgba(0,229,255,0.45); color:#00E5FF; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; visibility:hidden; transition:opacity 220ms ease, transform 220ms ease, visibility 220ms ease; z-index:999; box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btn.addEventListener('mouseenter', function() {
      btn.style.transform = 'scale(1.10)';
      btn.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.45)';
    });

    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
      btn.style.boxShadow = '';
    });
  }

  // ===== 4. TIME-AWARE GREETING =====
  function initTimeGreeting() {
    var hero = document.querySelector('.hero-grid');
    if (!hero) return;

    var greetingDiv = document.createElement('div');
    greetingDiv.className = 'eyebrow time-greeting';
    greetingDiv.style.cssText = 'margin-bottom: 8px; opacity: 0; transform: translateY(-10px); transition: opacity 500ms ease, transform 500ms ease;';

    var hours = new Date().getHours();
    var greetText = "Good morning";
    if (hours >= 12 && hours < 17) greetText = "Good afternoon";
    else if (hours >= 17 || hours < 5) greetText = "Good evening";

    greetingDiv.innerHTML = '<span class="dot-live" style="background:#00E5FF; box-shadow: 0 0 8px #00E5FF;"></span> ' + greetText + ', welcome to my terminal';
    
    // Insert greeting at the top of hero grid
    hero.insertBefore(greetingDiv, hero.firstChild);

    setTimeout(function() {
      greetingDiv.style.opacity = '1';
      greetingDiv.style.transform = 'translateY(0)';
    }, 300);
  }

  // ===== 5. SESSION-BASED TAB SAVER =====
  var LAST_TAB_KEY = '__last_viewed_tab__';
  function initTabSaver() {
    var savedTab = sessionStorage.getItem(LAST_TAB_KEY);
    if (savedTab) {
      var tabEl = document.getElementById('tab-' + savedTab);
      if (tabEl && window.app && typeof window.app.showPanel === 'function') {
        setTimeout(function() {
          window.app.showPanel(savedTab, false);
          tabEl.click();
        }, 150);
      }
    }

    // Listen to tab clicks
    document.querySelectorAll('#tab-bar a[data-section]').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var section = tab.getAttribute('data-section');
        if (section) {
          sessionStorage.setItem(LAST_TAB_KEY, section);
        }
      });
    });
  }

  // ===== 6. DEVELOPER EASTER EGGS =====
  function initEasterEggs() {
    console.log(
      "%cRajnish Singh — Neural Portfolio Terminal %c\n\nHey developer! 👋 Nice to meet you in devtools. Connect with me:\n⚡ GitHub: https://github.com/givemehat\n💼 LinkedIn: https://www.linkedin.com/in/rajnish-singh-a9a61022a/\n✍️ Medium: https://medium.com/@rajnisihsingh\n",
      "color: #00E5FF; font-size: 15px; font-weight: bold; text-shadow: 0 0 6px #00E5FF;",
      "color: #8892B0; font-size: 12px;"
    );
  }

  // ===== 7. TAB TITLE CHANGER =====
  function initTabTitleChanger() {
    var originalTitle = document.title;
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        document.title = 'Come back! 👋 ' + originalTitle;
      } else {
        document.title = originalTitle;
      }
    });
  }

  // ===== 8. CARD MOUSE-GLOW INTERACTIONS =====
  function initCardGlows() {
    document.addEventListener('mousemove', function(e) {
      var cards = document.querySelectorAll('.card, .pub-card, .connect-card, .book-card');
      cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  // ===== 9. COPY EMAIL TO CLIPBOARD =====
  function initEmailCopy() {
    // Select connect cards with email addresses, or connections
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var email = link.getAttribute('href').replace('mailto:', '');
        if (!email) return;

        // Prevent opening default mail app immediately
        e.preventDefault();
        
        navigator.clipboard.writeText(email).then(function() {
          if (window.showToast) {
            window.showToast("Email copied to clipboard! 📋", "success");
          } else {
            alert("Email copied to clipboard!");
          }
        }).catch(function() {
          // Fallback to normal mailto if clipboard fails
          window.location.href = link.getAttribute('href');
        });
      });
    });
  }

  // ===== 10. COMMAND PALETTE (CMD+K) =====
  var COMMAND_ITEMS = [
    { name: "Go to Home section", icon: "🏠", action: function() { jumpToSection("home"); } },
    { name: "Go to About section", icon: "🧑‍💻", action: function() { jumpToSection("about"); } },
    { name: "Go to Research section", icon: "🔬", action: function() { jumpToSection("research"); } },
    { name: "Go to Projects section", icon: "💻", action: function() { jumpToSection("projects"); } },
    { name: "Go to Results section", icon: "📊", action: function() { jumpToSection("results"); } },
    { name: "Go to Certifications section", icon: "🏆", action: function() { jumpToSection("certifications"); } },
    { name: "Go to Publications section", icon: "📚", action: function() { jumpToSection("publications"); } },
    { name: "Go to Books section", icon: "📖", action: function() { jumpToSection("books"); } },
    { name: "Go to Experience section", icon: "💼", action: function() { jumpToSection("experience"); } },
    { name: "Go to Connect section", icon: "✉️", action: function() { jumpToSection("connect"); } },
    { name: "Go to Support section", icon: "❤️", action: function() { jumpToSection("support"); } },
    { name: "Launch Cyber Arcade Matrix", icon: "🕹️", action: function() { var t = document.getElementById('game-tab'); t && t.click(); } },
    { name: "Toggle Light/Dark Theme", icon: "🌗", action: function() { var t = document.getElementById('theme-toggle'); t && t.click(); } },
    { name: "Copy Email Address", icon: "📋", action: function() { copyEmailFallback(); } },
    { name: "Open GitHub Profile", icon: "🐙", action: function() { window.open("https://github.com/givemehat", "_blank"); } },
    { name: "Open LinkedIn Profile", icon: "🔗", action: function() { window.open("https://www.linkedin.com/in/rajnish-singh-a9a61022a/", "_blank"); } },
    { name: "Open Medium Blog", icon: "✍️", action: function() { window.open("https://medium.com/@rajnisihsingh", "_blank"); } }
  ];

  function jumpToSection(id) {
    var tab = document.getElementById('tab-' + id);
    if (tab) tab.click();
  }

  function copyEmailFallback() {
    navigator.clipboard.writeText("rajnisihsingh@gmail.com").then(function() {
      window.showToast && window.showToast("Email copied to clipboard!", "success");
    });
  }

  // Levenshtein distance helper for spelling tolerance
  function levenshteinDistance(a, b) {
    var matrix = [];
    var i, j;
    for (i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1 // deletion
            )
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function initCommandPalette() {
    // 1. Add Trigger Pill to Sidebar Header (next to toggle button)
    var sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
      var askBtn = document.createElement('button');
      askBtn.id = 'sidebar-ask-btn';
      askBtn.className = 'icon-btn';
      askBtn.setAttribute('title', 'Speak or type a command (Cmd+K)');
      askBtn.setAttribute('aria-label', 'Open command interface');
      askBtn.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; margin-left: 8px; display: flex; align-items: center; justify-content: center;';
      
      // Microphone/Search combined outline SVG
      askBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v5"/><path d="M9 11h4"/></svg>';
      sidebarHeader.appendChild(askBtn);
      
      askBtn.addEventListener('click', function() {
        openPalette();
      });
    }

    // Create HTML overlay
    var overlay = document.createElement('div');
    overlay.id = 'cmd-palette-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(4,6,14,0.7); backdrop-filter:blur(6px); z-index:9999; display:none; align-items:center; justify-content:center; opacity:0; transition:opacity 200ms ease;';
    
    var box = document.createElement('div');
    box.className = 'cmd-box';
    box.style.cssText = 'width:520px; max-width:calc(100% - 32px); background:var(--bg-alt); border:1px solid var(--line); border-radius:14px; padding:16px; box-shadow:var(--shadow-xl); display:flex; flex-direction:column; gap:12px; transform:translateY(-20px); transition:transform 200ms ease;';
    
    var header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; gap:8px; border-bottom:1px solid var(--line); padding-bottom:12px; position:relative;';
    
    var searchIcon = document.createElement('span');
    searchIcon.innerHTML = '⚡';
    searchIcon.style.fontSize = '16px';
    
    var input = document.createElement('input');
    input.id = 'cmd-search';
    input.type = 'text';
    input.placeholder = 'Type or speak a command (e.g. "show projects")...';
    input.autocomplete = 'off';
    // Monospace design for input
    input.style.cssText = 'flex:1; background:transparent; border:none; color:var(--text); font-family:var(--font-mono); font-size:14px; outline:none; padding-right:32px;';
    
    header.appendChild(searchIcon);
    header.appendChild(input);

    // 2. Microphone Voice Support (Progressive Enhancement)
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = null;
    var isListening = false;
    var micBtn = null;

    if (SpeechRecognition) {
      micBtn = document.createElement('button');
      micBtn.id = 'cmd-mic-btn';
      micBtn.setAttribute('title', 'Speak command');
      micBtn.setAttribute('aria-label', 'Speak command');
      micBtn.style.cssText = 'background:none; border:none; color:var(--text-dim); cursor:pointer; font-size:16px; padding:4px; display:flex; align-items:center; justify-content:center; transition:color 150ms ease, transform 150ms ease;';
      micBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>';
      header.appendChild(micBtn);

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        isListening = true;
        micBtn.style.color = '#00E5FF';
        micBtn.style.transform = 'scale(1.15)';
        input.placeholder = 'Listening... Speak clearly';
      };

      recognition.onresult = function(event) {
        var transcript = Array.from(event.results)
          .map(function(result) { return result[0]; })
          .map(function(result) { return result.transcript; })
          .join('');
        input.value = transcript;
        input.dispatchEvent(new Event('input'));
      };

      recognition.onerror = function() {
        stopListening();
      };

      recognition.onend = function() {
        stopListening();
        // Auto-submit voice input
        if (input.value.trim()) {
          setTimeout(executeTopMatch, 400);
        }
      };

      function stopListening() {
        isListening = false;
        if (micBtn) {
          micBtn.style.color = 'var(--text-dim)';
          micBtn.style.transform = '';
        }
        input.placeholder = 'Type or speak a command (e.g. "show projects")...';
      }

      micBtn.addEventListener('click', function() {
        if (isListening) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    }
    
    var results = document.createElement('div');
    results.id = 'cmd-results';
    results.style.cssText = 'max-height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:4px;';
    
    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px; color:var(--text-dim); display:flex; justify-content:space-between; border-top:1px solid var(--line); padding-top:10px; margin-top:4px; font-family:var(--font-mono);';
    hint.innerHTML = '<span>↑↓ to navigate · Enter to select</span><span>Esc to close</span>';
    
    box.appendChild(header);
    box.appendChild(results);
    box.appendChild(hint);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    var activeIndex = 0;
    var filteredItems = COMMAND_ITEMS;

    // Fuzzy intent matcher
    function filterSuggestions(query) {
      query = query.toLowerCase().trim();
      if (!query) {
        filteredItems = COMMAND_ITEMS;
        return;
      }

      // Map query to scored list of commands
      var scored = COMMAND_ITEMS.map(function(item) {
        var score = 0;
        // Key phrase matching
        var nameLower = item.name.toLowerCase();
        
        // Exact substring matches get highest score
        if (nameLower.indexOf(query) !== -1) {
          score += 50;
        }

        // Fuzzy match word-by-word
        var queryWords = query.split(/\s+/);
        var itemWords = nameLower.split(/\s+/);

        queryWords.forEach(function(qw) {
          itemWords.forEach(function(iw) {
            if (iw.indexOf(qw) !== -1) {
              score += 15;
            } else {
              var dist = levenshteinDistance(qw, iw);
              if (dist <= 2) {
                score += (10 - dist);
              }
            }
          });
        });

        return { item: item, score: score };
      });

      // Filter and sort items by relevance score
      var matched = scored.filter(function(x) { return x.score > 0; });
      matched.sort(function(a, b) { return b.score - a.score; });

      filteredItems = matched.map(function(x) { return x.item; });

      // Fallback fallback if no match found
      if (filteredItems.length === 0) {
        filteredItems = [];
      }
    }

    function renderResults() {
      results.innerHTML = '';
      if (filteredItems.length === 0) {
        results.innerHTML = 
          '<div style="padding:14px 12px; color:var(--text-dim); font-size:13px; line-height:1.5;">' +
            '<span style="color:var(--violet); font-weight:600; display:block; margin-bottom:8px;">I didn\'t catch that intent.</span>' +
            'Try typing something like: <code style="color:var(--cyan); font-family:var(--font-mono);">"open projects"</code>, ' +
            '<code style="color:var(--cyan); font-family:var(--font-mono);">"go to contact"</code>, or ' +
            '<code style="color:var(--cyan); font-family:var(--font-mono);">"dark theme"</code>.' +
          '</div>';
        return;
      }

      filteredItems.forEach(function(item, idx) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:13px; font-family:var(--font-mono); transition:all 100ms ease;';
        if (idx === activeIndex) {
          row.style.background = 'var(--violet-soft)';
          row.style.color = 'var(--violet)';
          row.style.borderLeft = '3px solid var(--violet)';
          row.style.fontWeight = '600';
        } else {
          row.style.background = 'transparent';
          row.style.color = 'var(--text)';
          row.style.borderLeft = '3px solid transparent';
        }
        
        row.innerHTML = '<span style="font-size:16px;">' + item.icon + '</span><span>' + item.name + '</span>';
        row.addEventListener('click', function() {
          triggerAction(item);
        });
        results.appendChild(row);
      });
    }

    function triggerAction(item) {
      if (window.showToast) {
        window.showToast('Executing: ' + item.name + '...', 'info');
      }
      setTimeout(function() {
        item.action();
      }, 150);
      closePalette();
    }

    function executeTopMatch() {
      if (filteredItems.length > 0 && filteredItems[activeIndex]) {
        triggerAction(filteredItems[activeIndex]);
      }
    }

    function openPalette() {
      overlay.style.display = 'flex';
      setTimeout(function() {
        overlay.style.opacity = '1';
        box.style.transform = 'translateY(0)';
      }, 10);
      input.value = '';
      activeIndex = 0;
      filteredItems = COMMAND_ITEMS;
      renderResults();
      setTimeout(function() { input.focus(); }, 80);
    }

    function closePalette() {
      if (isListening && recognition) {
        recognition.stop();
      }
      overlay.style.opacity = '0';
      box.style.transform = 'translateY(-20px)';
      setTimeout(function() {
        overlay.style.display = 'none';
      }, 200);
    }

    // Toggle shortcut keyboard trigger
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.style.display === 'flex') {
          closePalette();
        } else {
          openPalette();
        }
      }
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        closePalette();
      }
    });

    // Input filter listener
    input.addEventListener('input', function() {
      filterSuggestions(input.value);
      activeIndex = 0;
      renderResults();
    });

    // Keyboard navigation inside results
    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          activeIndex = (activeIndex + 1) % filteredItems.length;
          renderResults();
          var row = results.children[activeIndex];
          if (row) row.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
          renderResults();
          var row = results.children[activeIndex];
          if (row) row.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeTopMatch();
      }
    });

    // Backdrop click close
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closePalette();
    });
  }

  // ===== 11. DRAGGABLE SIDEBAR RESIZER =====
  function initSidebarResizer() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Disables drag resizing on touch screens / mobiledrawer viewports
    if (window.innerWidth <= 820) return;

    var resizer = document.createElement('div');
    resizer.id = 'sidebar-resizer';
    resizer.setAttribute('role', 'separator');
    resizer.setAttribute('tabindex', '0');
    resizer.setAttribute('aria-label', 'Sidebar width resizer');
    resizer.setAttribute('aria-valuemin', '68');
    resizer.setAttribute('aria-valuemax', '360');

    // Drag handle styles
    resizer.style.cssText = 'position:absolute; top:0; right:-3px; width:6px; height:100%; cursor:col-resize; z-index:100; background:transparent; transition:background 150ms ease; outline:none;';
    
    // Left border indicator inside resizer
    var indicator = document.createElement('div');
    indicator.style.cssText = 'position:absolute; top:0; left:2px; width:2px; height:100%; background:transparent; transition:background 150ms ease;';
    
    // Vertical grip icon at center
    var grip = document.createElement('div');
    grip.innerHTML = '⠇';
    grip.style.cssText = 'position:absolute; top:50%; left:-1px; transform:translateY(-50%); font-size:12px; font-weight:bold; color:var(--cyan); opacity:0; transition:opacity 150ms ease; pointer-events:none;';

    resizer.appendChild(indicator);
    resizer.appendChild(grip);
    sidebar.appendChild(resizer);

    // Hover transitions
    resizer.addEventListener('mouseenter', function() {
      indicator.style.background = 'var(--cyan)';
      grip.style.opacity = '1';
    });
    resizer.addEventListener('mouseleave', function() {
      if (!document.body.classList.contains('sidebar-dragging')) {
        indicator.style.background = 'transparent';
        grip.style.opacity = '0';
      }
    });

    var startX, startWidth;
    var defaultWidth = 260;
    var minWidth = 200;
    var maxWidth = 360;
    var collapsedWidth = 68;

    // Load persisted width from sessionStorage
    var savedWidth = sessionStorage.getItem('__sidebar_width__');
    var w = defaultWidth;
    if (savedWidth) {
      var parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= collapsedWidth && parsed <= maxWidth) {
        w = parsed;
      } else {
        sessionStorage.removeItem('__sidebar_width__');
      }
    }

    if (w === collapsedWidth) {
      document.body.classList.add('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-w', collapsedWidth + 'px');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      document.body.style.setProperty('--sidebar-w', w + 'px');
    }

    function updateWidth(w) {
      var safeW = parseInt(w, 10);
      if (isNaN(safeW) || safeW < collapsedWidth || safeW > maxWidth) {
        if (document.body.classList.contains('sidebar-collapsed')) {
          safeW = collapsedWidth;
        } else {
          safeW = defaultWidth;
        }
      }
      resizer.setAttribute('aria-valuenow', safeW);
      document.body.style.setProperty('--sidebar-w', safeW + 'px');
    }

    // Toggle button sync: updates inline style variable when toggle button is clicked
    var collapseBtn = document.getElementById('sidebar-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        if (window.innerWidth <= 820) {
          // Mobile: close the drawer!
          document.body.classList.remove('sidebar-open');
          var menuBtn = document.getElementById('mobile-menu-btn');
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        } else {
          // Desktop: collapse/expand sync
          setTimeout(function() {
            var isCollapsed = document.body.classList.contains('sidebar-collapsed');
            if (isCollapsed) {
              // Collapsed: set style to collapsedWidth
              updateWidth(collapsedWidth);
              sessionStorage.setItem('__sidebar_width__', collapsedWidth);
            } else {
              // Expanded: restore default or saved width
              var savedW = sessionStorage.getItem('__sidebar_width__');
              var w = savedW ? parseInt(savedW, 10) : defaultWidth;
              if (w === collapsedWidth) w = defaultWidth;
              updateWidth(w);
              sessionStorage.setItem('__sidebar_width__', w);
            }
          }, 10);
        }
      });
    }

    function doDrag(e) {
      var w = startWidth + (e.clientX - startX);
      if (w < 150) {
        // Snap to fully collapsed
        document.body.classList.add('sidebar-collapsed');
        updateWidth(collapsedWidth);
      } else if (w >= 150 && w < minWidth) {
        // Snaps to minWidth
        document.body.classList.remove('sidebar-collapsed');
        updateWidth(minWidth);
      } else if (w > maxWidth) {
        // Snaps to maxWidth
        updateWidth(maxWidth);
        // Haptic boundary limit pulse color shift
        indicator.style.background = 'var(--violet)';
      } else {
        document.body.classList.remove('sidebar-collapsed');
        updateWidth(w);
        indicator.style.background = 'var(--cyan)';
      }
    }

    function stopDrag() {
      document.body.classList.remove('sidebar-dragging');
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);

      // Persist chosen width
      var currentW = parseInt(document.body.style.getPropertyValue('--sidebar-w'), 10);
      if (isNaN(currentW) || currentW < collapsedWidth || currentW > maxWidth) {
        currentW = defaultWidth;
      }
      sessionStorage.setItem('__sidebar_width__', currentW);

      // Add a quick settle-snap animation unless reduced motion is on
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        sidebar.style.transition = 'width 120ms ease';
        var content = document.getElementById('main-content');
        var footer = document.querySelector('footer');
        if (content) content.style.transition = 'margin-left 120ms ease, width 120ms ease';
        if (footer) footer.style.transition = 'margin-left 120ms ease, width 120ms ease';

        setTimeout(function() {
          sidebar.style.transition = '';
          if (content) content.style.transition = '';
          if (footer) footer.style.transition = '';
        }, 130);
      }
      
      if (currentW !== collapsedWidth) {
        indicator.style.background = 'transparent';
        grip.style.opacity = '0';
      }
    }

    resizer.addEventListener('mousedown', function(e) {
      e.preventDefault();
      startX = e.clientX;
      var styleVal = parseInt(document.body.style.getPropertyValue('--sidebar-w'), 10);
      if (isNaN(styleVal) || styleVal < collapsedWidth || styleVal > maxWidth) {
        styleVal = document.body.classList.contains('sidebar-collapsed') ? collapsedWidth : defaultWidth;
      }
      startWidth = styleVal;
      
      document.body.classList.add('sidebar-dragging');
      indicator.style.background = 'var(--cyan)';
      grip.style.opacity = '1';

      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    });

    // Double-click to reset back to default width
    resizer.addEventListener('dblclick', function() {
      var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        sidebar.style.transition = 'width 150ms ease';
        var content = document.getElementById('main-content');
        var footer = document.querySelector('footer');
        if (content) content.style.transition = 'margin-left 150ms ease, width 150ms ease';
        if (footer) footer.style.transition = 'margin-left 150ms ease, width 150ms ease';

        setTimeout(function() {
          sidebar.style.transition = '';
          if (content) content.style.transition = '';
          if (footer) footer.style.transition = '';
        }, 160);
      }
      document.body.classList.remove('sidebar-collapsed');
      updateWidth(defaultWidth);
      sessionStorage.setItem('__sidebar_width__', defaultWidth);
    });

    // Keyboard controls
    resizer.addEventListener('keydown', function(e) {
      var currentW = parseInt(document.body.style.getPropertyValue('--sidebar-w'), 10) || (document.body.classList.contains('sidebar-collapsed') ? collapsedWidth : defaultWidth);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        var nextW = Math.min(maxWidth, currentW === collapsedWidth ? minWidth : currentW + 10);
        document.body.classList.remove('sidebar-collapsed');
        updateWidth(nextW);
        sessionStorage.setItem('__sidebar_width__', nextW);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        var nextW = currentW - 10;
        if (nextW < minWidth) {
          document.body.classList.add('sidebar-collapsed');
          updateWidth(collapsedWidth);
          sessionStorage.setItem('__sidebar_width__', collapsedWidth);
        } else {
          updateWidth(nextW);
          sessionStorage.setItem('__sidebar_width__', nextW);
        }
      }
    });

    // Focus focus outline matching theme
    resizer.addEventListener('focus', function() {
      indicator.style.background = 'var(--cyan)';
      grip.style.opacity = '1';
    });
    resizer.addEventListener('blur', function() {
      indicator.style.background = 'transparent';
      grip.style.opacity = '0';
    });
  }

})();
