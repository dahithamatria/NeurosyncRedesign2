import './ProgressBar.css';

export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="progress-wrap">
      <div className="progress-labels">
        <span>Question {current} of {total}</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
