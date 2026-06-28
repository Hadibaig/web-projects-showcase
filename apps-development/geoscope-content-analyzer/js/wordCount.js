// wordCount.js
// Renders the Word Count tab content based on AppState.contentBody.

(function () {
  "use strict";

  const panel = document.getElementById("panel-wordcount");

  window.AnalysisResults = window.AnalysisResults || {};

  function render(state) {
    const text = TextUtils.htmlToPlainText(state.contentBody || "");
    const words = TextUtils.getWordCount(text);
    const charsWithSpaces = TextUtils.getCharCount(text, true);
    const charsNoSpaces = TextUtils.getCharCount(text, false);
    const sentences = TextUtils.getSentences(text).length;
    const paragraphs = TextUtils.getParagraphs(text).length;
    const avgWordsPerSentence = sentences > 0 ? (words / sentences).toFixed(1) : "0";
    const readingTime = TextUtils.estimateReadingTime(words);
    const speakingTime = TextUtils.estimateSpeakingTime(words);
    const density = TextUtils.getKeywordDensity(text, 8);

    window.AnalysisResults.wordcount = {
      words, charsWithSpaces, charsNoSpaces, sentences, paragraphs,
      avgWordsPerSentence, readingTime, speakingTime, density,
    };

    panel.innerHTML = `
      <div class="score-grid">
        <div class="score-card">
          <p class="score-label">Words</p>
          <p class="score-value score-good">${words}</p>
        </div>
        <div class="score-card">
          <p class="score-label">Reading time</p>
          <p class="score-value score-good">${readingTime}</p>
        </div>
      </div>

      <div class="stat-strip">
        <div>
          <p class="stat-label">Characters (with spaces)</p>
          <p class="stat-value">${charsWithSpaces}</p>
        </div>
        <div>
          <p class="stat-label">Characters (no spaces)</p>
          <p class="stat-value">${charsNoSpaces}</p>
        </div>
        <div>
          <p class="stat-label">Sentences</p>
          <p class="stat-value">${sentences}</p>
        </div>
      </div>

      <div class="stat-strip">
        <div>
          <p class="stat-label">Paragraphs</p>
          <p class="stat-value">${paragraphs}</p>
        </div>
        <div>
          <p class="stat-label">Avg words/sentence</p>
          <p class="stat-value">${avgWordsPerSentence}</p>
        </div>
        <div>
          <p class="stat-label">Speaking time</p>
          <p class="stat-value">${speakingTime}</p>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <p style="font-size:14px; font-weight:600; margin:0 0 10px;">Top repeated keyword phrases</p>
        ${renderDensityTable(density)}
      </div>
    `;
  }

  function renderDensityTable(density) {
    if (!density.length) {
      return `<p class="placeholder" style="padding:16px;">No repeated phrases yet — start writing to see keyword density.</p>`;
    }
    const rows = density
      .map(
        (d) => `
        <tr>
          <td style="padding:6px 8px; font-size:13px;">${escapeHtml(d.phrase)}</td>
          <td style="padding:6px 8px; font-size:13px; text-align:center;">${d.count}</td>
          <td style="padding:6px 8px; font-size:13px; text-align:center;">${d.density}%</td>
        </tr>`
      )
      .join("");
    return `
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid var(--border-color);">
            <th style="text-align:left; padding:6px 8px; font-size:12px; color:var(--text-secondary);">Phrase</th>
            <th style="padding:6px 8px; font-size:12px; color:var(--text-secondary);">Count</th>
            <th style="padding:6px 8px; font-size:12px; color:var(--text-secondary);">Density</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  window.AppState.onUpdate(render);
  render(window.AppState.get());
})();
