import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import { useAssessment } from '../hooks/useAssessment';
import { useTimer } from '../hooks/useTimer';
import { scoreAssessment, getReadingSpeed, formatTime } from '../utils/scoring';
import './Assessment.css';

export default function Assessment() {
  const navigate = useNavigate();
  const a = useAssessment();
  const timer = useTimer();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => {
    a.beginAssessment();
    timer.start();
  };

  const finishAssessment = () => {
    const finalSeconds = timer.stop();
    const { paragraph, questions } = a.assessment;
    const wordCount = paragraph.text.trim().split(/\s+/).length;
    const score = scoreAssessment(questions, a.answers);
    const readingSpeed = getReadingSpeed(wordCount, a.readingMs);

    navigate('/result', {
      state: {
        results: { ...score, readingSpeed },
        rating: a.rating,
        timeTaken: formatTime(finalSeconds),
      },
    });
  };

  const handleNext = () => {
    if (a.isLast) {
      setShowConfirm(true);
    } else {
      a.goNext();
    }
  };

  if (a.phase === 'paragraph') {
    const { paragraph } = a.assessment;
    return (
      <div className="assessment-shell">
        <Navbar />
        <main className="container assessment-main">
          <div className="card paragraph-card">
            <span className="paragraph-topic">{paragraph.topic}</span>
            <h1 className="paragraph-title">{paragraph.title}</h1>
            <p className="paragraph-text">{paragraph.text}</p>
            <div className="paragraph-footer">
              <p className="paragraph-hint">Take your time. The timer starts only after you click below.</p>
              <button className="btn btn-primary" onClick={handleStart}>Start Assessment</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // phase === 'questions'
  const q = a.currentQuestion;
  const selectedIndex = q?.category === 'Rating' ? null : a.answers[q?.id];
  const isMemoryRecallQuestion = q?.category === 'Memory Recall' || q?.sourceFile?.includes('Memory Recall');

  return (
    <div className="assessment-shell">
      <Navbar />
      <main className="container assessment-main">
        <div className="assessment-topbar">
          <ProgressBar current={a.currentIndex + 1} total={a.totalQuestions} />
          {isMemoryRecallQuestion ? <Timer seconds={timer.seconds} running={timer.running} /> : null}
        </div>

        <QuestionCard
          question={q}
          selectedIndex={selectedIndex}
          onSelect={(idx) => a.selectAnswer(q.id, idx)}
          rating={a.rating}
          onRate={a.setRatingValue}
        />

        <div className="assessment-nav">
          <button className="btn btn-secondary" onClick={a.goPrevious} disabled={a.currentIndex === 0}>
            Previous
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!a.isAnswered}>
            {a.isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </main>

      {showConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm submission">
          <div className="card modal-card">
            <h2>Submit your assessment?</h2>
            <p>You won't be able to change your answers after this. Ready to see your results?</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Go back</button>
              <button className="btn btn-primary" onClick={finishAssessment}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
