// NeuroSync — shared content script (v2). Identical across all three extensions.
// Each extension's background.js sets its own default simplification `level`
// ('basic' | 'plus' | 'smart') in chrome.storage.sync on install; level.js sets
// window.NEUROSYNC_DEFAULT_LEVEL as a fallback before storage has loaded.

(function () {
  const DEFAULT_SETTINGS = {
    simplificationLevel: window.NEUROSYNC_DEFAULT_LEVEL || 'plus',
    readingMode: 'ask', // 'always' | 'ask' | 'manual' | 'disable'
    fontSize: 'medium',
    fontFamily: 'default', // 'default' | 'dyslexic' | 'serif' | 'mono'
    lineHeight: 'normal',
    letterSpacing: 'normal', // 'normal' | 'wide' | 'wider'
    readingWidth: 'normal',
    theme: 'light',
    dyslexicFont: false,
    highlightLine: false,       // Reading Focus Mode
    readingRuler: false,
    highlightKeywords: false,   // bold meaningful words
    boldFirstWord: false,       // bold first word of each sentence
    readingEmphasis: false,     // bionic-style reading
    popupSensitivity: 'medium', // 'low' | 'medium' | 'high'
  };

  const NEVER_SHOW_KEY = `ns_never_show_${location.hostname}`;

  let root;
  let activePopup = null;
  let controlBar = null;
  let sessionDisabled = false;
  const originalText = new WeakMap();
  const processed = new WeakSet(); // cache: paragraphs already simplified, skip reprocessing
  let lastContextTarget = null;
  let currentSettings = DEFAULT_SETTINGS;

  document.addEventListener('contextmenu', (e) => {
    lastContextTarget = e.target;
  }, true);

  function ensureRoot() {
    if (root) return root;
    root = document.createElement('div');
    root.id = 'neurosync-root';
    document.documentElement.appendChild(root);
    return root;
  }

  // ---------------------------------------------------------------------
  // Accessibility / display settings
  // ---------------------------------------------------------------------
  function applyAccessibility(settings) {
    const fontScaleMap = { small: '0.92', medium: '1', large: '1.15', xlarge: '1.3' };
    const lineHeightMap = { compact: '1.4', normal: '1.7', spacious: '2.0' };
    const letterSpacingMap = { normal: 'normal', wide: '0.03em', wider: '0.06em' };
    const widthMap = { narrow: '620px', normal: '820px', wide: '100%' };
    const fontFamilyMap = {
      default: '',
      dyslexic: 'Comic Sans MS, OpenDyslexic, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: '"Courier New", monospace',
    };

    document.body.style.fontSize = `calc(1em * ${fontScaleMap[settings.fontSize] || '1'})`;
    document.body.style.lineHeight = lineHeightMap[settings.lineHeight] || '1.7';
    document.body.style.letterSpacing = letterSpacingMap[settings.letterSpacing] || 'normal';

    const family = settings.dyslexicFont ? fontFamilyMap.dyslexic : fontFamilyMap[settings.fontFamily];
    if (family) document.body.style.fontFamily = family;

    if (settings.readingWidth && settings.readingWidth !== 'normal') {
      document.querySelectorAll('p').forEach((p) => {
        p.style.maxWidth = widthMap[settings.readingWidth] || '820px';
        p.style.marginLeft = 'auto';
        p.style.marginRight = 'auto';
      });
    }

    if (settings.theme === 'dark') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      document.querySelectorAll('img, video, svg').forEach((el) => {
        el.style.filter = 'invert(1) hue-rotate(180deg)';
      });
    }

    if (settings.highlightLine) {
      document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.ns-highlight-line').forEach((el) => el.classList.remove('ns-highlight-line'));
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const p = el?.closest?.('p');
        if (p) p.classList.add('ns-highlight-line');
      });
    }

    if (settings.readingRuler) {
      const ruler = document.createElement('div');
      ruler.className = 'ns-reading-ruler';
      ruler.style.display = 'block';
      ensureRoot().appendChild(ruler);
      document.addEventListener('mousemove', (e) => {
        ruler.style.top = `${e.clientY - 16}px`;
      });
    }

    if (settings.readingEmphasis) {
      applyBionicReading();
    }
  }

  const SKIP_SELECTOR = 'button, input, textarea, select, a, nav, header, footer, h1, h2, h3, h4, h5, h6, code, pre, [contenteditable="true"], [role="navigation"], [role="button"]';

  // "Reading Emphasis" (bionic-style): bolds the first ~45% of each word's
  // letters. Applied only to plain paragraph text, never to interactive or
  // structural elements.
  function applyBionicReading() {
    document.querySelectorAll('p').forEach((p) => {
      if (p.closest(SKIP_SELECTOR)) return;
      if (p.dataset.nsBionic === 'true') return;
      const text = p.innerText;
      if (!text || text.trim().split(/\s+/).length < 5) return;
      const html = text.replace(/[A-Za-z']+/g, (word) => {
        const boldLen = Math.max(1, Math.ceil(word.length * 0.45));
        return `<strong>${word.slice(0, boldLen)}</strong>${word.slice(boldLen)}`;
      });
      p.innerHTML = html;
      p.dataset.nsBionic = 'true';
    });
  }

  // Bolds the first word after every sentence-ending punctuation mark, to
  // improve sentence visibility while scanning a paragraph.
  function boldFirstWords(html) {
    return html.replace(/(^|[.!?]\s+)(<strong[^>]*>)?(\w+)/g, (match, lead, existingStrong, word) => {
      if (existingStrong) return match; // already bolded by simplify.js's key-word wrap
      return `${lead}<strong class="ns-first-word">${word}</strong>`;
    });
  }

  // Wraps meaningful words (per NeuroSyncSimplify.isKeyword) in a bold span,
  // skipping anything already inside a <strong> tag from the simplify pass.
  function highlightKeywords(html) {
    const parts = html.split(/(<strong[^>]*>.*?<\/strong>)/g);
    return parts
      .map((part) => {
        if (part.startsWith('<strong')) return part;
        return part.replace(/\b[A-Za-z']{4,}\b/g, (word) => {
          if (window.NeuroSyncSimplify.isKeyword(word)) {
            return `<span class="ns-keyword">${word}</span>`;
          }
          return word;
        });
      })
      .join('');
  }

  // ---------------------------------------------------------------------
  // AI-assist popup
  // ---------------------------------------------------------------------
  function reasonCopy(reasons) {
    if (reasons.includes('selection')) return 'You\u2019ve highlighted the same sentence more than once.';
    if (reasons.includes('revisit')) return 'You\u2019ve scrolled back to this paragraph a few times.';
    if (reasons.includes('slowReading')) return 'This paragraph is taking longer than usual to read.';
    if (reasons.includes('stillness')) return 'This paragraph has been on screen a while.';
    return 'This paragraph looks difficult.';
  }

  function closePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  function showPopup(paragraph, reasons, level) {
    closePopup();
    const container = ensureRoot();
    const popup = document.createElement('div');
    popup.className = 'ns-popup';
    popup.innerHTML = `
      <div class="ns-popup-header"><span class="ns-popup-dot"></span> Reading Difficulty Detected</div>
      <div class="ns-popup-body">${reasonCopy(reasons)} Want a simplified version?</div>
      <div class="ns-popup-actions">
        <button class="ns-btn ns-btn-secondary" data-action="never">Never Show Again</button>
        <button class="ns-btn ns-btn-secondary" data-action="later">Later</button>
        <button class="ns-btn ns-btn-primary" data-action="simplify">Simplify</button>
      </div>
    `;
    popup.querySelector('[data-action="later"]').addEventListener('click', closePopup);
    popup.querySelector('[data-action="never"]').addEventListener('click', () => {
      chrome.storage.local.set({ [NEVER_SHOW_KEY]: true });
      sessionDisabled = true;
      closePopup();
    });
    popup.querySelector('[data-action="simplify"]').addEventListener('click', () => {
      simplifyParagraph(paragraph, level);
      closePopup();
    });
    container.appendChild(popup);
    activePopup = popup;
    setTimeout(closePopup, 15000);
  }

  // ---------------------------------------------------------------------
  // Simplification actions
  // ---------------------------------------------------------------------
  function buildSimplifiedHtml(originalPlainText, level, settings) {
    let html = window.NeuroSyncSimplify.simplify(originalPlainText, level);
    if (settings.highlightKeywords) html = highlightKeywords(html);
    if (settings.boldFirstWord) html = boldFirstWords(html);
    return html;
  }

  function addToolbar(paragraph, level, settings) {
    paragraph.parentElement?.querySelector('.ns-paragraph-toolbar[data-for]')?.remove();

    const toolbar = document.createElement('div');
    toolbar.className = 'ns-paragraph-toolbar';
    toolbar.innerHTML = `
      <button data-mode="original">Original</button>
      <button data-mode="simplified" class="active">Simplified</button>
      <button data-mode="compare">Compare</button>
    `;
    const rect = paragraph.getBoundingClientRect();
    toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
    toolbar.style.left = `${window.scrollX + rect.left}px`;
    ensureRoot().appendChild(toolbar);

    toolbar.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        toolbar.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        const original = originalText.get(paragraph);
        if (mode === 'original') {
          paragraph.innerText = original;
          paragraph.classList.remove('ns-simplified');
        } else if (mode === 'simplified') {
          paragraph.innerHTML = buildSimplifiedHtml(original, level, settings);
          paragraph.classList.add('ns-simplified');
        } else if (mode === 'compare') {
          const simplifiedHtml = buildSimplifiedHtml(original, level, settings);
          paragraph.innerHTML = `<span style="opacity:0.55;text-decoration:line-through">${window.NeuroSyncSimplify.escapeHtml(original)}</span><br/><br/>${simplifiedHtml}`;
        }
      });
    });
  }

  function simplifyParagraph(paragraph, level) {
    if (!originalText.has(paragraph)) originalText.set(paragraph, paragraph.innerText);
    const original = originalText.get(paragraph);
    paragraph.innerHTML = buildSimplifiedHtml(original, level, currentSettings);
    paragraph.classList.add('ns-simplified');
    processed.add(paragraph);
    addToolbar(paragraph, level, currentSettings);
    showControlBar();
  }

  function simplifyAllParagraphs(level) {
    document.querySelectorAll('p').forEach((p) => {
      if (processed.has(p)) return; // cache: skip already-processed paragraphs
      if (p.innerText && p.innerText.trim().split(/\s+/).length >= 15) {
        simplifyParagraph(p, level);
      }
    });
  }

  function resetAllParagraphs() {
    document.querySelectorAll('p').forEach((p) => {
      if (originalText.has(p)) {
        p.innerText = originalText.get(p);
        p.classList.remove('ns-simplified');
      }
      delete p.dataset.nsBionic;
      processed.delete(p);
    });
    document.querySelectorAll('.ns-paragraph-toolbar').forEach((t) => t.remove());
  }

  // Simplifies just the user's current text selection (must be within one
  // paragraph) in place, leaving the rest of the paragraph untouched.
  function simplifySelection(level) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    const startP = range.startContainer.parentElement?.closest('p') || range.startContainer.closest?.('p');
    const endP = range.endContainer.parentElement?.closest('p') || range.endContainer.closest?.('p');
    if (!startP || startP !== endP) return false; // cross-paragraph selection: unsupported, bail out safely

    if (!originalText.has(startP)) originalText.set(startP, startP.innerText);

    const selectedText = range.toString();
    const html = buildSimplifiedHtml(selectedText, level, currentSettings);
    const wrapper = document.createElement('span');
    wrapper.className = 'ns-simplified-inline';
    wrapper.innerHTML = html;
    range.deleteContents();
    range.insertNode(wrapper);
    sel.removeAllRanges();
    showControlBar();
    return true;
  }

  // ---------------------------------------------------------------------
  // Persistent Clear All / Exit control
  // ---------------------------------------------------------------------
  function showControlBar() {
    if (controlBar) return;
    controlBar = document.createElement('div');
    controlBar.className = 'ns-control-bar';
    controlBar.innerHTML = `
      <span>NeuroSync is active on this page</span>
      <button class="ns-btn ns-btn-secondary" data-action="clear">Clear All</button>
      <button class="ns-btn ns-btn-secondary" data-action="exit">\u2715 Exit</button>
    `;
    controlBar.querySelector('[data-action="clear"]').addEventListener('click', resetAllParagraphs);
    controlBar.querySelector('[data-action="exit"]').addEventListener('click', () => {
      resetAllParagraphs();
      closePopup();
      controlBar?.remove();
      controlBar = null;
      sessionDisabled = true;
    });
    ensureRoot().appendChild(controlBar);
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function init(settings) {
    currentSettings = settings;
    ensureRoot();
    applyAccessibility(settings);

    if (settings.readingMode === 'disable') return;

    if (settings.readingMode === 'always') {
      simplifyAllParagraphs(settings.simplificationLevel);
      return;
    }

    if (settings.readingMode === 'manual') return;

    chrome.storage.local.get({ [NEVER_SHOW_KEY]: false }, (result) => {
      if (result[NEVER_SHOW_KEY]) {
        sessionDisabled = true;
        return;
      }
      window.NeuroSyncMonitor.start({
        sensitivity: settings.popupSensitivity,
        isSuppressed: () => sessionDisabled,
        onTrigger: (paragraph, reasons) => {
          if (sessionDisabled) return;
          showPopup(paragraph, reasons, settings.simplificationLevel);
        },
      });
    });
  }

  function loadSettingsAndInit() {
    window.NeuroSyncSimplify.ready.then(() => {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => init({ ...DEFAULT_SETTINGS, ...stored }));
      } else {
        init(DEFAULT_SETTINGS);
      }
    });
  }

  // ---------------------------------------------------------------------
  // Messages: from popup.html, the options page, and background.js (context menu)
  // ---------------------------------------------------------------------
  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === 'NEUROSYNC_SIMPLIFY_PAGE') {
        simplifyAllParagraphs(message.level || currentSettings.simplificationLevel);
        sendResponse({ ok: true });
      } else if (message?.type === 'NEUROSYNC_RESET_PAGE') {
        resetAllParagraphs();
        sendResponse({ ok: true });
      } else if (message?.type === 'NEUROSYNC_CONTEXT_SIMPLIFY') {
        const level = message.level || currentSettings.simplificationLevel;
        const didSelection = simplifySelection(level);
        if (!didSelection) {
          const paragraph = lastContextTarget?.closest?.('p');
          if (paragraph) simplifyParagraph(paragraph, level);
        }
        sendResponse({ ok: true });
      }
      return true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettingsAndInit);
  } else {
    loadSettingsAndInit();
  }
})();
