(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initLoginModal();
    initLeadCapture();
    initLeadsViewer();
    initProjectDetails();
    initToastSystem();
    initGenericModalClose();
  });

  // ===== GENERIC MODAL HELPERS =====
  function openModal(overlayId) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.hidden = false;
    overlay.classList.add("active");
    // Focus first input or close button
    var firstInput = overlay.querySelector("input, textarea, button");
    if (firstInput)
      setTimeout(function () {
        firstInput.focus();
      }, 100);
    // Escape key
    overlay._escHandler = function (e) {
      if (e.key === "Escape") closeModal(overlayId);
    };
    document.addEventListener("keydown", overlay._escHandler);
  }

  function closeModal(overlayId) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.hidden = true;
    if (overlay._escHandler) {
      document.removeEventListener("keydown", overlay._escHandler);
    }
  }

  // Close on overlay background click
  function initGenericModalClose() {
    document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  // ===== LOGIN MODAL =====
  function initLoginModal() {
    var trigger = document.getElementById("admin-trigger");
    var closeBtn = document.getElementById("modal-close");
    var submitBtn = document.getElementById("login-submit");

    if (trigger) {
      trigger.addEventListener("click", function () {
        openModal("login-overlay");
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter") openModal("login-overlay");
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeModal("login-overlay");
      });
    }
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        var u = document.getElementById("login-user").value.trim();
        var p = document.getElementById("login-phone").value.trim();
        var err = document.getElementById("login-error");
        // Demo credentials
        if (u === "Rajnish Singh" && p === "8920801616@123") {
          closeModal("login-overlay");
          if (window.enterAdminMode) window.enterAdminMode();
        } else {
          if (err) err.style.display = "block";
        }
      });
    }
  }

  // ===== LEAD CAPTURE MODAL =====
  var LEADS_KEY = "__site_leads__";

  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveLead(entry) {
    var leads = getLeads();
    leads.push(entry);
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch (e) {}
  }

  function initLeadCapture() {
    var overlay = document.getElementById("lead-overlay");
    var closeBtn = document.getElementById("lead-close");
    var submitBtn = document.getElementById("lead-submit");
    if (!overlay) return;

    // Check if already shown this session
    if (!sessionStorage.getItem("__lead_shown__")) {
      setTimeout(function () {
        openModal("lead-overlay");
        sessionStorage.setItem("__lead_shown__", "1");
      }, 500);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeModal("lead-overlay");
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        var name = document.getElementById("lead-name").value.trim();
        var location = document.getElementById("lead-location").value.trim();
        var affiliation = document
          .getElementById("lead-affiliation")
          .value.trim();
        var contact = document.getElementById("lead-contact").value.trim();

        if (!name && !location && !affiliation && !contact) {
          closeModal("lead-overlay");
          return;
        }

        saveLead({
          name: name || "Anonymous",
          location: location,
          affiliation: affiliation,
          contact: contact,
          at: new Date().toISOString(),
        });

        var formWrap = document.getElementById("lead-form-wrap");
        var thanks = document.getElementById("lead-thanks");
        var thanksName = document.getElementById("lead-thanks-name");

        if (formWrap) formWrap.style.display = "none";
        if (thanksName) thanksName.textContent = name || "friend";
        if (thanks) thanks.hidden = false;

        setTimeout(function () {
          closeModal("lead-overlay");
        }, 1400);
      });
    }
  }

  // ===== LEADS VIEWER (Admin) =====
  function initLeadsViewer() {
    var viewBtn = document.getElementById("admin-view-leads");
    var closeBtn = document.getElementById("leads-view-close");
    var exportBtn = document.getElementById("leads-export");
    var clearBtn = document.getElementById("leads-clear");

    if (viewBtn) {
      viewBtn.addEventListener("click", function () {
        renderLeads();
        openModal("leads-view-overlay");
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeModal("leads-view-overlay");
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var blob = new Blob([JSON.stringify(getLeads(), null, 2)], {
          type: "application/json",
        });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "site-leads.json";
        a.click();
        URL.revokeObjectURL(a.href);
        window.showToast && window.showToast("Leads exported!", "success");
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (confirm("Clear all stored submissions on this browser?")) {
          localStorage.removeItem(LEADS_KEY);
          renderLeads();
          window.showToast &&
            window.showToast("All submissions cleared.", "info");
        }
      });
    }
  }

  function renderLeads() {
    var list = document.getElementById("leads-list");
    if (!list) return;
    var leads = getLeads();
    list.innerHTML = "";
    if (leads.length === 0) {
      list.innerHTML =
        '<p style="color:var(--text-dim);font-size:13px;padding:10px 0;">No submissions yet on this browser.</p>';
      return;
    }
    leads
      .slice()
      .reverse()
      .forEach(function (l) {
        var row = document.createElement("div");
        row.style.cssText =
          "border:1px solid var(--line);border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:8px;";
        var when = new Date(l.at).toLocaleString("en-IN");
        row.innerHTML =
          "<b>" +
          escapeHTML(l.name) +
          "</b><br>" +
          '<span style="color:var(--text-dim);">' +
          escapeHTML(l.location || "—") +
          " · " +
          escapeHTML(l.affiliation || "—") +
          " · " +
          escapeHTML(l.contact || "—") +
          "</span><br>" +
          '<span style="color:var(--text-dim);font-family:var(--font-mono);font-size:11px;">' +
          when +
          "</span>";
        list.appendChild(row);
      });
  }

  // ===== PROJECT DETAILS MODAL =====
  function initProjectDetails() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest('[data-action="view-details"]');
      if (!btn) return;
      var card = btn.closest(".card--project");
      if (!card) return;

      var title = card.querySelector("h3")
        ? card.querySelector("h3").textContent
        : "";
      var desc = card.querySelector("p")
        ? card.querySelector("p").textContent
        : "";
      var tag = card.querySelector(".tag")
        ? card.querySelector(".tag").textContent
        : "";
      var techs = [];
      card.querySelectorAll(".tech-badge").forEach(function (t) {
        techs.push(t.textContent);
      });
      var status = card.querySelector(".card-status")
        ? card.querySelector(".card-status").textContent
        : "";

      var titleEl = document.getElementById("project-detail-title");
      var bodyEl = document.getElementById("project-detail-body");
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) {
        bodyEl.innerHTML =
          '<div style="margin-bottom:16px;">' +
          '<span class="tag" style="margin-bottom:12px;display:inline-block;">' +
          escapeHTML(tag) +
          "</span>" +
          (status
            ? ' <span class="card-status card-status--active">' +
              escapeHTML(status) +
              "</span>"
            : "") +
          "</div>" +
          '<p style="color:var(--text-dim);font-size:14px;line-height:1.7;margin-bottom:20px;">' +
          escapeHTML(desc) +
          "</p>" +
          (techs.length
            ? '<div style="margin-bottom:16px;"><strong style="font-size:13px;">Tech Stack</strong><div class="tech-stack" style="margin-top:8px;">' +
              techs
                .map(function (t) {
                  return (
                    '<span class="tech-badge">' + escapeHTML(t) + "</span>"
                  );
                })
                .join("") +
              "</div></div>"
            : "") +
          '<div class="links" style="border-top:1px solid var(--line);padding-top:12px;">' +
          '<a href="https://github.com/givemehat" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);">View on GitHub →</a>' +
          "</div>";
      }
      openModal("project-detail-overlay");
    });

    var closeBtn = document.getElementById("project-detail-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeModal("project-detail-overlay");
      });
    }
  }

  // ===== TOAST SYSTEM =====
  function initToastSystem() {
    window.showToast = function (message, type) {
      type = type || "success";
      var container = document.getElementById("toast-container");
      if (!container) return;
      var toast = document.createElement("div");
      toast.className = "toast toast--" + type;
      var icon = type === "success" ? "✓" : type === "error" ? "✗" : "ℹ";
      toast.innerHTML =
        '<span style="font-weight:600;">' +
        icon +
        "</span> " +
        escapeHTML(message);
      container.appendChild(toast);
      setTimeout(function () {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        setTimeout(function () {
          toast.remove();
        }, 300);
      }, 3000);
    };
  }

  // ===== UTILITY =====
  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
