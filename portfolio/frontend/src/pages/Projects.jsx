import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | error | empty

  useEffect(() => {
    api
      .getProjects()
      .then((data) => {
        setProjects(data);
        setStatus(data.length ? 'ok' : 'empty');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section className="projects-page">
      <div className="container">
        <span className="eyebrow">Selected Work</span>
        <h1 className="projects-title">Projects</h1>
        <p className="projects-sub">
          Things I've built end-to-end — from data pipeline to deployed interface.
        </p>

        {status === 'loading' && (
          <div className="projects-state mono">Loading projects from the database…</div>
        )}

        {status === 'error' && (
          <div className="projects-state mono error">
            Couldn't reach the project database right now. Refresh, or check back shortly.
          </div>
        )}

        {status === 'empty' && (
          <div className="projects-state mono">No projects added yet. Check back soon.</div>
        )}

        {status === 'ok' && (
          <div className="projects-grid">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
