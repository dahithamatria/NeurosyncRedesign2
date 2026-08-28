// NeuroSync — background service worker (Manifest V3).
// Sets sensible per-extension defaults into chrome.storage.sync on first
// install, registers the right-click context menu entries, and opens the
// options page once after install so users see the settings.

const LEVEL = 'plus'; // 'basic' | 'plus' | 'smart' — replaced per extension build

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get(null, (existing) => {
    if (Object.keys(existing).length === 0) {
      chrome.storage.sync.set({
        readingMode: 'ask',
        simplificationLevel: LEVEL,
        fontSize: 'medium',
        fontFamily: 'default',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        readingWidth: 'normal',
        theme: 'light',
        dyslexicFont: false,
        highlightLine: false,
        readingRuler: false,
        highlightKeywords: false,
        boldFirstWord: false,
        readingEmphasis: false,
        popupSensitivity: 'medium',
      });
    }
  });

  chrome.contextMenus.create({
    id: 'neurosync-simplify-selection',
    title: 'Simplify selection with NeuroSync',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'neurosync-simplify-paragraph',
    title: 'Simplify this paragraph',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id: 'neurosync-clear-page',
    title: 'Clear NeuroSync on this page',
    contexts: ['page'],
  });

  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'neurosync-clear-page') {
    chrome.tabs.sendMessage(tab.id, { type: 'NEUROSYNC_RESET_PAGE' }, () => void chrome.runtime.lastError);
    return;
  }

  if (info.menuItemId === 'neurosync-simplify-selection' || info.menuItemId === 'neurosync-simplify-paragraph') {
    chrome.storage.sync.get({ simplificationLevel: LEVEL }, (settings) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'NEUROSYNC_CONTEXT_SIMPLIFY', level: settings.simplificationLevel },
        () => void chrome.runtime.lastError
      );
    });
  }
});
