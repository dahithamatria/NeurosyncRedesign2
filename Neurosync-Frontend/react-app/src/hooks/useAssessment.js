import { useMemo, useState } from 'react';
import { buildAssessment } from '../utils/buildAssessment';
import { scoreAssessment, getReadingSpeed } from '../utils/scoring';

export function useAssessment() {
  const [assessment, setAssessment] = useState(() => buildAssessment());
  const [phase, setPhase] = useState('paragraph'); // paragraph -> questions -> done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [rating, setRating] = useState({ difficulty: null, confidence: null });
  const [readingStartedAt, setReadingStartedAt] = useState(() => Date.now());
  const [readingMs, setReadingMs] = useState(0);

  const currentQuestion = assessment.questions[currentIndex];
  const isLast = currentIndex === assessment.questions.length - 1;
  const isAnswered = currentQuestion?.category === 'Rating'
    ? rating.difficulty !== null && rating.confidence !== null
    : answers[currentQuestion?.id] !== undefined;

  const beginAssessment = () => {
    setReadingMs(Date.now() - readingStartedAt);
    setPhase('questions');
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const setRatingValue = (key, value) => {
    setRating((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (isLast) {
      setPhase('done');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrevious = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const restart = () => {
    setAssessment(buildAssessment());
    setPhase('paragraph');
    setCurrentIndex(0);
    setAnswers({});
    setRating({ difficulty: null, confidence: null });
    setReadingStartedAt(Date.now());
    setReadingMs(0);
  };

  const results = useMemo(() => {
    if (phase !== 'done') return null;
    const wordCount = assessment.paragraph.text.trim().split(/\s+/).length;
    const readingSpeed = getReadingSpeed(wordCount, readingMs);
    const score = scoreAssessment(assessment.questions, answers);
    return { ...score, readingSpeed, rating, paragraph: assessment.paragraph };
  }, [phase, assessment, answers, readingMs, rating]);

  return {
    assessment,
    phase,
    currentIndex,
    currentQuestion,
    isLast,
    isAnswered,
    answers,
    rating,
    beginAssessment,
    selectAnswer,
    setRatingValue,
    goNext,
    goPrevious,
    restart,
    results,
    readingMs,
    totalQuestions: assessment.questions.length,
  };
}
