import './ProjectCard.css';

const CATEGORY_LABELS = {
  ml: 'Machine Learning',
  web: 'Web App',
  security: 'Cybersecurity',
  data: 'Data Science',
  other: 'Project'
};

export default function ProjectCard({ project }) {
  return (
    <article className="pcard">
      <div className="pcard-head">
        <span className="eyebrow pcard-category">
          {CATEGORY_LABELS[project.category] || 'Project'}
        </span>
        {project.featured && <span className="pcard-featured mono">Featured</span>}
      </div>

      <h3 className="pcard-title">{project.title}</h3>
      <p className="pcard-summary">{project.summary}</p>

      {project.techStack?.length > 0 && (
        <ul className="pcard-stack">
          {project.techStack.map((tech) => (
            <li key={tech} className="mono">{tech}</li>
          ))}
        </ul>
      )}

      {project.highlights?.length > 0 && (
        <ul className="pcard-highlights">
          {project.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      <div className="pcard-links">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" className="pcard-link">
            View Code →
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="pcard-link">
            Live Demo →
          </a>
        )}
      </div>
    </article>
  );
}
