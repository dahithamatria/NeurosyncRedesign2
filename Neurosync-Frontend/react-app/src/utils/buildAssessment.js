import { getQuizQuestions } from './quizGenerator';

// Builds a fresh, randomized 15-question assessment from the Excel workbook data.
// The app keeps the paragraph/intro step so the existing UI flow remains intact.
export function buildAssessment() {
  const questions = getQuizQuestions();
  const paragraph = {
    id: 'excel-assessment',
    topic: 'Cognitive assessment',
    title: 'Adaptive 15-Question Challenge',
    text: 'This short assessment contains 15 randomized questions drawn from the workbook datasets. Answer each question carefully, then review your overall result at the end.',
  };

  const ratingStep = [{
    id: 'rating',
    category: 'Rating',
    type: 'Self Report',
    prompt: 'A couple of quick questions about how that felt.',
    unscored: true,
  }];

  return {
    paragraph,
    questions: [...questions, ...ratingStep],
  };
}
