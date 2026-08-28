import { getSupportLevel } from './scoring';

export const EXTENSIONS = {
  'Level 1': {
    id: 'easyread-basic',
    name: 'EasyRead Basic',
    tier: 'Level 1',
    supportLevel: 'High Reading Assistance',
    color: '#DC2626',
    tagline: 'Turns complex web pages into the simplest possible English.',
    description:
      'EasyRead Basic rewrites difficult web pages into very short sentences and simple, everyday vocabulary, giving maximum readability for readers who benefit from the most support.',
    example: {
      original: 'The committee unanimously approved the implementation of the proposed environmental conservation initiative.',
      simplified: 'The group agreed to start a plan to protect nature.',
    },
    folder: 'chrome-extension-basic',
  },
  'Level 2': {
    id: 'easyread-plus',
    name: 'EasyRead Plus',
    tier: 'Level 2',
    supportLevel: 'Moderate Reading Assistance',
    color: '#D97706',
    tagline: 'Simplifies difficult words while preserving the full meaning.',
    description:
      'EasyRead Plus simplifies difficult vocabulary and shortens overly complex sentences, while keeping the information professional and complete — a balance of clarity and content.',
    example: {
      original: 'The implementation of renewable energy solutions significantly reduces carbon emissions.',
      simplified: 'Using renewable energy greatly reduces carbon pollution.',
    },
    folder: 'chrome-extension-plus',
  },
  'Level 3': {
    id: 'easyread-smart',
    name: 'EasyRead Smart',
    tier: 'Level 3',
    supportLevel: 'Light Reading Assistance',
    color: '#16A34A',
    tagline: 'Only simplifies difficult phrases — keeps technical language intact.',
    description:
      'EasyRead Smart makes minimal changes, clarifying only genuinely difficult phrasing while preserving technical terminology, ideal for confident readers who want light support.',
    example: {
      original: 'Neural networks employ backpropagation for parameter optimization.',
      simplified: 'Neural networks use backpropagation to improve their learning process.',
    },
    folder: 'chrome-extension-smart',
  },
};

export function getRecommendedExtension(percent) {
  const support = getSupportLevel(percent);
  return EXTENSIONS[support.tier];
}
