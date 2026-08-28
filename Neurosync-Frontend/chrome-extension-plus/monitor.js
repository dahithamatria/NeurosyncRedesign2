// NeuroSync — shared reading-behavior monitor (v2, confidence-scored).
// Everything runs locally in the page; nothing is sent anywhere. We only ever
// look at scroll position, mouse movement timestamps, text selection, and
// simple timers — never keystrokes, form data, or page content beyond the
// paragraph text itself.
//
// Instead of any single signal triggering the popup, each signal contributes
// points to a per-paragraph confidence score. The popup only appears once the
// score crosses a threshold (adjustable via "Popup Sensitivity" in Settings),
// and a cooldown prevents re-triggering the same paragraph too soon.
//
// Exposes window.NeuroSyncMonitor.start(config)
//   config.onTrigger(paragraph, reasons[])  — reasons is the list of signals that fired
//   config.sensitivity: 'low' | 'medium' | 'high' (default 'medium')
//   config.isSuppressed(): bool — checked before ever triggering (Never Show Again)

(function () {
  const SIGNAL_WEIGHTS = {
    dwell: 40,        // 30s+ continuously visible
    revisit: 35,      // scrolled back to this paragraph 3+ times
    stillness: 25,    // mouse idle while paragraph visible
    selection: 45,    // same sentence selected 2+ times (strong signal)
    slowReading: 20,  // estimated reading speed well below average
  };

  const THRESHOLDS = { low: 70, medium: 45, high: 25 }; // lower = more sensitive
  const COOLDOWN_MS = 90000; // don't re-score a paragraph within 90s of its last trigger
  const AVG_READING_WPM = 200;

  let started = false;

  function start(config) {
    if (started) return;
    started = true;

    const onTrigger = config?.onTrigger || (() => {});
    const isSuppressed = config?.isSuppressed || (() => false);
    const sensitivity = config?.sensitivity || 'medium';
    const threshold = THRESHOLDS[sensitivity] ?? THRESHOLDS.medium;

    const triggeredAt = new WeakMap(); // paragraph -> timestamp of last trigger
    const visibleSince = new WeakMap();
    const dwellAccum = new WeakMap();
    const visitCount = new WeakMap();
    const signalScore = new WeakMap(); // paragraph -> { dwell, revisit, stillness, selection, slowReading }
    let lastMouseMoveAt = Date.now();
    const currentlyVisible = new Set();

    document.addEventListener('mousemove', () => {
      lastMouseMoveAt = Date.now();
    });

    function addSignal(paragraph, signal) {
      if (isSuppressed()) return;
      const last = triggeredAt.get(paragraph);
      if (last && Date.now() - last < COOLDOWN_MS) return;

      const scores = signalScore.get(paragraph) || {};
      scores[signal] = true;
      signalScore.set(paragraph, scores);

      const totalWeight = Object.keys(scores).reduce((sum, key) => sum + (SIGNAL_WEIGHTS[key] || 0), 0);
      // Confidence expressed as "distance below threshold" — trigger once
      // accumulated weight passes it.
      if (totalWeight >= (100 - threshold)) {
        triggeredAt.set(paragraph, Date.now());
        signalScore.set(paragraph, {});
        onTrigger(paragraph, Object.keys(scores));
      }
    }

    const paragraphs = Array.from(document.querySelectorAll('p')).filter(
      (p) => p.innerText && p.innerText.trim().split(/\s+/).length >= 25
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (!currentlyVisible.has(el)) {
              currentlyVisible.add(el);
              visibleSince.set(el, Date.now());
              visitCount.set(el, (visitCount.get(el) || 0) + 1);
              if (visitCount.get(el) > 3) addSignal(el, 'revisit');
            }
          } else if (currentlyVisible.has(el)) {
            currentlyVisible.delete(el);
            const since = visibleSince.get(el);
            if (since) dwellAccum.set(el, (dwellAccum.get(el) || 0) + (Date.now() - since));
          }
        });
      },
      { threshold: [0, 0.6] }
    );
    paragraphs.forEach((p) => observer.observe(p));

    // Watch for dynamically-added paragraphs (infinite scroll, SPA content).
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const newParagraphs = node.matches?.('p')
            ? [node]
            : Array.from(node.querySelectorAll?.('p') || []);
          newParagraphs
            .filter((p) => p.innerText && p.innerText.trim().split(/\s+/).length >= 25)
            .forEach((p) => observer.observe(p));
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const selectionCounts = new Map();
    document.addEventListener('selectionchange', () => {
      const sel = document.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length < 8) return;
      const count = (selectionCounts.get(text) || 0) + 1;
      selectionCounts.set(text, count);
      if (count >= 2) {
        const anchorEl = sel.anchorNode?.parentElement;
        const paragraph = anchorEl?.closest('p');
        if (paragraph) addSignal(paragraph, 'selection');
      }
    });

    setInterval(() => {
      const now = Date.now();
      currentlyVisible.forEach((el) => {
        const since = visibleSince.get(el) || now;
        const dwell = (dwellAccum.get(el) || 0) + (now - since);

        if (dwell >= 30000) addSignal(el, 'dwell');

        if (now - lastMouseMoveAt >= 8000 && dwell >= 8000) addSignal(el, 'stillness');

        // Slow reading: if dwell time implies well under the average reading
        // speed for this paragraph's word count, flag it.
        const wordCount = el.innerText.trim().split(/\s+/).length;
        const expectedMs = (wordCount / AVG_READING_WPM) * 60000;
        if (dwell > expectedMs * 2.5 && dwell < 60000) addSignal(el, 'slowReading');
      });
    }, 2000);
  }

  window.NeuroSyncMonitor = { start };
})();
