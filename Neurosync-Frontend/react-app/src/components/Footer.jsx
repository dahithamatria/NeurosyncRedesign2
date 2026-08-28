import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} NeuroSync — Cognitive reading screening, not a medical diagnosis.</p>
        <p className="footer-note">If you have concerns about reading difficulty, consult a licensed specialist.</p>
      </div>
    </footer>
  );
}
