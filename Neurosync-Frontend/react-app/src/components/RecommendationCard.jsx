import './RecommendationCard.css';

export default function RecommendationCard({ extension, totalPercent, onDownload }) {
  return (
    <div className="card recommendation-card" style={{ '--ext-color': extension.color }}>
      <span className="recommendation-eyebrow">Recommended Reading Assistant</span>
      <h2 className="recommendation-name">{extension.name}</h2>
      <p className="recommendation-description">{extension.description}</p>

      <div className="recommendation-meta">
        <div className="recommendation-meta-item">
          <span className="recommendation-meta-label">Your Score</span>
          <span className="recommendation-meta-value">{totalPercent}%</span>
        </div>
        <div className="recommendation-meta-item">
          <span className="recommendation-meta-label">Support Level</span>
          <span className="recommendation-meta-value" style={{ color: extension.color }}>{extension.tier}</span>
        </div>
      </div>

      <button className="btn btn-primary recommendation-download" onClick={onDownload}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v13m0 0l-5-5m5 5l5-5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Download Extension
      </button>
    </div>
  );
}
