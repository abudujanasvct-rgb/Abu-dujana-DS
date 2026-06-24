import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const SCAN_LINES = [
  'INITIALIZING IDENTITY SCAN...',
  'ANALYZING FACIAL VECTOR MAP...',
  'CROSS-REFERENCING PROJECT HISTORY...',
  'MATCH FOUND.'
];

export default function Home() {
  const [lineIndex, setLineIndex] = useState(0);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (lineIndex < SCAN_LINES.length - 1) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 650);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setScanned(true), 500);
      return () => clearTimeout(t);
    }
  }, [lineIndex]);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">AI / ML Engineer &middot; Cybersecurity</span>

          <h1 className="hero-title">
            I build systems
            <br />
            that <span className="hero-accent">recognize</span>,
            <br />
            <span className="hero-accent">learn</span>, and{' '}
            <span className="hero-accent">respond</span>.
          </h1>

          <p className="hero-sub">
            Abu Dujana — a pre-final year AI &amp; Data Science engineer who ships real,
            working systems: NLP pipelines, ML dashboards, and a facial-recognition
            security layer that's actually deployed below, scanning you right now.
          </p>

          <div className="hero-actions">
            <Link to="/projects" className="btn btn-primary">
              View Projects →
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Get in Touch
            </Link>
          </div>
        </div>

        <motion.div
          className="scan-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="scan-frame">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
            {!scanned && <div className="scan-beam" />}

            <div className="scan-id">
              <span className="scan-id-label">{scanned ? 'IDENTITY' : 'SCANNING'}</span>
              <span className="scan-id-name">{scanned ? 'ABU DUJANA' : '— — — — —'}</span>
            </div>
          </div>

          <div className="scan-log mono">
            {SCAN_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <div key={i} className={`scan-log-line${i === SCAN_LINES.length - 1 && scanned ? ' ok' : ''}`}>
                <span className="scan-log-prefix">$</span> {line}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
