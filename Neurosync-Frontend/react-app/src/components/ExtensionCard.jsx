import './ExtensionCard.css';

export default function ExtensionCard({ extension, highlighted = false }) {
  return (
    <div className={`card extension-card ${highlighted ? 'extension-card-highlighted' : ''}`} style={{ '--ext-color': extension.color }}>
      {highlighted && <span className="extension-badge">Recommended for you</span>}
      <div className="extension-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M4 12a8 8 0 1 1 8 8" stroke={extension.color} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill={extension.color} />
        </svg>
      </div>
      <h3 className="extension-name">{extension.name}</h3>
      <p className="extension-support">{extension.supportLevel}</p>
      <p className="extension-tagline">{extension.tagline}</p>

      <div className="extension-example">
        <div className="extension-example-row">
          <span className="extension-example-label">Original</span>
          <p>{extension.example.original}</p>
        </div>
        <div className="extension-example-row">
          <span className="extension-example-label">Simplified</span>
          <p>{extension.example.simplified}</p>
        </div>
      </div>
    </div>
  );
}
