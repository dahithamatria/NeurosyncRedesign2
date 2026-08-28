const manifest = chrome.runtime.getManifest();
document.getElementById('extension-name').textContent = manifest.name;
document.getElementById('logo-mark').textContent = manifest.name.includes('Basic') ? 'B' : manifest.name.includes('Plus') ? 'P' : 'S';
document.getElementById('extension-level').textContent = manifest.short_name || 'Reading Assistant';

const modeSelect = document.getElementById('reading-mode');

chrome.storage.sync.get({ readingMode: 'ask', simplificationLevel: 'plus' }, (settings) => {
  modeSelect.value = settings.readingMode;
});

modeSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ readingMode: modeSelect.value });
});

function showStatus(text, isError) {
  let el = document.getElementById('popup-status');
  if (!el) {
    el = document.createElement('p');
    el.id = 'popup-status';
    el.style.fontSize = '11.5px';
    el.style.textAlign = 'center';
    el.style.margin = '8px 0 0';
    document.querySelector('.popup-wrap').insertBefore(el, document.querySelector('.popup-footer'));
  }
  el.textContent = text;
  el.style.color = isError ? '#DC2626' : '#16A34A';
}

// Files injected in dependency order, matching manifest.json's content_scripts list.
const CONTENT_SCRIPT_FILES = ['level.js', 'simplify.js', 'monitor.js', 'content.js'];

function injectAndRetry(tabId, message) {
  if (!chrome.scripting) {
    showStatus('Please refresh the page and try again.', true);
    return;
  }
  chrome.scripting.insertCSS({ target: { tabId }, files: ['styles.css'] }, () => void chrome.runtime.lastError);
  chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_SCRIPT_FILES }, () => {
    if (chrome.runtime.lastError) {
      // Happens on restricted pages like chrome:// or the Chrome Web Store — expected, not fixable.
      showStatus('This page doesn\u2019t allow extensions to run here.', true);
      return;
    }
    chrome.tabs.sendMessage(tabId, message, () => {
      if (chrome.runtime.lastError) {
        showStatus('Please refresh the page and try again.', true);
      } else {
        showStatus('Done — check the page.', false);
      }
    });
  });
}

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, message, () => {
      if (chrome.runtime.lastError) {
        // No content script yet in this tab (e.g. it was open before install/reload) — inject it now.
        injectAndRetry(tabId, message);
      } else {
        showStatus('Done — check the page.', false);
      }
    });
  });
}

document.getElementById('simplify-page').addEventListener('click', () => {
  chrome.storage.sync.get({ simplificationLevel: 'plus' }, (settings) => {
    sendToActiveTab({ type: 'NEUROSYNC_SIMPLIFY_PAGE', level: settings.simplificationLevel });
  });
});

document.getElementById('reset-page').addEventListener('click', () => {
  sendToActiveTab({ type: 'NEUROSYNC_RESET_PAGE' });
});

document.getElementById('open-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
