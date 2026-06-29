// geoChecks.js
// AI SEO / GEO (Generative Engine Optimization) checks.
// These are heuristics aimed at making content easier for AI engines
// (AI Overviews, ChatGPT, Perplexity, etc.) to extract, quote, and cite.
// Heuristic-only, since this is a client-side tool with no crawler/backend.

(function () {
  "use strict";

  const panel = document.getElementById("panel-geo");

  const QUESTION_STARTERS = ["what","why","how","when","where","who","which","can","does","is","are","should","will"];
  const DEFINITION_PATTERNS = [" is a ", " is an ", " is the ", " are a ", " are the ", " refers to ", " means "];
  const SUMMARY_KEYWORDS = ["tl;dr", "tldr", "in summary", "in short", "summary:", "key takeaway", "key takeaways"];
  const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];

  function runChecks(state) {
    const contentHtml = state.contentBody || "";
    const content = TextUtils.htmlToPlainText(contentHtml);
    const checks = [];

    if (!content.trim()) {
      return {
        checks: [{ status: "ok", weight: 0, text: "Add some content above to run the AI/GEO analysis." }],
        score: "ok",
        percentage: 0,
      };
    }

    const sentences = TextUtils.getSentences(content);
    const sections = TextUtils.getSectionsFromHtml(contentHtml);
    const headings = sections.map((s) => ({ level: s.level, text: s.headingText }));

    // 1. Direct answer near the top
    const firstTwo = sentences.slice(0, 2).join(" ").toLowerCase();
    const hasDefinition = DEFINITION_PATTERNS.some((p) => firstTwo.includes(p));
    const firstSentenceWordCount = TextUtils.getWordCount(sentences[0] || "");
    if (hasDefinition) {
      checks.push({ status: "good", weight: 3, text: "A clear definition-style sentence appears near the top — good for AI extraction." });
    } else if (firstSentenceWordCount > 0 && firstSentenceWordCount <= 30) {
      checks.push({ status: "ok", weight: 3, text: "Opening sentence is short, but doesn't clearly define or answer the topic. Consider starting with a direct answer." });
    } else {
      checks.push({ status: "bad", weight: 3, text: "No clear direct-answer sentence detected in the first two sentences. AI engines favor content that answers the main question immediately." });
    }

    // 2. Question-style headings
    if (headings.length === 0) {
      checks.push({ status: "ok", weight: 2, text: "No subheadings found. Question-style H2/H3s (e.g. \"What is...\", \"How does...\") help match AI/voice search queries." });
    } else {
      const questionHeadings = headings.filter((h) =>
        QUESTION_STARTERS.some((q) => normalize(h.text).startsWith(q))
      );
      if (questionHeadings.length > 0) {
        checks.push({ status: "good", weight: 2, text: `${questionHeadings.length} of ${headings.length} subheading(s) are phrased as questions — great for matching AI/voice queries.` });
      } else {
        checks.push({ status: "ok", weight: 2, text: "None of your subheadings are phrased as questions. Consider rewriting one as a question (e.g. \"What is...?\")." });
      }
    }

    // 3. Lists or tables present
    if (TextUtils.hasListOrTableHtml(contentHtml)) {
      checks.push({ status: "good", weight: 2, text: "Content includes a list or table — these are easy for AI engines to extract and quote." });
    } else {
      checks.push({ status: "bad", weight: 2, text: "No bullet lists, numbered lists, or tables found. Use the toolbar's list buttons to add structured content — AI engines are more likely to cite it." });
    }

    // 4. Numeric / statistical specificity
    const numberMatches = content.match(/\b\d+(\.\d+)?%?\b/g) || [];
    if (numberMatches.length >= 3) {
      checks.push({ status: "good", weight: 1, text: `Content includes ${numberMatches.length} specific numbers/statistics — concrete data is more citable.` });
    } else if (numberMatches.length > 0) {
      checks.push({ status: "ok", weight: 1, text: "A few numbers are present, but consider adding more concrete data or statistics." });
    } else {
      checks.push({ status: "bad", weight: 1, text: "No specific numbers or statistics found. Concrete data tends to be favored by AI answer engines." });
    }

    // 5. Source / citation presence
    const links = TextUtils.getLinksFromHtml(contentHtml);
    if (links.length > 0) {
      checks.push({ status: "good", weight: 2, text: `Found ${links.length} external link(s)/citation(s) — referencing sources boosts perceived authority.` });
    } else {
      checks.push({ status: "bad", weight: 2, text: "No external links or cited sources detected. Use the toolbar's link button to cite credible sources — this improves trust signals for AI engines." });
    }

    // 6. Summary / TL;DR block
    const lowerContent = content.toLowerCase();
    const hasSummary = SUMMARY_KEYWORDS.some((kw) => lowerContent.includes(kw));
    if (hasSummary) {
      checks.push({ status: "good", weight: 1, text: "A summary or TL;DR block was found — ideal for AI engines to snapshot." });
    } else {
      checks.push({ status: "ok", weight: 1, text: "No summary or TL;DR block detected. Adding one near the top or bottom can help AI engines quickly grasp your key point." });
    }

    // 7. Freshness signal (date mention)
    const hasYear = /\b20\d{2}\b/.test(content);
    const hasMonth = MONTHS.some((m) => lowerContent.includes(m));
    if (hasYear || hasMonth) {
      checks.push({ status: "good", weight: 1, text: "A date or year is mentioned — recency signals matter to AI Overviews and AI search engines." });
    } else {
      checks.push({ status: "ok", weight: 1, text: "No date or year mentioned. Consider noting when this content was published or last updated." });
    }

    // 8. Answer completeness per heading (heading followed by a short direct paragraph)
    if (sections.length > 0) {
      const ratio = estimateHeadingAnswerRatio(sections);
      const pct = Math.round(ratio * 100);
      if (pct >= 70) {
        checks.push({ status: "good", weight: 2, text: `${pct}% of subheadings are followed by a concise paragraph — good for AI extraction.` });
      } else if (pct >= 40) {
        checks.push({ status: "ok", weight: 2, text: `Only ${pct}% of subheadings are followed by a concise, direct paragraph. Try answering each heading briefly before elaborating.` });
      } else {
        checks.push({ status: "bad", weight: 2, text: `Most subheadings aren't followed by a short, direct paragraph. AI engines tend to extract the first sentence after a heading.` });
      }
    }

    const scoreResult = computeScore(checks);
    return { checks, score: scoreResult.band, percentage: scoreResult.percentage };
  }

  function normalize(str) {
    return (str || "").toLowerCase().trim();
  }

  // Rough heuristic: for each section, check whether the first sentence right
  // after its heading is reasonably short (<= 40 words) — that's the sentence
  // an AI engine is most likely to extract.
  function estimateHeadingAnswerRatio(sections) {
    if (sections.length === 0) return 0;
    let goodCount = 0;

    sections.forEach((s) => {
      const firstSentence = TextUtils.getSentences(s.sectionText)[0] || "";
      const wc = TextUtils.getWordCount(firstSentence);
      if (wc > 0 && wc <= 40) goodCount++;
    });

    return goodCount / sections.length;
  }

  // Same weighted, percentage-based scoring as seoChecks.js — see that file
  // for the full rationale. "good" = full weight, "ok" = half, "bad" = none.
  function computeScore(checks) {
    let totalWeight = 0;
    let earnedWeight = 0;

    checks.forEach((c) => {
      const w = c.weight === undefined ? 1 : c.weight;
      totalWeight += w;
      if (c.status === "good") earnedWeight += w;
      else if (c.status === "ok") earnedWeight += w * 0.5;
    });

    const percentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;

    let band;
    if (percentage >= 80) band = "good";
    else if (percentage >= 50) band = "ok";
    else band = "bad";

    return { percentage, band };
  }

  const scoreLabel = { good: "Good", ok: "Needs work", bad: "Poor" };
  const scoreClass = { good: "score-good", ok: "score-ok", bad: "score-bad" };
  const iconMap = { good: "&#10003;", ok: "&#9888;", bad: "&#10007;" };

  window.AnalysisResults = window.AnalysisResults || {};

  function render(state) {
    const result = runChecks(state);
    window.AnalysisResults.geo = result;

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
          <p class="score-label">AI visibility score</p>
          <p class="score-value ${scoreClass[result.score]}">${scoreLabel[result.score]} (${result.percentage}%)</p>
        </div>
        <div class="score-card">
          <p class="score-label">Checks run</p>
          <p class="score-value score-good">${result.checks.length}</p>
        </div>
      </div>
      <div class="card">
        <p style="font-size:14px; font-weight:600; margin:0 0 6px;">AI / GEO assessments</p>
        ${rows}
      </div>
      <p style="font-size:12px; color:var(--text-secondary); margin-top:10px;">
        Note: these are heuristic guidance signals based on known AI/GEO best practices, not a guarantee of ranking or citation by any specific AI engine.
      </p>
    `;
  }

  window.AppState.onUpdate(render);
  render(window.AppState.get());
})();
