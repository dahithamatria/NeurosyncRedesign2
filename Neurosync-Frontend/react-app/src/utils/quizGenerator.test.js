import test from 'node:test';
import assert from 'node:assert/strict';

import { getQuizQuestions, getQuestionPool } from './quizGenerator.js';

test('getQuizQuestions returns 15 unique questions with the required per-file difficulty mix', () => {
  const questions = getQuizQuestions();

  assert.equal(questions.length, 15);
  assert.equal(new Set(questions.map((question) => question.id)).size, 15);

  const bySource = new Map();
  for (const question of questions) {
    bySource.set(question.sourceFile, (bySource.get(question.sourceFile) ?? 0) + 1);
  }

  const firstTwelve = Array.from(bySource.values()).reduce((sum, count) => sum + count, 0);
  assert.ok(firstTwelve >= 12);

  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const question of questions) {
    if (difficultyCounts[question.difficulty] !== undefined) {
      difficultyCounts[question.difficulty] += 1;
    }
  }

  assert.equal(difficultyCounts.Easy + difficultyCounts.Medium + difficultyCounts.Hard, 15);
  assert.ok(difficultyCounts.Easy >= 4);
  assert.ok(difficultyCounts.Medium >= 4);
  assert.ok(difficultyCounts.Hard >= 4);

  const pool = getQuestionPool();
  assert.ok(pool.length >= 50);
});
