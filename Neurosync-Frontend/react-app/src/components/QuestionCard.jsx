import { useEffect, useMemo, useState } from 'react';
import './QuestionCard.css';

const DIFFICULTY_OPTIONS = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];
const CONFIDENCE_OPTIONS = ['Very Confident', 'Confident', 'Neutral', 'Unsure', 'Not Confident'];
const MEMORY_DISPLAY_SECONDS = 5;

function extractMemoryTarget(question) {
  if (!question?.question) return '';

  const match = question.question.match(/(?:Look at sequence|Remember string|Remember order|Order)\s*:?\s*(.*?)(?:\.|\?|$)/i);
  if (match?.[1]) {
    return match[1].trim();
  }

  const lower = question.question.toLowerCase();
  if (lower.includes('sequence')) {
    return question.question.replace(/.*sequence\s*:?\s*/i, '').replace(/\s*which option.*$/i, '').trim();
  }

  return question.question.replace(/\s*(which option|what was|select the matching|what comes next).*$/i, '').trim();
}

export default function QuestionCard({ question, selectedIndex, onSelect, rating, onRate }) {
  const isMemoryRecall = question?.category === 'Memory Recall' || question?.sourceFile?.includes('Memory Recall');
  const [memoryPhase, setMemoryPhase] = useState(isMemoryRecall ? 'memorize' : 'recall');
  const [countdown, setCountdown] = useState(MEMORY_DISPLAY_SECONDS);

  const memoryTarget = useMemo(() => extractMemoryTarget(question), [question]);

  useEffect(() => {
    if (!isMemoryRecall) {
      setMemoryPhase('recall');
      setCountdown(MEMORY_DISPLAY_SECONDS);
      return undefined;
    }

    setMemoryPhase('memorize');
    setCountdown(MEMORY_DISPLAY_SECONDS);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setMemoryPhase('recall');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isMemoryRecall, question?.id]);

  const beginRecall = () => {
    setMemoryPhase('recall');
    setCountdown(0);
  };

  if (question.category === 'Rating') {
    return (
      <div className="card question-card">
        <span className="question-badge badge-rating">Quick Check-in</span>
        <h2 className="question-prompt">{question.prompt}</h2>

        <fieldset className="rating-group">
          <legend>How difficult was today's assessment?</legend>
          <div className="rating-options">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`rating-chip ${rating.difficulty === opt ? 'rating-chip-active' : ''}`}
                onClick={() => onRate('difficulty', opt)}
                aria-pressed={rating.difficulty === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="rating-group">
          <legend>How confident were you in your answers?</legend>
          <div className="rating-options">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`rating-chip ${rating.confidence === opt ? 'rating-chip-active' : ''}`}
                onClick={() => onRate('confidence', opt)}
                aria-pressed={rating.confidence === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  if (isMemoryRecall && memoryPhase === 'memorize') {
    return (
      <div className="card question-card memory-card">
        <span className="question-badge badge-MemoryRecall">Memory Recall</span>
        <h2 className="question-prompt">Memorize the sequence below.</h2>

        <div className="memory-sequence-box" aria-live="polite">
          <div className="memory-sequence-text">{memoryTarget || question.question}</div>
        </div>

        <div className="memory-timer" aria-label={`Memorize countdown: ${countdown} seconds`}>
          <div className="memory-timer-track">
            <div className="memory-timer-fill" style={{ width: `${(countdown / MEMORY_DISPLAY_SECONDS) * 100}%` }} />
          </div>
          <div className="memory-timer-label">{countdown}s remaining</div>
        </div>

        <button type="button" className="btn btn-primary memory-ready-btn" onClick={beginRecall}>
          I’m ready to recall
        </button>
      </div>
    );
  }

  return (
    <div className="card question-card">
      <span className={`question-badge badge-${question.category.replace(/\s+/g, '')}`}>{question.category}</span>
      <h2 className="question-prompt">{question.prompt}</h2>

      <div className="option-list" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option, idx) => (
          <label
            key={idx}
            className={`option-item ${selectedIndex === idx ? 'option-item-selected' : ''}`}
          >
            <input
              type="radio"
              name={question.id}
              checked={selectedIndex === idx}
              onChange={() => onSelect(idx)}
            />
            <span className="option-radio-visual" aria-hidden="true" />
            <span className="option-text">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
