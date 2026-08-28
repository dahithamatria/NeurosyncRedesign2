import './ResultCard.css';

function CircularScore({ percent, color }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="circular-score" role="img" aria-label={`Overall score ${percent} percent`}>
      <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="14" />
      <circle
        cx="90" cy="90" r={radius} fill="none"
        stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 90 90)"
        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="90" y="84" textAnchor="middle" fontSize="34" fontWeight="800" fill="var(--color-secondary)" fontFamily="var(--font-display)">{percent}%</text>
      <text x="90" y="108" textAnchor="middle" fontSize="13" fill="var(--color-text-muted)">Overall Score</text>
    </svg>
  );
}

function CategoryBar({ label, correct, total, percent }) {
  return (
    <div className="cat-bar-row">
      <div className="cat-bar-label">
        <span>{label}</span>
        <span className="cat-bar-fraction">{correct}/{total}</span>
      </div>
      <div className="cat-bar-track">
        <div className="cat-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ResultCard({ results, support, recommendations, timeTaken }) {
  const { categoryScores, totalPercent, readingSpeed } = results;

  return (
    <div className="result-dashboard">
      <div className="card result-summary-card">
        <CircularScore percent={totalPercent} color={support.color} />
        <div className="risk-indicator" style={{ '--risk-color': support.color }}>
          <span className="risk-dot" />
          {support.tier} · {support.level}
        </div>
        <div className="result-stats">
          <div className="result-stat">
            <span className="result-stat-value">{timeTaken}</span>
            <span className="result-stat-label">Assessment Time</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{readingSpeed || '—'}</span>
            <span className="result-stat-label">Words / Min</span>
          </div>
        </div>
      </div>

      <div className="card result-category-card">
        <h3>Category Breakdown</h3>
        {Object.entries(categoryScores).map(([label, data]) => (
          <CategoryBar key={label} label={label} {...data} />
        ))}
      </div>

      <div className="card result-recommend-card">
        <h3>Recommendations</h3>
        <ul className="recommend-list">
          {recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <p className="result-disclaimer">
          NeuroSync provides a cognitive screening estimate, not a medical diagnosis. If difficulties persist, please consult a qualified specialist.
        </p>
      </div>
    </div>
  );
}
