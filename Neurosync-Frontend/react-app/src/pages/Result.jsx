import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResultCard from '../components/ResultCard';
import { getSupportLevel, getRecommendations } from '../utils/scoring';
import { getRecommendedExtension } from '../utils/recommendation';
import { generateResultPDF } from '../utils/pdfGenerator';
import { saveAssessmentToHistory } from '../utils/history';
import './Result.css';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const user = JSON.parse(localStorage.getItem('neurosync_current_user') || 'null');

  useEffect(() => {
    if (!state?.results) {
      navigate('/assessment', { replace: true });
      return;
    }
    if (user?.email) {
      saveAssessmentToHistory(user.email, {
        totalPercent: state.results.totalPercent,
        timeTaken: state.timeTaken,
        readingSpeed: state.results.readingSpeed,
        tier: getSupportLevel(state.results.totalPercent).tier,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!state?.results) return null;

  const { results, timeTaken } = state;
  const support = getSupportLevel(results.totalPercent);
  const extension = getRecommendedExtension(results.totalPercent);
  const recommendations = getRecommendations(results.totalPercent, results.categoryScores);

  const handleDownload = () => {
    generateResultPDF({ results, risk: support, recommendations, timeTaken, userName: user?.name });
  };

  return (
    <div className="result-shell">
      <Navbar />
      <main className="container result-main">
        <div className="result-header">
          <h1>Your Results{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p>Here's your Reading Support Level and a personalized breakdown across each area we tested.</p>
        </div>

        <ResultCard results={results} support={support} recommendations={recommendations} timeTaken={timeTaken} />

        <div className="result-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/extension-recommendation', { state: { totalPercent: results.totalPercent, extension } })}
          >
            View Recommended Extension
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/assessment')}>Retake Assessment</button>
          <button className="btn btn-secondary" onClick={handleDownload}>Download PDF Report</button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>My Dashboard</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
