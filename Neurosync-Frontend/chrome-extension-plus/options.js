const manifest = chrome.runtime.getManifest();
document.getElementById('extension-name').textContent = `${manifest.name} Settings`;

const FIELDS = [
  'readingMode', 'simplificationLevel', 'fontSize', 'fontFamily', 'lineHeight',
  'letterSpacing', 'readingWidth', 'theme', 'dyslexicFont', 'highlightLine',
  'readingRuler', 'highlightKeywords', 'boldFirstWord', 'readingEmphasis',
  'popupSensitivity',
];

const DEFAULTS = {
  readingMode: 'ask',
  simplificationLevel: window.NEUROSYNC_DEFAULT_LEVEL || 'plus',
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
};

function loadSettings() {
  chrome.storage.sync.get(DEFAULTS, (settings) => {
    FIELDS.forEach((field) => {
      const el = document.getElementById(field);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!settings[field];
      } else {
        el.value = settings[field];
      }
    });
  });
}

function saveSettings() {
  const settings = {};
  FIELDS.forEach((field) => {
    const el = document.getElementById(field);
    if (!el) return;
    settings[field] = el.type === 'checkbox' ? el.checked : el.value;
  });
  chrome.storage.sync.set(settings, () => {
    const msg = document.getElementById('saved-msg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 1800);
  });
}

document.getElementById('save').addEventListener('click', saveSettings);
loadSettings();
