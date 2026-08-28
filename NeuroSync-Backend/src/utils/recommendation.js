// Mirrors react-app/src/utils/scoring.js (getSupportLevel) and
// react-app/src/utils/recommendation.js (EXTENSIONS) so the backend can
// independently derive the same tier/extension the frontend would show,
// instead of trusting the client to send them.

const EXTENSIONS = {
  'Level 1': {
    id: 'easyread-basic',
    name: 'EasyRead Basic',
    supportLevel: 'High Reading Assistance',
  },
  'Level 2': {
    id: 'easyread-plus',
    name: 'EasyRead Plus',
    supportLevel: 'Moderate Reading Assistance',
  },
  'Level 3': {
    id: 'easyread-smart',
    name: 'EasyRead Smart',
    supportLevel: 'Light Reading Assistance',
  },
};

function getSupportLevel(percent) {
  if (percent >= 67) return { tier: 'Level 3', level: 'Light Reading Assistance' };
  if (percent >= 34) return { tier: 'Level 2', level: 'Moderate Reading Assistance' };
  return { tier: 'Level 1', level: 'High Reading Assistance' };
}

function getRecommendedExtension(percent) {
  const { tier } = getSupportLevel(percent);
  return EXTENSIONS[tier];
}

module.exports = { getSupportLevel, getRecommendedExtension, EXTENSIONS };
