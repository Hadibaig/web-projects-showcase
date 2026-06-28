// seoChecks.js
// Traditional SEO checks (Yoast-style), part 1:
// - Keyword in title / at start of title
// - Keyword in meta description
// - Keyword in URL slug
// - Keyword in first paragraph
// - Keyword density
// - Title length / Meta description length
// Part 2 (headings, sentence/paragraph length, readability) will extend this file.

(function () {
  "use strict";

  const panel = document.getElementById("panel-seo");

  function normalize(str) {
    return (str || "").toLowerCase().trim();
  }

  function slugify(str) {
    return normalize(str)
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // Each check returns { status: 'good'|'ok'|'bad', text: '...' }
  function runChecks(state) {
    const keyword = normalize(state.focusKeyword);
    const title = state.seoTitle || "";
    const meta = state.metaDesc || "";
    const slug = state.urlSlug || "";
    const contentHtml = state.contentBody || "";
    const content = TextUtils.htmlToPlainText(contentHtml);
    const checks = [];

    if (!keyword) {
      checks.push({ status: "ok", text: "No focus keyword set yet — keyword-specific checks below are skipped until you add one. Other checks still run." });
    }

    // 1. Keyword in title
    if (!keyword) {
      checks.push({ status: "ok", text: "Add a focus keyword to check if it appears in the SEO title." });
    } else if (normalize(title).includes(keyword)) {
      const position = normalize(title).indexOf(keyword);
      const halfLength = title.length / 2;
      if (position <= halfLength) {
        checks.push({ status: "good", text: "Focus keyword appears in the SEO title, near the beginning." });
      } else {
        checks.push({ status: "ok", text: "Focus keyword is in the SEO title, but appears quite late. Try moving it closer to the start." });
      }
    } else {
      checks.push({ status: "bad", text: "Focus keyword does not appear in the SEO title." });
    }

    // 2. Keyword in meta description
    if (!meta.trim()) {
      checks.push({ status: "bad", text: "No meta description set." });
    } else if (!keyword) {
      checks.push({ status: "ok", text: "Add a focus keyword to check if it appears in the meta description." });
    } else if (normalize(meta).includes(keyword)) {
      checks.push({ status: "good", text: "Focus keyword appears in the meta description." });
    } else {
      checks.push({ status: "bad", text: "Focus keyword does not appear in the meta description." });
    }

    // 3. Keyword in URL slug
    if (!slug.trim()) {
      checks.push({ status: "ok", text: "No URL slug set." });
    } else if (!keyword) {
      checks.push({ status: "ok", text: "Add a focus keyword to check if it appears in the URL slug." });
    } else if (slugify(slug).includes(slugify(keyword))) {
      checks.push({ status: "good", text: "Focus keyword appears in the URL slug." });
    } else {
      checks.push({ status: "ok", text: "Focus keyword does not appear in the URL slug." });
    }

    // 4. Keyword in first paragraph (first ~100 words of content)
    const words = TextUtils.getWords(content);
    const firstChunk = words.slice(0, 100).join(" ").toLowerCase();
    if (!content.trim()) {
      checks.push({ status: "ok", text: "No content yet to check the opening paragraph." });
    } else if (!keyword) {
      checks.push({ status: "ok", text: "Add a focus keyword to check if it appears in the opening paragraph." });
    } else if (firstChunk.includes(keyword)) {
      checks.push({ status: "good", text: "Focus keyword appears in the first 100 words of the content." });
    } else {
      checks.push({ status: "bad", text: "Focus keyword does not appear in the first paragraph. Try to mention it early." });
    }

    // 5. Keyword density
    if (content.trim() && keyword) {
      const totalWords = words.length || 1;
      const keywordWordCount = keyword.split(" ").length;
      const contentLower = content.toLowerCase();
      // Count occurrences of the exact keyword phrase
      const regex = new RegExp(escapeRegex(keyword), "g");
      const matches = contentLower.match(regex);
      const occurrences = matches ? matches.length : 0;
      const density = (occurrences * keywordWordCount / totalWords) * 100;

      if (density === 0) {
        checks.push({ status: "bad", text: "Focus keyword does not appear in the content body at all." });
      } else if (density < 0.5) {
        checks.push({ status: "ok", text: `Keyword density is low (${density.toFixed(1)}%). Consider using the focus keyword a bit more.` });
      } else if (density > 2.5) {
        checks.push({ status: "ok", text: `Keyword density is high (${density.toFixed(1)}%). This might look like keyword stuffing — consider reducing it.` });
      } else {
        checks.push({ status: "good", text: `Keyword density is good (${density.toFixed(1)}%).` });
      }
    }

    // 6. Title length
    if (!title.trim()) {
      checks.push({ status: "bad", text: "No SEO title set." });
    } else if (title.length < 40) {
      checks.push({ status: "ok", text: `SEO title is a bit short (${title.length} characters). Aim for 40–60 characters.` });
    } else if (title.length > 60) {
      checks.push({ status: "ok", text: `SEO title is a bit long (${title.length} characters) and may be truncated in search results. Aim for 40–60 characters.` });
    } else {
      checks.push({ status: "good", text: `SEO title length is good (${title.length} characters).` });
    }

    // 7. Meta description length
    if (meta.trim()) {
      if (meta.length < 120) {
        checks.push({ status: "ok", text: `Meta description is a bit short (${meta.length} characters). Aim for 120–156 characters.` });
      } else if (meta.length > 156) {
        checks.push({ status: "ok", text: `Meta description is a bit long (${meta.length} characters) and may be truncated. Aim for 120–156 characters.` });
      } else {
        checks.push({ status: "good", text: `Meta description length is good (${meta.length} characters).` });
      }
    }

    // 8. Keyword in subheadings (H2/H3/H4)
    if (content.trim()) {
      const headings = TextUtils.getHeadingsFromHtml(contentHtml);
      if (headings.length === 0) {
        checks.push({ status: "ok", text: "No subheadings found. Use the H1–H4 buttons in the toolbar to add some — it improves structure." });
      } else if (!keyword) {
        checks.push({ status: "ok", text: "Add a focus keyword to check if it appears in your subheadings." });
      } else {
        const matchCount = headings.filter((h) => normalize(h.text).includes(keyword)).length;
        if (matchCount > 0) {
          checks.push({ status: "good", text: `Focus keyword appears in ${matchCount} of ${headings.length} subheading(s).` });
        } else {
          checks.push({ status: "bad", text: `None of your ${headings.length} subheading(s) contain the focus keyword.` });
        }
      }
    }

    // 9. Paragraph length
    if (content.trim()) {
      const longParagraphs = Readability.getLongParagraphs(content, 150);
      if (longParagraphs.length === 0) {
        checks.push({ status: "good", text: "No paragraphs are too long." });
      } else {
        checks.push({ status: "ok", text: `${longParagraphs.length} paragraph(s) are longer than 150 words. Consider breaking them up.` });
      }
    }

    // 10. Sentence length
    if (content.trim()) {
      const longRatio = Readability.getLongSentenceRatio(content, 20);
      const pct = Math.round(longRatio * 100);
      if (pct <= 20) {
        checks.push({ status: "good", text: `Only ${pct}% of sentences are longer than 20 words. Good sentence length variety.` });
      } else if (pct <= 35) {
        checks.push({ status: "ok", text: `${pct}% of sentences are longer than 20 words. Try shortening a few.` });
      } else {
        checks.push({ status: "bad", text: `${pct}% of sentences are longer than 20 words. Consider shortening many of them.` });
      }
    }

    // 11. Passive voice
    if (content.trim()) {
      const passiveRatio = Readability.getPassiveSentenceRatio(content);
      const pct = Math.round(passiveRatio * 100);
      if (pct <= 10) {
        checks.push({ status: "good", text: `Passive voice usage is low (~${pct}% of sentences).` });
      } else if (pct <= 25) {
        checks.push({ status: "ok", text: `Passive voice is used in ~${pct}% of sentences. Consider using more active voice.` });
      } else {
        checks.push({ status: "bad", text: `Passive voice is used in ~${pct}% of sentences — this is quite high. Note: detection is heuristic and may not be perfectly accurate.` });
      }
    }

    // 12. Transition words
    if (content.trim()) {
      const transitionRatio = Readability.getTransitionWordRatio(content);
      const pct = Math.round(transitionRatio * 100);
      if (pct >= 20) {
        checks.push({ status: "good", text: `${pct}% of sentences contain a transition word. Good flow.` });
      } else {
        checks.push({ status: "ok", text: `Only ${pct}% of sentences contain a transition word. Adding more can improve flow.` });
      }
    }

    // 13. Flesch reading ease
    if (content.trim()) {
      const fleschScore = Readability.fleschReadingEase(content);
      const { status, label } = Readability.fleschLabel(fleschScore);
      const scoreText = fleschScore !== null ? ` (score: ${fleschScore})` : "";
      checks.push({ status, text: `Readability: ${label}${scoreText}.` });
    }

    return { checks, score: computeScore(checks) };
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function computeScore(checks) {
    const badCount = checks.filter((c) => c.status === "bad").length;
    const okCount = checks.filter((c) => c.status === "ok").length;
    if (badCount >= 3) return "bad";
    if (badCount > 0 || okCount > 2) return "ok";
    return "good";
  }

  const scoreLabel = { good: "Good", ok: "Needs work", bad: "Poor" };
  const scoreClass = { good: "score-good", ok: "score-ok", bad: "score-bad" };
  const iconMap = { good: "&#10003;", ok: "&#9888;", bad: "&#10007;" };

  window.AnalysisResults = window.AnalysisResults || {};

  function render(state) {
    const result = runChecks(state);
    window.AnalysisResults.seo = result;

    const rows = result.checks
      .map(
        (c) => `
        <div class="check-row check-${c.status}">
          <span class="check-icon">${iconMap[c.status]}</span>
          <p style="margin:0;">${c.text}</p>
        </div>`
      )
      .join("");

    panel.innerHTML = `
      <div class="score-grid">
        <div class="score-card">
          <p class="score-label">SEO score</p>
          <p class="score-value ${scoreClass[result.score]}">${scoreLabel[result.score]}</p>
        </div>
        <div class="score-card">
          <p class="score-label">Checks run</p>
          <p class="score-value score-good">${result.checks.length}</p>
        </div>
      </div>
      <div class="card">
        <p style="font-size:14px; font-weight:600; margin:0 0 6px;">Content assessments</p>
        ${rows}
      </div>
    `;
  }

  window.AppState.onUpdate(render);
  render(window.AppState.get());
})();
