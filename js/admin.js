(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initEditableIds();
    initAdminBar();
    loadSavedContent();
  });

  // Assign stable IDs to all static text elements so they can be saved
  function initEditableIds() {
    var selectors = [
      'h1', 'h2', 'h3', 'h4', 'p',
      '.eyebrow', '.stat-num', '.stat-label',
      '.t-title', '.t-meta', '.t-desc',
      '.badge', '.tech-badge', '.keyword',
      '.hl-text b', '.hl-text span',
      '.pub-type-badge', '.pub-authors', '.pub-venue', '.pub-abstract',
      '.book-info span', '.plat', '.handle',
      '.tag', '.card-status', '.book-title-mini', '.currently'
    ];
    
    var index = 0;
    selectors.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        // Skip elements inside modals, admin bar, or dynamically managed grids
        if (el.closest('.modal-overlay') || el.closest('.admin-bar')) return;
        // Skip cards inside dynamic grids (they are saved separately via array logic)
        if (el.closest('#research-grid') || el.closest('#projects-grid') || 
            el.closest('#publications-grid') || el.closest('#books-grid') || 
            el.closest('#experience-grid')) return;
        
        if (!el.id) {
          el.setAttribute('data-editable-id', 'edit-auto-' + index);
          index++;
        } else {
          el.setAttribute('data-editable-id', el.id);
        }
      });
    });
  }

  // ===== ENTER ADMIN MODE =====
  window.enterAdminMode = function() {
    var bar = document.getElementById('admin-bar');
    if (bar) bar.hidden = false;

    // Make all static text editable
    document.querySelectorAll('[data-editable-id]').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
    });

    // Make grid cards editable
    var gridEditables = ['.card h3', '.card p', '.tag', '.tech-badge', '.keyword', '.pub-abstract', '.pub-authors', '.pub-venue'];
    gridEditables.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        if (!el.closest('.modal-overlay')) el.setAttribute('contenteditable', 'true');
      });
    });

    // Show add buttons
    document.querySelectorAll('.add-card-btn').forEach(function(btn) {
      btn.style.display = 'flex';
    });

    sessionStorage.setItem('__admin_mode__', '1');
    window.showToast && window.showToast('Admin mode activated. Everything is now editable.', 'info');
  };

  // ===== EXIT ADMIN MODE =====
  function exitAdminMode() {
    var bar = document.getElementById('admin-bar');
    if (bar) bar.hidden = true;

    document.querySelectorAll('[contenteditable="true"]').forEach(function(el) {
      el.setAttribute('contenteditable', 'false');
    });

    document.querySelectorAll('.add-card-btn').forEach(function(btn) {
      btn.style.display = 'none';
    });

    sessionStorage.removeItem('__admin_mode__');
    window.showToast && window.showToast('Admin mode deactivated', 'info');
  }

  // ===== ADMIN BAR BUTTONS =====
  function initAdminBar() {
    // Restore admin mode if previously active
    if (sessionStorage.getItem('__admin_mode__') === '1') {
      window.enterAdminMode();
    }

    var logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', exitAdminMode);

    var saveBtn = document.getElementById('admin-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        saveContent();
        window.showToast && window.showToast('Content saved to browser.', 'success');
      });
    }

    var exportBtn = document.getElementById('admin-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        exportAllData();
      });
    }

    // Add card buttons (delegated)
    document.addEventListener('click', function(e) {
      var addBtn = e.target.closest('.add-card-btn');
      if (!addBtn) return;
      var gridId = addBtn.getAttribute('data-grid');
      if (gridId) addCard(gridId);
    });

    // Auto-save on content change (debounced)
    var saveTimer;
    document.addEventListener('input', function(e) {
      if (e.target.getAttribute('contenteditable') === 'true') {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
          saveContent();
        }, 2000);
      }
    });
  }

  // ===== CARD MANAGEMENT =====
  function addCard(gridId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    var addBtn = grid.querySelector('.add-card-btn');
    var card = document.createElement('article');
    card.className = 'card';
    card.innerHTML =
      '<span class="tag" contenteditable="true">TAG</span>' +
      '<h3 contenteditable="true">New entry</h3>' +
      '<p contenteditable="true">Click to edit this description.</p>' +
      '<div class="card-admin-controls">' +
        '<button class="btn btn-sm btn-ghost" onclick="this.closest(\'.card\').remove(); window.showToast && window.showToast(\'Card removed\', \'info\');" title="Delete">✕ Delete</button>' +
      '</div>';
    if (addBtn) {
      grid.insertBefore(card, addBtn);
    } else {
      grid.appendChild(card);
    }
    window.showToast && window.showToast('New card added. Click to edit.', 'success');
  }

  // ===== SAVE / LOAD CONTENT =====
  var CONTENT_KEY = '__site_content__';

  function saveContent() {
    var data = { staticText: {}, grids: {} };
    
    // Save all static [data-editable-id] fields
    document.querySelectorAll('[data-editable-id]').forEach(function(el) {
      var id = el.getAttribute('data-editable-id');
      data.staticText[id] = el.innerHTML;
    });

    // Save card grids
    ['research-grid', 'projects-grid', 'experience-grid', 'publications-grid', 'books-grid'].forEach(function(gridId) {
      var grid = document.getElementById(gridId);
      if (!grid) return;
      var cards = [];
      grid.querySelectorAll('.card:not(.add-card-btn)').forEach(function(card) {
        cards.push({
          tag: card.querySelector('.tag') ? card.querySelector('.tag').textContent : '',
          title: card.querySelector('h3') ? card.querySelector('h3').textContent : '',
          desc: card.querySelector('p') ? card.querySelector('p').textContent : ''
        });
      });
      data.grids[gridId] = cards;
    });

    try { localStorage.setItem(CONTENT_KEY, JSON.stringify(data)); } catch(e) {}
  }

  function loadSavedContent() {
    var raw;
    try { raw = localStorage.getItem(CONTENT_KEY); } catch(e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch(e) { return; }

    // Fallback for older save format
    if (data['hero-name'] && !data.staticText) {
       data = { staticText: data, grids: data };
    }

    if (data.staticText) {
      Object.keys(data.staticText).forEach(function(id) {
        var el = document.querySelector('[data-editable-id="' + id + '"]');
        if (el) el.innerHTML = data.staticText[id];
      });
    }
    
    // NOTE: Grid loading for dynamic cards would go here. 
    // Currently we just rely on static text load for the pre-rendered HTML.
    // Full CMS rebuild of DOM for grids is complex and not fully needed if we just edit what's there.
  }

  // ===== EXPORT ALL DATA =====
  function exportAllData() {
    var allData = {
      content: null,
      leads: null,
      messages: null,
      exportedAt: new Date().toISOString()
    };
    try { allData.content = JSON.parse(localStorage.getItem(CONTENT_KEY) || 'null'); } catch(e) {}
    try { allData.leads = JSON.parse(localStorage.getItem('__site_leads__') || '[]'); } catch(e) {}
    try { allData.messages = JSON.parse(localStorage.getItem('__site_messages__') || '[]'); } catch(e) {}

    var blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-data-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
    window.showToast && window.showToast('All data exported!', 'success');
  }

})();
