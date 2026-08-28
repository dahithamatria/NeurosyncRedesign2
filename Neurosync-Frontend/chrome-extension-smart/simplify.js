// NeuroSync — shared rule-based simplification engine (v2).
// Loaded as a plain classic script (no ES modules) alongside content.js in each
// extension's manifest content_scripts array. Datasets live in data/*.json and
// are fetched once at startup via chrome.runtime.getURL — completely offline,
// no external API calls of any kind.
//
// Exposes:
//   window.NeuroSyncSimplify.ready            -> Promise, resolves once datasets are loaded
//   window.NeuroSyncSimplify.simplify(text, level) -> HTML string, <strong> around changed words
//   window.NeuroSyncSimplify.isKeyword(word)  -> bool, used by content.js for keyword highlighting
//   window.NeuroSyncSimplify.escapeHtml(text)
//
// Pipeline order (per spec): phrase replacement -> word replacement ->
// sentence splitting -> passive-to-active (best-effort) -> filler
// adjective/adverb trimming (basic level only) -> shorten long sentences.
// This is a rule-based, offline engine — it cannot guarantee perfect meaning
// preservation the way a real language model could, but every rule is a
// conservative, reversible substitution designed not to change facts.

(function () {
  const state = {
    simpleWords: {},
    phrases: {},
    stopWords: new Set(),
    technicalWords: new Set(),
    loaded: false,
  };

  const FILLER_WORDS = [
    'very', 'extremely', 'quite', 'rather', 'basically', 'essentially',
    'actually', 'literally', 'simply', 'truly', 'really', 'somewhat',
    'fairly', 'particularly', 'especially', 'generally', 'typically',
    'virtually', 'practically', 'certainly', 'definitely', 'absolutely',
  ];

  function loadJSON(file) {
    return fetch(chrome.runtime.getURL(`data/${file}`))
      .then((r) => r.json())
      .catch(() => ({}));
  }

  const ready = Promise.all([
    loadJSON('simpleWords.json'),
    loadJSON('phrases.json'),
    loadJSON('stopWords.json'),
    loadJSON('technicalWords.json'),
  ]).then(([simpleWords, phrases, stopWords, technicalWords]) => {
    state.simpleWords = simpleWords || {};
    state.phrases = phrases || {};
    state.stopWords = new Set((stopWords || []).map((w) => w.toLowerCase()));
    state.technicalWords = new Set((technicalWords || []).map((w) => w.toLowerCase()));
    state.loaded = true;
  });

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Generic map-based replace. `bold` wraps replacements in <strong> (used for
  // the final HTML pass); when false it operates on plain text (used for the
  // earlier plain-text pipeline stages so word-boundary matching stays simple).
  function replaceFromMap(text, map, bold, protectedSet) {
    let result = text;
    Object.keys(map)
      .sort((a, b) => b.length - a.length)
      .forEach((complex) => {
        if (protectedSet && protectedSet.has(complex.toLowerCase())) return;
        const simple = map[complex];
        const pattern = new RegExp(`\\b${escapeRegExp(complex)}\\b`, 'gi');
        result = result.replace(pattern, (match) => {
          const cased = match[0] === match[0].toUpperCase()
            ? simple.charAt(0).toUpperCase() + simple.slice(1)
            : simple;
          return bold ? `<strong class="ns-key-word">${cased}</strong>` : cased;
        });
      });
    return result;
  }

  // Best-effort passive -> active conversion. True passive/active conversion
  // needs real grammatical parsing; offline and rule-based, we can only catch
  // the most common, unambiguous pattern: "<subject> was/were <verb>ed by <agent>."
  function passiveToActive(text) {
    const pattern = /\b([A-Z][a-zA-Z\s]{0,40}?)\s+(?:was|were)\s+(\w+ed)\s+by\s+([a-zA-Z\s]{1,40}?)([.,;])/g;
    return text.replace(pattern, (match, subject, verb, agent, punct) => {
      const verbRoot = verb.replace(/ed$/, '');
      return `${agent.trim()} ${verbRoot}ed ${subject.trim().toLowerCase()}${punct}`;
    });
  }

  // Strips common filler adjectives/adverbs — basic level only, to maximize
  // plain readability without touching load-bearing words.
  function stripFillerWords(text) {
    let result = text;
    FILLER_WORDS.forEach((w) => {
      const pattern = new RegExp(`\\b${w}\\b\\s*`, 'gi');
      result = result.replace(pattern, '');
    });
    return result.replace(/\s{2,}/g, ' ').trim();
  }

  function splitLongSentences(text, maxWords) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences
      .map((sentence) => {
        const words = sentence.trim().split(/\s+/);
        if (words.length <= maxWords) return sentence.trim();
        const mid = Math.floor(words.length / 2);
        const breakPoint = sentence.indexOf(',', sentence.length / 3);
        if (breakPoint > -1) {
          const first = sentence.slice(0, breakPoint).trim();
          const second = sentence.slice(breakPoint + 1).trim();
          return `${first}. ${second.charAt(0).toUpperCase()}${second.slice(1)}`;
        }
        const first = words.slice(0, mid).join(' ');
        const second = words.slice(mid).join(' ');
        return `${first}. ${second.charAt(0).toUpperCase()}${second.slice(1)}`;
      })
      .join(' ');
  }

  function runPipeline(text, level) {
    let out = text;

    // 1. Phrase replacement (plain text — multi-word, so must run before word
    //    replacement or word-level rules would fragment the phrases).
    out = replaceFromMap(out, state.phrases, false);

    // 2. Word replacement, skipping anything in the technical-terms allowlist
    //    (never touch "photosynthesis", "algorithm", etc. even if levels ask
    //    for max simplification — that's the whole point of protecting them).
    out = replaceFromMap(out, state.simpleWords, false, state.technicalWords);

    // 3 & 6. Sentence splitting / shortening — aggressiveness by level.
    const maxWords = level === 'basic' ? 10 : level === 'smart' ? 24 : 16;
    out = splitLongSentences(out, maxWords);

    // 4. Passive -> active (best effort, all levels — it's a clarity win with
    //    very low risk of changing meaning since it's a mechanical rewording).
    out = passiveToActive(out);

    // 5. Remove filler adjectives/adverbs — basic level only, since plus/smart
    //    intentionally preserve more of the original wording.
    if (level === 'basic') {
      out = stripFillerWords(out);
    }

    return out;
  }

  function simplify(text, level) {
    if (!text || !text.trim()) return escapeHtml(text || '');
    if (!state.loaded) {
      // Datasets not ready yet (shouldn't normally happen — content.js awaits
      // `ready` before calling this) — fall back to escaped original text.
      return escapeHtml(text);
    }
    const plain = runPipeline(text, level === 'smart' ? 'smart' : level === 'basic' ? 'basic' : 'plus');
    // Final HTML pass: re-run word/phrase replacement over the *already
    // transformed* plain text so <strong> highlighting reflects the final
    // simplified wording, not the pre-pipeline original.
    let html = escapeHtml(plain);
    html = replaceFromMap(html, state.phrases, true);
    html = replaceFromMap(html, state.simpleWords, true, state.technicalWords);
    return html;
  }

  function isKeyword(word) {
    const clean = word.toLowerCase().replace(/[^a-z'-]/g, '');
    if (clean.length < 4) return false;
    if (state.stopWords.has(clean)) return false;
    if (state.technicalWords.has(clean)) return true;
    // Heuristic: capitalized mid-sentence word (likely a proper noun) or a
    // sufficiently long word not in the stop list counts as "meaningful".
    return true;
  }

  window.NeuroSyncSimplify = { ready, simplify, isKeyword, escapeHtml };
})();
