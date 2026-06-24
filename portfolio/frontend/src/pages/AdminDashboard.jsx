import { useEffect, useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const EMPTY_PROJECT = {
  title: '',
  summary: '',
  description: '',
  techStack: '',
  githubUrl: '',
  liveUrl: '',
  category: 'other',
  highlights: '',
  featured: false
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('projects');

  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [feedback, setFeedback] = useState('');
  const [deviceFeedback, setDeviceFeedback] = useState('');

  useEffect(() => {
    loadProjects();
    loadMessages();
  }, []);

  function loadProjects() {
    api.getProjects().then(setProjects).catch(() => {});
  }
  function loadMessages() {
    api.getMessages().then(setMessages).catch(() => {});
  }

  function startEdit(project) {
    setEditingId(project._id);
    setForm({
      ...project,
      techStack: (project.techStack || []).join(', '),
      highlights: (project.highlights || []).join('\n')
    });
    setTab('projects');
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_PROJECT);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback('');
    const payload = {
      ...form,
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      highlights: form.highlights.split('\n').map((s) => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await api.updateProject(editingId, payload);
        setFeedback('Project updated.');
      } else {
        await api.createProject(payload);
        setFeedback('Project added.');
      }
      resetForm();
      loadProjects();
    } catch (err) {
      setFeedback(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await api.deleteProject(id);
    loadProjects();
  }

  async function handleRegisterDevice() {
    setDeviceFeedback('');
    try {
      const options = await api.webauthnRegisterOptions();
      const regResp = await startRegistration(options);
      const label = prompt('Name this device (e.g. "My Phone"):') || 'New device';
      await api.webauthnRegisterVerify({ ...regResp, deviceLabel: label });
      setDeviceFeedback('Device registered. You can now sign in with fingerprint/Face ID on it.');
    } catch (err) {
      setDeviceFeedback(err.message || 'Could not register device.');
    }
  }

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Log Out</button>
        </div>

        <div className="dashboard-tabs">
          {['projects', 'messages', 'security'].map((t) => (
            <button
              key={t}
              className={`admin-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'projects' ? 'Projects' : t === 'messages' ? `Messages (${messages.length})` : 'Security'}
            </button>
          ))}
        </div>

        {tab === 'projects' && (
          <div className="dashboard-grid">
            <form className="contact-form dashboard-form" onSubmit={handleSubmit}>
              <h2 className="dashboard-form-title">{editingId ? 'Edit Project' : 'Add New Project'}</h2>

              <label className="contact-label">Title</label>
              <input className="contact-input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />

              <label className="contact-label">Summary (short, shown on card)</label>
              <input className="contact-input" value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })} required />

              <label className="contact-label">Category</label>
              <select className="contact-input" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="ml">Machine Learning</option>
                <option value="web">Web App</option>
                <option value="security">Cybersecurity</option>
                <option value="data">Data Science</option>
                <option value="other">Other</option>
              </select>

              <label className="contact-label">Tech Stack (comma separated)</label>
              <input className="contact-input" value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })} />

              <label className="contact-label">Highlights (one per line)</label>
              <textarea className="contact-input" rows={4} value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })} />

              <label className="contact-label">GitHub URL</label>
              <input className="contact-input" value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />

              <label className="contact-label">Live URL</label>
              <input className="contact-input" value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />

              <label className="dashboard-checkbox">
                <input type="checkbox" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>

              <div className="dashboard-form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Add Project'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>

              {feedback && <p className="contact-feedback ok mono">{feedback}</p>}
            </form>

            <div className="dashboard-list">
              {projects.map((p) => (
                <div key={p._id} className="dashboard-list-item">
                  <div>
                    <p className="dashboard-list-title">{p.title}</p>
                    <p className="dashboard-list-sub mono">{p.category}</p>
                  </div>
                  <div className="dashboard-list-actions">
                    <button className="btn btn-ghost" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-ghost danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="mono dashboard-empty">No projects yet.</p>}
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className="dashboard-list full-width">
            {messages.map((m) => (
              <div key={m._id} className="message-item">
                <div className="message-head">
                  <span className="dashboard-list-title">{m.name}</span>
                  <span className="mono message-date">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="message-email mono">{m.email}</p>
                <p className="message-body">{m.message}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="mono dashboard-empty">No messages yet.</p>}
          </div>
        )}

        {tab === 'security' && (
          <div className="dashboard-security">
            <h2 className="dashboard-form-title">Register a New Device</h2>
            <p className="contact-sub">
              Add fingerprint / Face ID access for a new phone or laptop. You must already be
              logged in to do this — this prevents anyone else from adding their own biometric
              access to your account.
            </p>
            <button className="btn btn-primary" onClick={handleRegisterDevice}>
              Register This Device
            </button>
            {deviceFeedback && <p className="contact-feedback ok mono">{deviceFeedback}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
