import EXCEL_QUESTION_POOL from '../data/excelQuizDataset.js';
import { shuffleArray } from './shuffle.js';

const DIFFICULTY_ORDER = ['Easy', 'Medium', 'Hard'];
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function normalizeDifficulty(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return 'Medium';
  if (['easy', 'e'].includes(raw)) return 'Easy';
  if (['medium', 'moderate', 'm'].includes(raw)) return 'Medium';
  if (['hard', 'high', 'difficult', 'diff', 'h'].includes(raw)) return 'Hard';
  return 'Medium';
}

export function parseQuestionRows(rows = [], sourceFile = 'unknown') {
  return rows
    .map((record, index) => {
      const raw = record ?? {};
      const optionEntries = OPTION_KEYS.map((letter) => {
        const value = raw[`option_${letter.toLowerCase()}`]
          ?? raw[`Option ${letter}`]
          ?? raw[`option${letter}`]
          ?? raw[`Option${letter}`]
          ?? raw[`option_${letter}`]
          ?? raw[`Option_${letter.toLowerCase()}`]
          ?? raw[`option${letter.toLowerCase()}`]
          ?? raw[letter]
          ?? raw[`option_${letter.toLowerCase()}`]
          ?? raw[`Option${letter.toLowerCase()}`];

        return { letter, value: typeof value === 'string' ? value.trim() : value };
      }).filter(({ value }) => value !== undefined && value !== null && String(value).trim() !== '');

      const correctAnswerRaw = raw.correct_answer ?? raw.correctAnswer ?? raw.correct ?? raw['Correct Answer'];
      const correctLetter = String(correctAnswerRaw ?? '').trim().toUpperCase();
      const options = optionEntries.map((entry) => String(entry.value).trim());
      const correctIndex = OPTION_KEYS.indexOf(correctLetter) >= 0
        ? OPTION_KEYS.indexOf(correctLetter)
        : (options.length ? 0 : -1);

      const text = String(raw.question ?? raw.Question ?? raw.prompt ?? raw.Prompt ?? '').trim();
      if (!text) return null;

      return {
        id: String(raw.question_id ?? raw.questionId ?? raw.id ?? `${sourceFile}-${index + 1}`).trim(),
        sourceFile,
        category: String(raw.category ?? raw.Category ?? sourceFile).trim() || sourceFile,
        difficulty: normalizeDifficulty(raw.difficulty ?? raw.Difficulty),
        question: text,
        options,
        correctAnswer: correctLetter || OPTION_KEYS[correctIndex] || 'A',
        correctIndex,
      };
    })
    .filter(Boolean);
}

export function getQuestionPool() {
  return EXCEL_QUESTION_POOL.map((question) => ({
    ...question,
    id: String(question.id),
    options: [...question.options],
    correctIndex: Number.isInteger(question.correctIndex) ? question.correctIndex : 0,
    difficulty: normalizeDifficulty(question.difficulty),
  }));
}

function pickFromDifficultyPool(pool, difficulty) {
  const items = pool.filter((question) => question.difficulty === difficulty);
  if (!items.length) {
    throw new Error(`No ${difficulty} questions available in the dataset.`);
  }
  return items[Math.floor(Math.random() * items.length)];
}

export function generateAdaptiveQuiz(questionPool = getQuestionPool()) {
  if (!Array.isArray(questionPool) || !questionPool.length) {
    throw new Error('No Excel questions were found. Please verify the dataset files and parser output.');
  }

  const byFile = new Map();
  for (const question of questionPool) {
    const file = question.sourceFile || 'unknown';
    const existing = byFile.get(file) ?? [];
    existing.push(question);
    byFile.set(file, existing);
  }

  const selected = [];
  const usedIds = new Set();

  for (const file of Array.from(byFile.keys()).sort()) {
    for (const difficulty of DIFFICULTY_ORDER) {
      const available = (byFile.get(file) ?? []).filter(
        (question) => question.difficulty === difficulty && !usedIds.has(question.id),
      );
      if (!available.length) {
        throw new Error(`Missing ${difficulty} question for ${file}.`);
      }
      const chosen = available[Math.floor(Math.random() * available.length)];
      selected.push(chosen);
      usedIds.add(chosen.id);
    }
  }

  const remaining = questionPool.filter((question) => !usedIds.has(question.id));
  if (remaining.length < 3) {
    throw new Error(`Not enough remaining questions to complete the 3 extra slots. Found ${remaining.length}.`);
  }

  const extras = shuffleArray(remaining).slice(0, 3);
  const fullSet = [...selected, ...extras];

  return shuffleArray(fullSet).map((question, index) => ({
    ...question,
    quizIndex: index + 1,
    prompt: question.question,
    options: [...question.options],
    selectedAnswer: undefined,
  }));
}

export function getQuizQuestions() {
  return generateAdaptiveQuiz();
}

export default getQuizQuestions;
