// readability.js
// Readability-related helpers used by seoChecks.js:
// - Flesch Reading Ease score
// - Passive voice detection (heuristic)
// - Transition word detection (heuristic)
// Kept separate from seoChecks.js so each file stays focused and small.

(function () {
  "use strict";

  const TRANSITION_WORDS = [
    "above all","accordingly","additionally","afterward","again","also","although","as a result",
    "as well","besides","but","by contrast","consequently","conversely","despite","earlier",
    "eventually","finally","first","firstly","for example","for instance","for this reason",
    "furthermore","hence","however","in addition","in conclusion","in contrast","in fact",
    "in other words","in short","in summary","indeed","instead","later","likewise","meanwhile",
    "moreover","nevertheless","next","nonetheless","notably","on the other hand","otherwise",
    "overall","particularly","secondly","similarly","simultaneously","since","so","specifically",
    "subsequently","such as","therefore","third","thirdly","thus","to illustrate","to sum up",
    "ultimately","whereas","while"
  ];

  // Very small set of common irregular past participles + "-ed" heuristic.
  const PASSIVE_AUX = ["is","are","was","were","be","been","being","am"];

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!word) return 0;
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  // Standard Flesch Reading Ease formula:
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  function fleschReadingEase(text) {
    const sentences = TextUtils.getSentences(text);
    const words = TextUtils.getWords(text);
    if (sentences.length === 0 || words.length === 0) return null;

    let syllableCount = 0;
    words.forEach((w) => (syllableCount += countSyllables(w)));

    const score =
      206.835 -
      1.015 * (words.length / sentences.length) -
      84.6 * (syllableCount / words.length);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function fleschLabel(score) {
    if (score === null) return { status: "ok", label: "Not enough text" };
    if (score >= 60) return { status: "good", label: "Easy to read" };
    if (score >= 30) return { status: "ok", label: "Fairly difficult" };
    return { status: "bad", label: "Difficult to read" };
  }

  // Heuristic passive voice detection: auxiliary verb + word ending in "-ed" or common irregulars within next 2 words.
  function getPassiveSentenceRatio(text) {
    const sentences = TextUtils.getSentences(text);
    if (sentences.length === 0) return 0;

    let passiveCount = 0;
    sentences.forEach((sentence) => {
      const words = sentence.toLowerCase().match(/[a-z']+/g) || [];
      for (let i = 0; i < words.length; i++) {
        if (PASSIVE_AUX.includes(words[i])) {
          const nextFew = words.slice(i + 1, i + 3);
          if (nextFew.some((w) => /ed$/.test(w) || /en$/.test(w))) {
            passiveCount++;
            break;
          }
        }
      }
    });

    return passiveCount / sentences.length;
  }

  function getTransitionWordRatio(text) {
    const sentences = TextUtils.getSentences(text);
    if (sentences.length === 0) return 0;

    let withTransition = 0;
    sentences.forEach((sentence) => {
      const lower = sentence.toLowerCase();
      if (TRANSITION_WORDS.some((tw) => lower.includes(tw))) {
        withTransition++;
      }
    });

    return withTransition / sentences.length;
  }

  function getLongSentenceRatio(text, maxWords) {
    maxWords = maxWords || 20;
    const sentences = TextUtils.getSentences(text);
    if (sentences.length === 0) return 0;
    const longOnes = sentences.filter((s) => TextUtils.getWordCount(s) > maxWords);
    return longOnes.length / sentences.length;
  }

  function getLongParagraphs(text, maxWords) {
    maxWords = maxWords || 150;
    const paragraphs = TextUtils.getParagraphs(text);
    return paragraphs.filter((p) => TextUtils.getWordCount(p) > maxWords);
  }

  window.Readability = {
    fleschReadingEase,
    fleschLabel,
    getPassiveSentenceRatio,
    getTransitionWordRatio,
    getLongSentenceRatio,
    getLongParagraphs,
  };
})();
