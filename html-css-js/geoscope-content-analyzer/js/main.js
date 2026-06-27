// main.js
// Handles: tab switching, shared input state, localStorage persistence,
// live snippet preview. Other tabs (word count, SEO, GEO) hook into
// window.AppState and call their own render functions on every input event.

(function () {
  "use strict";

  const STORAGE_KEY = "content-analyzer-draft-v1";

  const inputs = {
    focusKeyword: document.getElementById("focusKeyword"),
    seoTitle: document.getElementById("seoTitle"),
    metaDesc: document.getElementById("metaDesc"),
    urlSlug: document.getElementById("urlSlug"),
    contentBody: document.getElementById("contentBody"),
  };

  // Shared state object other modules (wordCount.js, seoChecks.js, geoChecks.js)
  // will read from. They should call AppState.onUpdate(fn) to subscribe.
  const AppState = {
    get: () => ({
      focusKeyword: inputs.focusKeyword.value,
      seoTitle: inputs.seoTitle.value,
      metaDesc: inputs.metaDesc.value,
      urlSlug: inputs.urlSlug.value,
      contentBody: inputs.contentBody.innerHTML,
    }),
    _subscribers: [],
    onUpdate: function (fn) {
      this._subscribers.push(fn);
    },
    _notify: function () {
      const state = this.get();
      this._subscribers.forEach((fn) => {
        try {
          fn(state);
        } catch (e) {
          console.error("AppState subscriber error:", e);
        }
      });
    },
  };
  window.AppState = AppState;

  // ---- Tab switching ----
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = {
    seo: document.getElementById("panel-seo"),
    geo: document.getElementById("panel-geo"),
    wordcount: document.getElementById("panel-wordcount"),
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      Object.values(panels).forEach((p) => p.classList.remove("active"));
      const target = btn.getAttribute("data-tab");
      panels[target].classList.add("active");
    });
  });

  // ---- Snippet preview ----
  const snippetTitle = document.getElementById("snippetTitle");
  const snippetUrl = document.getElementById("snippetUrl");
  const snippetDesc = document.getElementById("snippetDesc");
  const snippetHint = document.getElementById("snippetHint");

  const TITLE_LIMIT = 60;
  const DESC_LIMIT = 156;

  function truncate(str, limit) {
    if (str.length <= limit) return str;
    return str.slice(0, limit - 1).trim() + "…";
  }

  function renderSnippet(state) {
    const title = state.seoTitle.trim() || "Your SEO title goes here";
    const desc = state.metaDesc.trim() || "Your meta description preview will appear here as you type.";

    snippetTitle.textContent = truncate(title, TITLE_LIMIT);
    snippetUrl.textContent = "yoursite.com" + normalizeSlug(state.urlSlug);
    snippetDesc.textContent = truncate(desc, DESC_LIMIT);

    const hints = [];
    if (state.seoTitle.trim()) {
      hints.push(`Title: ${state.seoTitle.length}/${TITLE_LIMIT} chars${state.seoTitle.length > TITLE_LIMIT ? " (truncated)" : ""}`);
    }
    if (state.metaDesc.trim()) {
      hints.push(`Description: ${state.metaDesc.length}/${DESC_LIMIT} chars${state.metaDesc.length > DESC_LIMIT ? " (truncated)" : ""}`);
    }
    snippetHint.textContent = hints.join("  ·  ");
  }

  function normalizeSlug(slug) {
    if (!slug) return "/page-slug";
    return slug.startsWith("/") ? slug : "/" + slug;
  }

  AppState.onUpdate(renderSnippet);

  // ---- Persistence (localStorage) ----
  const saveStatus = document.getElementById("saveStatus");
  let saveTimer = null;

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.get()));
      saveStatus.textContent = "Saved";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => (saveStatus.textContent = ""), 1500);
    } catch (e) {
      console.error("Could not save draft:", e);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.keys(inputs).forEach((key) => {
        if (data[key] === undefined) return;
        if (key === "contentBody") {
          inputs.contentBody.innerHTML = data[key];
        } else {
          inputs[key].value = data[key];
        }
      });
    } catch (e) {
      console.error("Could not load draft:", e);
    }
  }

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear all fields? This cannot be undone.")) return;
    Object.values(inputs).forEach((el) => {
      if (el === inputs.contentBody) {
        el.innerHTML = "";
      } else {
        el.value = "";
      }
    });
    localStorage.removeItem(STORAGE_KEY);
    AppState._notify();
  });

  // ---- Wire up events ----
  Object.values(inputs).forEach((el) => {
    el.addEventListener("input", () => {
      AppState._notify();
      saveDraft();
    });
  });

  // ---- Theme toggle (dark mode) ----
  const THEME_KEY = "content-analyzer-theme-v1";
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️ Light mode";
    } else {
      document.body.classList.remove("dark");
      themeToggle.textContent = "🌙 Dark mode";
    }
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return applyTheme(saved);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // ---- Init ----
  loadTheme();
  loadDraft();
  AppState._notify();
})();
