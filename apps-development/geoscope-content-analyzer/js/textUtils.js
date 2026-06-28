// textUtils.js
// Shared helpers for splitting text into words/sentences/paragraphs/headings.
// Used by wordCount.js, seoChecks.js, and geoChecks.js.

(function () {
  "use strict";

  // Common English stopwords — kept inline (no fetch) so the app works
  // even when opened directly as a local file (file://), not just via a server.
  const STOPWORDS = new Set([
    "a","about","above","after","again","against","all","am","an","and","any","are","as","at",
    "be","because","been","before","being","below","between","both","but","by",
    "cannot","could",
    "did","do","does","doing","down","during",
    "each",
    "few","for","from","further",
    "had","has","have","having","he","her","here","hers","herself","him","himself","his","how",
    "i","if","in","into","is","it","its","itself",
    "me","more","most","my","myself",
    "no","nor","not",
    "of","off","on","once","only","or","other","our","ours","ourselves","out","over","own",
    "same","she","should","so","some","such",
    "than","that","the","their","theirs","them","themselves","then","there","these","they","this","those","through","to","too",
    "under","until","up",
    "very",
    "was","we","were","what","when","where","which","while","who","whom","why","with","would",
    "you","your","yours","yourself","yourselves"
  ]);

  function getWords(text) {
    if (!text) return [];
    const matches = text.match(/[A-Za-z0-9'-]+/g);
    return matches || [];
  }

  function getWordCount(text) {
    return getWords(text).length;
  }

  function getCharCount(text, includeSpaces) {
    if (!text) return 0;
    return includeSpaces ? text.length : text.replace(/\s/g, "").length;
  }

  function getSentences(text) {
    if (!text) return [];
    // Split on sentence-ending punctuation followed by space/newline or end of string.
    const raw = text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return raw;
  }

  function getParagraphs(text) {
    if (!text) return [];
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  // Parses markdown-style headings (## H2, ### H3) out of the content.
  // Returns array of {level: 2|3, text: "..."}
  function getHeadings(text) {
    if (!text) return [];
    const lines = text.split("\n");
    const headings = [];
    lines.forEach((line) => {
      const m = line.match(/^\s{0,3}(#{2,4})\s*(.*)/);
      if (m && m[2].trim()) {
        headings.push({ level: m[1].length, text: m[2].trim() });
      }
    });
    return headings;
  }

  function estimateReadingTime(wordCount, wpm) {
    wpm = wpm || 225;
    const minutes = wordCount / wpm;
    if (minutes < 1) return "< 1 min";
    return Math.round(minutes) + " min";
  }

  function estimateSpeakingTime(wordCount, wpm) {
    wpm = wpm || 130;
    const minutes = wordCount / wpm;
    if (minutes < 1) return "< 1 min";
    return Math.round(minutes) + " min";
  }

  // Returns top N keyword phrases (1-3 word grams) by frequency, excluding stopwords.
  function getKeywordDensity(text, topN) {
    topN = topN || 8;
    const words = getWords(text).map((w) => w.toLowerCase());
    const counts = {};

    function countGram(gram) {
      counts[gram] = (counts[gram] || 0) + 1;
    }

    for (let i = 0; i < words.length; i++) {
      const w1 = words[i];
      if (STOPWORDS.has(w1) || /^\d+$/.test(w1)) continue;
      countGram(w1);

      if (i + 1 < words.length && !STOPWORDS.has(words[i + 1])) {
        countGram(w1 + " " + words[i + 1]);
      }
      if (i + 2 < words.length && !STOPWORDS.has(words[i + 1]) && !STOPWORDS.has(words[i + 2])) {
        countGram(w1 + " " + words[i + 1] + " " + words[i + 2]);
      }
    }

    const total = words.length || 1;
    return Object.entries(counts)
      .filter(([, count]) => count > 1) // only repeated phrases are interesting
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: ((count / total) * 100).toFixed(1),
      }));
  }

  // ---- HTML-aware helpers (for the contenteditable rich text editor) ----

  // Converts editor HTML into plain text, inserting blank lines after block
  // elements so getSentences()/getParagraphs() (which split on \n) still work.
  function htmlToPlainText(html) {
    if (!html) return "";
    const container = document.createElement("div");
    container.innerHTML = html;
    const BLOCK_TAGS = new Set(["P","DIV","H1","H2","H3","H4","H5","H6","LI","UL","OL","TABLE","TR","BLOCKQUOTE"]);
    let text = "";

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.tagName === "BR") {
        text += "\n";
        return;
      }
      Array.from(node.childNodes).forEach(walk);
      if (BLOCK_TAGS.has(node.tagName)) {
        text += "\n\n";
      }
    }

    Array.from(container.childNodes).forEach(walk);
    return text.replace(/\n{3,}/g, "\n\n").trim();
  }

  // Splits editor HTML into sections: each top-level heading (h1-h4) starts a
  // new section; everything until the next heading belongs to it. This reads
  // real heading elements (not markdown), so it works with the rich text editor.
  // Returns array of { level, headingText, sectionText }
  function getSectionsFromHtml(html) {
    if (!html) return [];
    const container = document.createElement("div");
    container.innerHTML = html;

    const sections = [];
    let current = null;

    Array.from(container.children).forEach((el) => {
      const m = el.tagName.match(/^H([1-4])$/);
      if (m) {
        if (current) sections.push(current);
        current = { level: Number(m[1]), headingText: el.textContent.trim(), sectionText: "" };
      } else if (current) {
        current.sectionText += " " + el.textContent;
      }
      // Content before the first heading is intentionally not counted as a "section".
    });
    if (current) sections.push(current);

    return sections;
  }

  // Convenience: just the headings, in the same shape getHeadings() used to return.
  function getHeadingsFromHtml(html) {
    return getSectionsFromHtml(html).map((s) => ({ level: s.level, text: s.headingText }));
  }

  function hasListOrTableHtml(html) {
    if (!html) return false;
    const container = document.createElement("div");
    container.innerHTML = html;
    return !!container.querySelector("ul, ol, table");
  }

  // Returns external links (http/https) found in the editor HTML as {href, text}.
  function getLinksFromHtml(html) {
    if (!html) return [];
    const container = document.createElement("div");
    container.innerHTML = html;
    return Array.from(container.querySelectorAll("a[href]"))
      .map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim() }))
      .filter((l) => /^https?:\/\//i.test(l.href));
  }

  function isContentEmpty(html) {
    return htmlToPlainText(html).trim().length === 0;
  }

  window.TextUtils = {
    getWords,
    getWordCount,
    getCharCount,
    getSentences,
    getParagraphs,
    getHeadings,
    estimateReadingTime,
    estimateSpeakingTime,
    getKeywordDensity,
    htmlToPlainText,
    getSectionsFromHtml,
    getHeadingsFromHtml,
    hasListOrTableHtml,
    getLinksFromHtml,
    isContentEmpty,
    STOPWORDS,
  };
})();
