import './About.css';

const SKILLS = [
  { label: 'Data Structures', value: 'Arrays, Linked Lists, Trees, Hashing' },
  { label: 'Data Science', value: 'NumPy, Pandas, Matplotlib, Seaborn' },
  { label: 'Machine Learning', value: 'Scikit-learn, Random Forests, Logistic Regression, SVM, K-Means, NLP, TF-IDF' },
  { label: 'Frameworks & DB', value: 'Keras, LangChain, PostgreSQL, MongoDB' },
  { label: 'API & Tools', value: 'Flask, REST APIs, GitHub, OpenCV' },
  { label: 'Cybersecurity', value: 'Face Recognition, Secure Authentication Systems' }
];

const TIMELINE = [
  { year: '2024', label: 'Started B.Tech in AI & Data Science', detail: 'Sri Venkateswaraa College of Technology' },
  { year: '2024', label: 'AI Fundamentals Certified', detail: 'Google, Microsoft & IBM' },
  { year: '2024–25', label: 'Cybersecurity Workshop', detail: 'K7 Security' },
  { year: '2025', label: 'Data Science & ML Virtual Internship', detail: 'Thiranex' },
  { year: '2025', label: 'Advanced AI Tools Workshop', detail: 'Hysas' },
  { year: '2024 & 2025', label: 'Hackathon Participant', detail: 'National-level competitions' }
];

export default function About() {
  return (
    <section className="about-page">
      <div className="container about-grid">
        <div>
          <span className="eyebrow">About</span>
          <h1 className="about-title">Abu Dujana</h1>
          <p className="about-bio">
            I'm a pre-final year AI &amp; Data Science engineering student who'd rather build
            something real than just study theory. My work spans machine learning pipelines,
            interactive dashboards, and a cybersecurity login system that recognizes faces and
            flags intruders — all shipped, not just prototyped.
          </p>
          <p className="about-bio">
            I'm certified in AI fundamentals by Google, Microsoft, and IBM, completed a virtual
            data science &amp; ML internship with Thiranex, and have been through hands-on
            workshops in cybersecurity and advanced AI tooling. I've also competed in national
            hackathons in 2024 and 2025.
          </p>
          <p className="about-bio">
            Right now I'm looking for an AI/ML internship where I can keep shipping real work
            and learn from engineers who've shipped more than I have.
          </p>
        </div>

        <div className="about-side">
          <h2 className="about-side-title">Skill Map</h2>
          <ul className="skill-list">
            {SKILLS.map((s) => (
              <li key={s.label} className="skill-row">
                <span className="skill-label mono">{s.label}</span>
                <span className="skill-value">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container">
        <h2 className="about-side-title timeline-title">Timeline</h2>
        <ol className="timeline">
          {TIMELINE.map((t, i) => (
            <li key={i} className="timeline-item">
              <span className="timeline-year mono">{t.year}</span>
              <span className="timeline-dot" />
              <div className="timeline-content">
                <p className="timeline-label">{t.label}</p>
                <p className="timeline-detail">{t.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
