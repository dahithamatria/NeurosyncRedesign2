import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RecommendationCard from '../components/RecommendationCard';
import ExtensionCard from '../components/ExtensionCard';
import { EXTENSIONS, getRecommendedExtension } from '../utils/recommendation';
import './ExtensionRecommendation.css';

export default function ExtensionRecommendation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const totalPercent = state?.totalPercent ?? 50;
  const extension = state?.extension ?? getRecommendedExtension(totalPercent);

  const handleDownload = (ext) => {
    const link = document.createElement('a');
    link.href = `/extensions/${ext.folder}.zip`;
    link.download = `${ext.folder}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="extrec-shell">
      <Navbar />
      <main className="container extrec-main">
        <RecommendationCard extension={extension} totalPercent={totalPercent} onDownload={() => handleDownload(extension)} />

        <div className="extrec-install-steps">
          <h3>How to install</h3>
          <ol>
            <li>Click "Download Extension" above to save the .zip file.</li>
            <li>Unzip it anywhere on your computer.</li>
            <li>Open Chrome and go to <code>chrome://extensions</code>.</li>
            <li>Turn on <strong>Developer mode</strong> (top right).</li>
            <li>Click <strong>Load unpacked</strong> and select the unzipped folder.</li>
          </ol>
        </div>

        <h2 className="extrec-compare-title">Compare all reading assistants</h2>
        <div className="extrec-grid">
          {Object.values(EXTENSIONS).map((ext) => (
            <ExtensionCard key={ext.id} extension={ext} highlighted={ext.id === extension.id} />
          ))}
        </div>

        <div className="extrec-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
