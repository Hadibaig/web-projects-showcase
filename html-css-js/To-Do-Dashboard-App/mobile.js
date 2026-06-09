/*
════════════════════════════════════════
  Project:    To-Do Dashboard App
  Repo:       html-css-js/To-Do-Dashboard-App
  Developer:  Mirza Hadi
  Role:       Full-Stack WordPress Developer
              & Technical Problem Solver
  Website:    hadi-mirza.com
  LinkedIn:   linkedin.com/in/hadibaig
  GitHub:     github.com/Hadibaig
  Newsletter: DCXherald — 4,000+ subscribers
════════════════════════════════════════
*/

(function () {

  /* ── Hamburger toggle ── */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var mainNav      = document.getElementById('mainNav');

  function closeNav() {
    if (!mainNav || !hamburgerBtn) return;
    mainNav.classList.remove('nav-open');
    var icon = hamburgerBtn.querySelector('i');
    if (icon) icon.className = 'bi bi-list';
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  if (hamburgerBtn && mainNav) {

    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // prevent document listener from closing it immediately
      var isOpen = mainNav.classList.toggle('nav-open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      var icon = hamburgerBtn.querySelector('i');
      if (icon) icon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
    });

    // Close nav when a nav button is tapped on mobile
    // Use setTimeout so script.js .onclick on the same button runs first
    mainNav.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.innerWidth < 768) {
          setTimeout(closeNav, 0);
        }
      });
    });

    // Close nav when clicking anywhere outside the nav/hamburger on mobile
    document.addEventListener('click', function (e) {
      if (window.innerWidth >= 768) return;
      if (!mainNav.classList.contains('nav-open')) return;
      if (mainNav.contains(e.target) || hamburgerBtn.contains(e.target)) return;
      closeNav();
    });
  }

  /* ── Cancel button (closeModalBtn2) ──
     script.js owns closeModalBtn (the X).
     We wire closeModalBtn2 (Cancel text button) separately.
  ── */
  var closeModal2 = document.getElementById('closeModalBtn2');
  var modal       = document.getElementById('taskModal');
  if (closeModal2 && modal) {
    closeModal2.addEventListener('click', function () {
      modal.classList.add('hidden');
    });
  }

  /* ── Mobile task tab bar ──
     Mirrors #taskList into horizontal scrollable tabs on mobile.
     Uses MutationObserver to stay in sync with script.js render().
  ── */
  var taskList       = document.getElementById('taskList');
  var mobileTaskTabs = document.getElementById('mobileTaskTabs');

  function syncMobileTabs() {
    if (!mobileTaskTabs || !taskList) return;

    mobileTaskTabs.innerHTML = '';

    var desktopTasks = taskList.querySelectorAll('.task');

    if (desktopTasks.length === 0) {
      var empty = document.createElement('span');
      empty.style.cssText = 'color:#9ca3af;font-size:0.82rem;padding:6px 4px;white-space:nowrap;';
      empty.textContent = 'No tasks yet — tap + Add Task';
      mobileTaskTabs.appendChild(empty);
      return;
    }

    desktopTasks.forEach(function (taskEl) {
      var tab = document.createElement('div');
      tab.className = 'mobile-task-tab';
      tab.style.background = taskEl.style.background || '#f3f4f6';
      tab.innerHTML = taskEl.innerHTML;

      tab.addEventListener('click', function () {
        mobileTaskTabs.querySelectorAll('.mobile-task-tab').forEach(function (t) {
          t.classList.remove('active-tab');
        });
        tab.classList.add('active-tab');
        taskEl.click(); // delegates to script.js show(i) via the div's onclick
      });

      mobileTaskTabs.appendChild(tab);
    });
  }

  if (taskList) {
    var observer = new MutationObserver(syncMobileTabs);
    observer.observe(taskList, { childList: true, subtree: true });
  }

  syncMobileTabs();

})();
