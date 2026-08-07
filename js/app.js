(function() {
  'use strict';

  // ===== UTILITY =====
  window.app = window.app || {};

  document.addEventListener('DOMContentLoaded', function() {
    initDates();
    initVisitorCounter();
    initTypingAnimation();
    initThemeToggle();
    initNavigation();
    initSectionLinks();
    initTimelineExpanders();
    initContactForm();
    initPublicationFilters();
    initGSAPAnimations();
    initCustomCursor();
    initMagneticButtons();
    initCardTilt();
    initParticles();
    initRipples();
    initPubThumbnails();
    initLoader();
    initKonami();
  });

  // ---- Publication Thumbnail Click Popup ----
  function initPubThumbnails() {
    var popup     = document.getElementById('pub-article-popup');
    var popupImg  = document.getElementById('pub-popup-img');
    var popupTitle= document.getElementById('pub-popup-title');
    var popupLink = document.getElementById('pub-popup-link');
    var closeBtn  = document.getElementById('pub-popup-close');
    var dismissBtn= document.getElementById('pub-popup-dismiss');
    if (!popup) return;

    // Map card IDs → titles (fallback: read from the card's h3)
    function openPopup(thumbWrap) {
      var url   = thumbWrap.dataset.url || '#';
      var img   = thumbWrap.querySelector('.pub-thumb');
      var card  = thumbWrap.closest('.medium-card');
      var h3    = card ? card.querySelector('h3') : null;
      var title = h3 ? h3.textContent.trim() : 'Medium Article';

      popupImg.src        = img ? img.src : '';
      popupImg.alt        = title;
      popupTitle.textContent = title;
      popupLink.href      = url;

      // Make visible and trigger CSS animation
      popup.style.display = 'flex';
      setTimeout(function() {
        popup.classList.add('active');
      }, 10);
      
      // Focus the link for keyboard accessibility
      setTimeout(function() { popupLink.focus(); }, 50);
    }

    function closePopup() {
      popup.classList.remove('active');
      // Completely remove from layout flow after animation completes
      setTimeout(function() {
        if (!popup.classList.contains('active')) {
          popup.style.display = 'none';
        }
      }, 250);
    }

    // Wire all non-locked thumbnail wrappers
    document.querySelectorAll('.pub-thumb-wrap:not(.locked-thumb)').forEach(function(wrap) {
      wrap.addEventListener('click', function() { openPopup(wrap); });
      // Keyboard: Enter / Space
      wrap.setAttribute('role', 'button');
      wrap.setAttribute('tabindex', '0');
      wrap.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopup(wrap); }
      });
    });

    // Wire locked elements to show toast feedback
    document.querySelectorAll('.locked-card, .locked-thumb, .locked-btn').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.showToast === 'function') {
          window.showToast("Manuscript restricted: This publication is currently under peer review.", "info");
        }
      });
    });

    // Close buttons
    closeBtn  && closeBtn.addEventListener('click', closePopup);
    dismissBtn && dismissBtn.addEventListener('click', closePopup);

    // Click outside popup box to close
    popup.addEventListener('click', function(e) {
      if (e.target === popup) closePopup();
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
    });
  }

  // ---- GSAP Animations ----
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;
    
    // Respect prefers-reduced-motion
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 1. Hero Load Sequence
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Ensure elements are hidden initially via GSAP to avoid FOUC
    gsap.set(".hero .eyebrow, #hero-name, #typed-role, #hero-bio, .currently, .btn-row a, .highlights .hl-chip", { 
      y: 20, 
      opacity: 0 
    });

    tl.to(".hero .eyebrow", { y: 0, opacity: 1, duration: 0.6, delay: 0.1 })
      .to("#hero-name", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .to("#typed-role", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .to("#hero-bio", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .to(".currently", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .to(".btn-row a", { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, "-=0.4")
      .to(".highlights .hl-chip", { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, "-=0.3");

    // Profile Photo scale-in
    gsap.set("#profile-img", { scale: 0.8, opacity: 0 });
    gsap.to("#profile-img", { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)", delay: 0.2 });

    // 2. Scroll-Triggered Reveals
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      // Scroll Progress Bar
      var progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        gsap.to(progressBar, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3
          }
        });
      }

      // Parallax Background Depth
      var particlesBg = document.getElementById('particles-bg');
      if (particlesBg) {
        gsap.to(particlesBg, {
          y: 150, // Moves slightly downwards as you scroll down
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }

      // Fade in sections/panels as they scroll into view
      gsap.utils.toArray('.panel, .section-title, .section-sub').forEach(function(elem) {
        gsap.fromTo(elem, 
          { y: 30, opacity: 0 }, 
          {
            scrollTrigger: {
              trigger: elem,
              start: "top 85%",
              once: true
            },
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out"
          }
        );
      });

      // Scrubbed reveal for cards inside grids (Narrative scroll)
      gsap.utils.toArray('.grid-2, .grid-3').forEach(function(grid) {
        var cards = grid.querySelectorAll('.card');
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { x: -30, opacity: 0 },
            {
              scrollTrigger: {
                trigger: grid,
                start: "top 90%",
                end: "top 40%",
                scrub: 1
              },
              x: 0,
              opacity: 1,
              stagger: 0.1,
              ease: "none"
            }
          );
        }
      });
      
      // Decode text effect for section titles
      gsap.utils.toArray('h2.section-title').forEach(function(title) {
        var originalText = title.textContent;
        var chars = "!<>-_\\\\/[]{}—=+*^?#_";
        
        gsap.to(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
            once: true
          },
          duration: 1,
          onUpdate: function() {
            var progress = this.progress();
            var revealCount = Math.floor(progress * originalText.length);
            var result = "";
            for(var i = 0; i < originalText.length; i++) {
              if(i < revealCount) {
                result += originalText[i];
              } else if (originalText[i] === " ") {
                result += " ";
              } else {
                result += chars[Math.floor(Math.random() * chars.length)];
              }
            }
            title.textContent = result;
          },
          onComplete: function() {
            title.textContent = originalText;
          }
        });
      });
    }
  }

  // ---- Year & Date ----
  function initDates() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    var lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.textContent = "June 2026";
    }
  }

  // ---- Visitor Counter (session-based) ----
  function initVisitorCounter() {
    var targetCount = 568;
    try {
      var savedCount = Number(sessionStorage.getItem('__demo_visits__'));
      if (savedCount) targetCount = savedCount;
      targetCount += 1;
      sessionStorage.setItem('__demo_visits__', targetCount);
    } catch(e) {
      targetCount += 1; // Fallback if sessionStorage fails
    }
    var el1 = document.getElementById('visitor-count');
    var el2 = document.getElementById('footer-visitors');
    
    // Animate the counter if GSAP is available
    if (typeof gsap !== 'undefined' && (el1 || el2)) {
      var obj = { count: 0 };
      gsap.to(obj, {
        scrollTrigger: {
          trigger: el1 || el2,
          start: "top 95%",
          once: true
        },
        count: targetCount,
        duration: 2,
        ease: "power2.out",
        onUpdate: function() {
          var formatted = Math.floor(obj.count).toLocaleString();
          if (el1) el1.textContent = formatted;
          if (el2) el2.textContent = formatted;
        }
      });
    } else {
      var formatted = targetCount.toLocaleString();
      if (el1) el1.textContent = formatted;
      if (el2) el2.textContent = formatted;
    }
  }

  // ---- Typing Animation ----
  function initTypingAnimation() {
    var roles = ["AI Researcher", "Machine Learning Enthusiast", "IBM Qiskit Advocate", "Quantum Computing Explorer", "Open Source Contributor"];
    var typedEl = document.getElementById('typed-role');
    if (!typedEl) return;
    var ri = 0, ci = 0, deleting = false;

    function tick() {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        typedEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 1200); return; }
      } else {
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 40 : 70);
    }
    tick();
  }

  // ---- Theme Toggle ----
  function initThemeToggle() {
    var toggleBtn = document.getElementById('theme-toggle');
    var THEME_KEY = '__theme_override__';
    var saved = localStorage.getItem(THEME_KEY);

    function applyTheme(dark) {
      document.body.classList.toggle('dark', dark);
      if (toggleBtn) {
        // Update SVG icon
        toggleBtn.innerHTML = dark
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
      }
    }

    if (saved === 'dark') { applyTheme(true); }
    else if (saved === 'light') { applyTheme(false); }
    else {
      // Auto: prefer system, then time-based
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDark) {
        var hour = new Date().getHours();
        prefersDark = hour >= 20 || hour < 6;
      }
      applyTheme(prefersDark);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        var nowDark = document.body.classList.toggle('dark');
        applyTheme(nowDark);
        try { localStorage.setItem(THEME_KEY, nowDark ? 'dark' : 'light'); } catch(e) {}
      });
    }
  }

  // ---- Tab Navigation (Panel System) ----
  function initNavigation() {
    var tabs = Array.from(document.querySelectorAll('#tab-bar a[data-section]'));
    var panels = Array.from(document.querySelectorAll('.panel'));
    var navPill = document.getElementById('nav-pill');

    function showPanel(sectionId, updateHash) {
      var panelId = 'panel-' + sectionId;
      panels.forEach(function(p) {
        var isActive = p.id === panelId;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-hidden', !isActive);
      });
      tabs.forEach(function(t) {
        var isActive = t.getAttribute('data-section') === sectionId;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive);
        t.setAttribute('tabindex', isActive ? '0' : '-1');
        
        // Move nav pill
        if (isActive && navPill) {
          navPill.style.opacity = '1';
          navPill.style.transform = 'translateY(' + t.offsetTop + 'px)';
        }
      });
      if (updateHash !== false) {
        history.pushState(null, '', '#' + sectionId);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Expose for other scripts
    window.app.showPanel = showPanel;
    
    // Initial pill position
    setTimeout(function() {
      var activeTab = document.querySelector('.nav-links a.active');
      if (activeTab && navPill) {
        navPill.style.opacity = '1';
        navPill.style.transform = 'translateY(' + activeTab.offsetTop + 'px)';
      }
    }, 100);

    // Click handler
    tabs.forEach(function(tab, index) {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        showPanel(tab.getAttribute('data-section'));
        // Close sidebar on mobile after clicking a link
        if (window.innerWidth <= 820) {
          document.body.classList.remove('sidebar-open');
        }
      });

      // Keyboard navigation
      tab.addEventListener('keydown', function(e) {
        var newIndex;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % tabs.length;
          tabs[newIndex].focus();
          showPanel(tabs[newIndex].getAttribute('data-section'));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + tabs.length) % tabs.length;
          tabs[newIndex].focus();
          showPanel(tabs[newIndex].getAttribute('data-section'));
        }
      });
    });

    // Mobile Menu Toggle
    var menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function() {
        if (window.innerWidth > 820) {
          // Desktop: hamburger re-expands a collapsed sidebar
          document.body.classList.remove('sidebar-collapsed');
          menuBtn.setAttribute('aria-expanded', 'true');
        } else {
          // Mobile: toggle drawer
          var isOpen = document.body.classList.toggle('sidebar-open');
          menuBtn.setAttribute('aria-expanded', String(isOpen));
        }
      });

      // Mobile backdrop click closes the drawer
      document.addEventListener('click', function(e) {
        if (window.innerWidth <= 820 &&
            document.body.classList.contains('sidebar-open') &&
            !e.target.closest('#sidebar') &&
            !e.target.closest('.hamburger-btn') &&
            !e.target.closest('#mobile-menu-btn')) {
          document.body.classList.remove('sidebar-open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
    
    // Lightbox Close Logic
    var lightbox = document.getElementById('cert-lightbox');
    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        lightbox.style.display = 'none';
      });
    }

    // Handle hash on load
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('panel-' + hash)) {
      showPanel(hash, false);
    }

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
      var h = window.location.hash.replace('#', '');
      if (h && document.getElementById('panel-' + h)) {
        showPanel(h, false);
      }
    });
  }

  // ---- Section Links (data-section anywhere) ----
  function initSectionLinks() {
    document.body.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-section]');
      if (trigger && !trigger.closest('#tab-bar')) {
        e.preventDefault();
        var section = trigger.getAttribute('data-section');
        if (window.app && window.app.showPanel) {
          window.app.showPanel(section);
        }
      }
    });
  }

  // ---- Timeline Expanders ----
  function initTimelineExpanders() {
    document.querySelectorAll('.t-expand-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item = btn.closest('.t-item') || btn.closest('.t-content');
        var details = item.querySelector('.t-details');
        if (details) {
          var expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', !expanded);
          details.hidden = expanded;
        }
      });
    });
  }

  // ---- Contact Form ----
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var nameInput = document.getElementById('contact-name');
      var emailInput = document.getElementById('contact-email');
      var messageInput = document.getElementById('contact-message');
      var submitBtn = form.querySelector('button[type="submit"]');

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var message = messageInput.value.trim();

      if (!name || !email || !message) {
        window.showToast && window.showToast('Please fill in all required fields.', 'error');
        return;
      }
      
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        window.showToast && window.showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate loading state
      var originalBtnText = submitBtn.innerText;
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function() {
        // Save to localStorage as a dummy backend
        var messages = [];
        try { messages = JSON.parse(localStorage.getItem('__site_messages__') || '[]'); } catch(e) {}
        messages.push({ name: name, email: email, message: message, at: new Date().toISOString() });
        try { localStorage.setItem('__site_messages__', JSON.stringify(messages)); } catch(e) {}
        
        form.reset();
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        
        window.showToast && window.showToast('Message sent! Thank you, ' + name + '.', 'success');
      }, 1000);
    });
  }

  // ---- Publication Filters ----
  function initPublicationFilters() {
    var pills = document.querySelectorAll('.filter-bar .tab-pill');
    var cards = document.querySelectorAll('#publications-grid .pub-card');
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        pills.forEach(function(p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var filter = pill.getAttribute('data-filter');
        cards.forEach(function(card) {
          if (filter === 'all' || card.getAttribute('data-type') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // DYNAMIC DATA RENDERING (Certs & Projects)
  // ==========================================
  
  document.addEventListener('DOMContentLoaded', function() {
    var data = window.appData || {};
    
    // 1. Render Certifications
    var certContainer = document.getElementById('certifications-container');
    if (certContainer) {
      certContainer.innerHTML = '';
      
      // Featured Certs
      if (data.featuredCertifications && data.featuredCertifications.length > 0) {
        var featuredHeader = document.createElement('h3');
        featuredHeader.className = 'section-title';
        featuredHeader.style.gridColumn = '1 / -1';
        featuredHeader.style.marginTop = '0';
        featuredHeader.style.marginBottom = '-10px';
        featuredHeader.style.fontSize = '24px';
        featuredHeader.innerHTML = 'Featured <span class="highlight">Certificates</span>';
        certContainer.appendChild(featuredHeader);

        data.featuredCertifications.forEach(function(cert) {
          var focusHTML = '';
          if (cert.focus && cert.focus.length > 0) {
            focusHTML = '<div class="cert-badges">';
            cert.focus.forEach(function(f) {
              focusHTML += '<span class="cert-badge">' + f + '</span>';
            });
            focusHTML += '</div>';
          }
          
          var card = document.createElement('div');
          card.className = 'cert-featured-card';
          var imgStyle = cert.imgStyle ? 'style="' + cert.imgStyle + '"' : '';
          card.innerHTML = 
            '<div class="cert-img-container">' +
              '<img src="' + cert.image + '" alt="' + cert.title + '" loading="lazy" ' + imgStyle + '>' +
              focusHTML +
            '</div>';
            
          card.addEventListener('click', function() {
            var lightbox = document.getElementById('cert-lightbox');
            var lightboxImg = document.getElementById('lightbox-img');
            if (lightbox && lightboxImg) {
              lightboxImg.src = cert.image;
              if (cert.imgStyle) {
                lightboxImg.setAttribute('style', 'max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); ' + cert.imgStyle);
              } else {
                lightboxImg.setAttribute('style', 'max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);');
              }
              lightbox.style.display = 'flex';
            }
          });
          
          certContainer.appendChild(card);
        });
        
        var hr = document.createElement('hr');
        hr.style.gridColumn = '1 / -1';
        hr.style.border = 'none';
        hr.style.borderTop = '1px solid var(--line)';
        hr.style.margin = '20px 0';
        certContainer.appendChild(hr);
      }

      // All Other Certs
      if (data.certifications) {
        // Create a Set of featured certificate titles to avoid duplicates
        var featuredTitles = new Set();
        if (data.featuredCertifications) {
          data.featuredCertifications.forEach(function(fc) {
            featuredTitles.add(fc.title.toLowerCase());
          });
        }
        
        data.certifications.forEach(function(cert) {
          // Skip if already featured
          if (featuredTitles.has(cert.title.toLowerCase())) return;
          
          var card = document.createElement('div');
          card.className = 'cert-card';
          card.innerHTML = 
            '<h3>' + cert.title + '</h3>' +
            '<div class="cert-issuer">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' +
              cert.issuer +
            '</div>' +
            '<div class="cert-date">' + cert.date + '</div>' +
            '<div class="cert-skills">Skills: ' + (cert.skills || 'N/A') + '</div>';
          certContainer.appendChild(card);
        });
      }
    }

    // 2. Fetch and Render Projects (Featured + GitHub)
    var projectsContainer = document.querySelector('#panel-projects .section-alt .container');
    var githubUser = data.githubUser;
    
    if (projectsContainer) {
      projectsContainer.innerHTML = '<div class="section-header"><h2 class="title">Featured <span class="highlight">Projects</span></h2><p class="subtitle">Highlighting major research and development work.</p></div>';
      
      // Render Featured Projects
      if (data.featuredProjects && data.featuredProjects.length > 0) {
        var featuredGrid = document.createElement('div');
        featuredGrid.className = 'project-grid';
        featuredGrid.style.marginBottom = '60px'; // Space before GitHub repos
        
        data.featuredProjects.forEach(function(fp) {
          var card = document.createElement('a');
          card.href = fp.link;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
          card.className = 'project-card';
          card.style.borderColor = 'rgba(0, 229, 255, 0.4)'; // Highlight featured
          
          card.innerHTML = 
            '<h3 style="color:var(--cyan);">' + fp.title + '</h3>' +
            '<div class="cert-date" style="margin-bottom:8px;">' + fp.date + '</div>' +
            '<div class="project-desc" style="font-size:14px; margin-bottom:20px;">' + fp.description + '</div>' +
            '<div class="cert-skills">Skills: ' + fp.skills.join(', ') + '</div>';
          featuredGrid.appendChild(card);
        });
        projectsContainer.appendChild(featuredGrid);
      }

      // Render GitHub Header
      var ghHeader = document.createElement('div');
      ghHeader.className = 'section-header';
      ghHeader.innerHTML = '<h2 class="title">GitHub <span class="highlight">Repositories</span></h2><p class="subtitle">Live public projects fetched from GitHub.</p>';
      projectsContainer.appendChild(ghHeader);

      var grid = document.createElement('div');
      grid.className = 'project-grid';
      grid.id = 'github-grid';
      projectsContainer.appendChild(grid);
      
      if (githubUser) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px;">Initializing uplink to GitHub API... Fetching repositories...</div>';
        
        fetch('https://api.github.com/users/' + githubUser + '/repos?per_page=100&sort=updated')
          .then(function(response) {
            if (!response.ok) throw new Error('GitHub API limit reached or network error');
            return response.json();
          })
          .then(function(repos) {
            grid.innerHTML = '';
            var sortedRepos = repos.sort(function(a, b) { return b.stargazers_count - a.stargazers_count; });
            
            if(sortedRepos.length === 0) {
              grid.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-dim);">No public repositories found.</div>';
              return;
            }

            sortedRepos.forEach(function(repo) {
              var card = document.createElement('a');
              card.href = repo.html_url;
              card.target = '_blank';
              card.rel = 'noopener noreferrer';
              card.className = 'project-card';
              
              var lang = repo.language || 'Code';
              var desc = repo.description ? (repo.description.length > 100 ? repo.description.substring(0, 100) + '...' : repo.description) : 'No description available for this repository.';
              
              card.innerHTML = 
                '<h3>' + repo.name + '</h3>' +
                '<div class="project-lang">' +
                  '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--cyan); margin-right:4px;"></span>' +
                  lang +
                '</div>' +
                '<div class="project-desc">' + desc + '</div>' +
                '<div class="project-stats">' +
                  '<span>⭐ ' + repo.stargazers_count + '</span>' +
                  '<span>🍴 ' + repo.forks_count + '</span>' +
                '</div>';
              grid.appendChild(card);
            });
          })
          .catch(function(err) {
            console.error(err);
            grid.innerHTML = '<div style="grid-column: 1/-1; color: #ff3366; text-align:center; padding:40px;">Error fetching repositories: ' + err.message + '. Please try again later.</div>';
          });
      }
      }
      
      // 3. Render Results Gallery
      var resultsGrid = document.getElementById('results-grid');
      if (resultsGrid && data.results && data.results.length > 0) {
        resultsGrid.innerHTML = '';
        data.results.forEach(function(res) {
          var card = document.createElement('div');
          card.className = 'result-card';
          var titleStr = res.title ? '<div class="result-info"><h4>' + res.title + '</h4></div>' : '';
          card.innerHTML = 
            '<div class="result-img-container">' +
              '<img src="' + res.image + '" alt="' + (res.title || 'Result') + '" loading="lazy">' +
            '</div>' + titleStr;
            
          card.addEventListener('click', function() {
            var lightbox = document.getElementById('cert-lightbox');
            var lightboxImg = document.getElementById('lightbox-img');
            if (lightbox && lightboxImg) {
              lightboxImg.src = res.image;
              lightbox.style.display = 'flex';
              // Trigger reflow
              void lightbox.offsetWidth;
              lightbox.classList.add('active');
            }
          });
          resultsGrid.appendChild(card);
        });
      } else if (resultsGrid) {
        resultsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-dim); padding: 40px; border: 1px dashed var(--border-color); border-radius: 8px;">No results uploaded yet. Use Admin tools or update data.js to add images.</div>';
      }
  });

  // ==========================================
  // ADVANCED MOTION & TRENDY EFFECTS
  // ==========================================
  
  // 1. Custom Cursor
  function initCustomCursor() {
    var cursor = document.getElementById('custom-cursor');
    var follower = document.getElementById('custom-cursor-follower');
    if (!cursor || !follower || typeof gsap === 'undefined') return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Use GSAP quickTo for performance
    var xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
    var yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});
    var fXTo = gsap.quickTo(follower, "x", {duration: 0.4, ease: "power3"});
    var fYTo = gsap.quickTo(follower, "y", {duration: 0.4, ease: "power3"});

    window.addEventListener('mousemove', function(e) {
      xTo(e.clientX);
      yTo(e.clientY);
      fXTo(e.clientX);
      fYTo(e.clientY);
    });

    // Hover effect on interactive elements
    var interactives = document.querySelectorAll('a, button, .card, input, textarea, select, [role="button"], .pub-thumb-wrap');
    interactives.forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        follower.classList.add('hover-active');
        gsap.to(cursor, { scale: 0.5, duration: 0.2 });
        
        // Custom Text Labels for Cursor
        var text = el.dataset.cursor || '';
        if (el.tagName.toLowerCase() === 'a' && !text) text = 'Go';
        if (el.classList.contains('card') && !text) text = 'View';
        if (el.classList.contains('pub-thumb-wrap') && !text) text = 'Open';
        
        if (text) {
          follower.setAttribute('data-cursor-text', text);
        } else {
          follower.removeAttribute('data-cursor-text');
        }
      });
      el.addEventListener('mouseleave', function() {
        follower.classList.remove('hover-active');
        follower.removeAttribute('data-cursor-text');
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      });
    });
  }

  // 2. Magnetic Buttons
  function initMagneticButtons() {
    var magneticBtns = document.querySelectorAll('.btn');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    magneticBtns.forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        
        // Move button slightly towards cursor
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      btn.addEventListener('mouseleave', function() {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }

  // 3. Card 3D Tilt
  function initCardTilt() {
    var cards = document.querySelectorAll('.card');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left; // x position within the element.
        var y = e.clientY - rect.top;  // y position within the element.
        
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        
        var rotateX = ((y - centerY) / centerY) * -5; // max 5 deg tilt
        var rotateY = ((x - centerX) / centerX) * 5;
        
        // Combine with existing hover translateY if possible, or just set transform directly
        card.style.transform = `perspective(1000px) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      card.addEventListener('mouseleave', function() {
        // Reset tilt but keep the hover lift out transition smooth
        card.style.transform = '';
      });
    });
  }

  // 4. WebGL/Canvas Particle Field (Constellation)
  function initParticles() {
    var canvas = document.getElementById('particles-bg');
    if (!canvas) return;
    
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var particles = [];
    var maxParticles = 60; // Keep low for performance
    var mouse = { x: null, y: null, radius: 100 };
    
    // Resize canvas
    function resize() {
      var mainContent = document.getElementById('main-content');
      canvas.width = mainContent ? mainContent.offsetWidth : window.innerWidth;
      // We want the height to cover the initial screen or hero section usually
      canvas.height = window.innerHeight; 
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Mouse movement
    window.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', function() {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }
      
      draw() {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.8)'; // Cyan
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
      
      update() {
        // Drift
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Mouse interaction (repel)
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;
          
          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }
    }

    // Init array
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    // Animate loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect lines
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124, 92, 255, ${1 - distance/120})`; // Violet fading out
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  // 5. Button Ripple Micro-Interaction
  function initRipples() {
    var buttons = document.querySelectorAll('.btn-primary, .btn');
    buttons.forEach(function(btn) {
      // Ensure button has relative positioning for the absolute ripple
      if (window.getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', function(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.background = 'rgba(255, 255, 255, 0.4)';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.left = x - 50 + 'px';
        ripple.style.top = y - 50 + 'px';
        ripple.style.transform = 'scale(0)';
        ripple.style.opacity = '1';
        
        btn.appendChild(ripple);

        if (typeof gsap !== 'undefined') {
          gsap.to(ripple, {
            scale: 4,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: function() {
              ripple.remove();
            }
          });
        } else {
          // Fallback if GSAP fails
          setTimeout(function() { ripple.remove(); }, 600);
        }
      });
    });
  }
  // ==========================================
  // LOADER & EASTER EGGS
  // ==========================================

  function initLoader() {
    var loader = document.getElementById('global-loader');
    if (!loader) return;
    
    // Hide loader on window load or fallback to 1.5s
    var hideLoader = function() {
      if (loader.classList.contains('hidden')) return;
      loader.classList.add('hidden');
      setTimeout(function() { loader.style.display = 'none'; }, 800);
      
      // Trigger SFX boot sound if enabled
      if (typeof window.sfx !== 'undefined' && localStorage.getItem('__sound_enabled__') === 'true') {
        window.sfx.successChime();
      }
    };

    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 1500); // Fallback max loading time
  }

  function initKonami() {
    var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var konamiPosition = 0;
    
    document.addEventListener('keydown', function(e) {
      if (e.key === konamiCode[konamiPosition]) {
        konamiPosition++;
        if (konamiPosition === konamiCode.length) {
          activateEasterEgg();
          konamiPosition = 0;
        }
      } else {
        konamiPosition = 0;
      }
    });
    
    function activateEasterEgg() {
      if (typeof window.sfx !== 'undefined') window.sfx.glitch();
      document.body.style.transition = 'filter 0.1s ease';
      document.body.style.filter = 'hue-rotate(90deg) invert(1) contrast(150%)';
      setTimeout(function() {
        document.body.style.filter = '';
        setTimeout(function() {
          if (typeof window.showToast === 'function') {
            window.showToast("Quantum Overdrive Activated.", "success");
          }
        }, 300);
      }, 500);
    }
  }

})();
