import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getAssessmentHistory } from '../utils/history';
import { getRecommendedExtension } from '../utils/recommendation';
import { getSupportLevel } from '../utils/scoring';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('neurosync_current_user') || 'null');
  const history = getAssessmentHistory(user?.email);
  const latest = history[history.length - 1];

  const avgSpeed = history.length
    ? Math.round(history.reduce((sum, h) => sum + (h.readingSpeed || 0), 0) / history.length)
    : 0;

  const maxPercent = 100;
  const chartHeight = 140;
  const chartWidth = Math.max(history.length * 60, 300);

  return (
    <div className="dashboard-shell">
      <Navbar />
      <main className="container dashboard-main">
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
          <p>Track your assessment history and reading progress over time.</p>
        </div>

        {history.length === 0 ? (
          <div className="card dashboard-empty">
            <p>You haven't completed an assessment yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/assessment')}>Take the Assessment</button>
          </div>
        ) : (
          <>
            <div className="dashboard-stat-grid">
              <div className="card dashboard-stat">
                <span className="dashboard-stat-label">Assessments Taken</span>
                <span className="dashboard-stat-value">{history.length}</span>
              </div>
              <div className="card dashboard-stat">
                <span className="dashboard-stat-label">Latest Score</span>
                <span className="dashboard-stat-value">{latest.totalPercent}%</span>
              </div>
              <div className="card dashboard-stat">
                <span className="dashboard-stat-label">Avg. Reading Speed</span>
                <span className="dashboard-stat-value">{avgSpeed || '—'} wpm</span>
              </div>
              <div className="card dashboard-stat">
                <span className="dashboard-stat-label">Recommended Extension</span>
                <span className="dashboard-stat-value dashboard-stat-value-small">{getRecommendedExtension(latest.totalPercent).name}</span>
              </div>
            </div>

            <div className="card dashboard-chart-card">
              <h3>Improvement Over Time</h3>
              <svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} preserveAspectRatio="xMinYMid meet">
                <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="var(--color-border)" strokeWidth="1" />
                <polyline
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={history.map((h, i) => `${i * 60 + 30},${chartHeight - (h.totalPercent / maxPercent) * chartHeight}`).join(' ')}
                />
                {history.map((h, i) => (
                  <g key={i}>
                    <circle cx={i * 60 + 30} cy={chartHeight - (h.totalPercent / maxPercent) * chartHeight} r="5" fill="var(--color-accent)" />
                    <text x={i * 60 + 30} y={chartHeight + 20} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">
                      {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="card dashboard-history-card">
              <h3>Assessment History</h3>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Support Level</th>
                    <th>Time Taken</th>
                    <th>Reading Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.date).toLocaleDateString()}</td>
                      <td>{h.totalPercent}%</td>
                      <td>{h.tier || getSupportLevel(h.totalPercent).tier}</td>
                      <td>{h.timeTaken}</td>
                      <td>{h.readingSpeed || '—'} wpm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dashboard-actions">
              <button className="btn btn-primary" onClick={() => navigate('/assessment')}>Take New Assessment</button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
