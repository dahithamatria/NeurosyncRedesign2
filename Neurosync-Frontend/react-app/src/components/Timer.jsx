import { formatTime } from '../utils/scoring';
import './Timer.css';

export default function Timer({ seconds, running }) {
  return (
    <div className="timer-pill" role="timer" aria-live="off">
      <span className={`timer-dot ${running ? 'timer-dot-active' : ''}`} />
      <span className="timer-value">{formatTime(seconds)}</span>
    </div>
  );
}
