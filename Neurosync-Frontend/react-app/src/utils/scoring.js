// Scoring logic for a completed assessment.
// answers: { [questionId]: selectedOptionIndex }
export function scoreAssessment(questions, answers) {
  const scoredQuestions = questions.filter((q) => q.category !== 'Rating' && q.category !== 'Sentence Preference');
  const categoryMap = {};

  for (const question of scoredQuestions) {
    if (!categoryMap[question.category]) {
      categoryMap[question.category] = [];
    }
    categoryMap[question.category].push(question);
  }

  const categoryScores = {};
  for (const [category, list] of Object.entries(categoryMap)) {
    const correct = list.filter((q) => answers[q.id] === q.correctIndex).length;
    categoryScores[category] = {
      correct,
      total: list.length,
      percent: list.length ? Math.round((correct / list.length) * 100) : 0,
    };
  }

  const totalCorrect = scoredQuestions.filter((q) => answers[q.id] === q.correctIndex).length;
  const totalScored = scoredQuestions.length;
  const totalPercent = totalScored ? Math.round((totalCorrect / totalScored) * 100) : 0;

  return { categoryScores, totalCorrect, totalScored, totalPercent };
}

// Reading Support Level replaces the old "risk" framing — same idea (how much support the
// reader may benefit from), but phrased in a way that's accurate to what the assessment measures.
export function getSupportLevel(percent) {
  if (percent >= 67) return { tier: 'Level 3', level: 'Light Reading Assistance', color: '#16A34A' };
  if (percent >= 34) return { tier: 'Level 2', level: 'Moderate Reading Assistance', color: '#D97706' };
  return { tier: 'Level 1', level: 'High Reading Assistance', color: '#DC2626' };
}

// Kept as an alias so any older code/components referencing "risk" still work.
export const getRiskLevel = getSupportLevel;

export function getRecommendations(percent, categoryScores) {
  const recs = [];
  const support = getSupportLevel(percent);

  if (support.tier === 'Level 3') {
    recs.push('Great consistency across categories — continue regular practice to maintain it.');
    recs.push('Try slightly more challenging tasks to keep building fluency.');
  } else if (support.tier === 'Level 2') {
    recs.push('Some categories suggest room to grow — repeated practice in the weaker areas will help.');
    recs.push('Reading aloud and chunking the task can improve recall and confidence.');
  } else {
    recs.push('Several areas showed notable difficulty — consulting a learning specialist or educational psychologist is recommended.');
    recs.push('Short, frequent practice sessions tend to work better than long, tiring ones.');
  }

  const weakCategories = Object.entries(categoryScores || {})
    .filter(([, data]) => data?.percent < 60)
    .map(([label]) => label);

  for (const category of weakCategories) {
    recs.push(`${category} was a challenge — targeted practice with similar tasks could help improve accuracy.`);
  }

  return recs.slice(0, 5);
}

// words per minute based on paragraph word count and time spent reading (ms) before clicking Start.
export function getReadingSpeed(wordCount, readingMs) {
  const minutes = readingMs / 60000;
  if (minutes <= 0) return 0;
  return Math.round(wordCount / minutes);
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
