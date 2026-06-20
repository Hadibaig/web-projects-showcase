/* =========================================================
   MIRZA HADI — CV / PORTFOLIO
   script.js — shared Read More toggle logic + small utilities
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Read More toggles ----------
     Works for every .readmore-block on the page.
     Each block finds its OWN .readmore-content and .readmore-btn
     via DOM relationships, so no unique IDs are needed —
     you can add as many read-more sections as you like. */
  document.querySelectorAll('.readmore-block').forEach(function (block) {
    var btn = block.querySelector('.readmore-btn');
    var content = block.querySelector('.readmore-content');
    if (!btn || !content) return;

    btn.addEventListener('click', function () {
      var isOpen = content.classList.contains('active');

      content.classList.toggle('active');
      btn.classList.toggle('is-open');

      var label = btn.querySelector('.btn-text');
      label.textContent = isOpen ? 'read_more()' : 'read_less()';

      // Update ARIA state for screen readers
      btn.setAttribute('aria-expanded', String(!isOpen));
    });

    // Initial ARIA setup
    btn.setAttribute('aria-expanded', 'false');
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
