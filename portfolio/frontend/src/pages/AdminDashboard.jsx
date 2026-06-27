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
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwFeedback, setPwFeedback] = useState('');
  const [pwStatus, setPwStatus] = useState('idle');

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

  const [showDeviceNameInput, setShowDeviceNameInput] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [registrationOptions, setRegistrationOptions] = useState(null);

  async function startDeviceRegistration() {
    setDeviceFeedback('');
    try {
      const options = await api.webauthnRegisterOptions();
      setRegistrationOptions(options);
      setShowDeviceNameInput(true);
    } catch (err) {
      setDeviceFeedback(err.message || 'Could not start device registration.');
    }
  }

  async function handleRegisterDevice(e) {
    e.preventDefault();
    if (!registrationOptions) return;
    setDeviceFeedback('');
    try {
      const regResp = await startRegistration(registrationOptions);
      await api.webauthnRegisterVerify({ ...regResp, deviceLabel: deviceName || 'New device' });
      setDeviceFeedback('Device registered. You can now sign in with fingerprint on it.');
      setShowDeviceNameInput(false);
      setDeviceName('');
      setRegistrationOptions(null);
    } catch (err) {
      setDeviceFeedback(
        err.name === 'NotAllowedError'
          ? 'Fingerprint scan was cancelled or not completed in time.'
          : err.message || `Registration failed: ${err.name || 'unknown error'}`
      );
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwFeedback('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwFeedback('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 10) {
      setPwFeedback('New password must be at least 10 characters.');
      return;
    }
    setPwStatus('loading');
    try {
      await api.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwFeedback('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwFeedback(err.message || 'Could not change password.');
    } finally {
      setPwStatus('idle');
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
            <h2 className="dashboard-form-title">Change Password</h2>
            <form className="contact-form" onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
              <label className="contact-label">Current Password</label>
              <input
                className="contact-input"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
              <label className="contact-label">New Password</label>
              <input
                className="contact-input"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                minLength={10}
              />
              <label className="contact-label">Confirm New Password</label>
              <input
                className="contact-input"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required
                minLength={10}
              />
              <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={pwStatus === 'loading'}>
                {pwStatus === 'loading' ? 'Updating…' : 'Update Password'}
              </button>
              {pwFeedback && (
                <p className={`contact-feedback mono ${pwFeedback.includes('success') ? 'ok' : 'error'}`}>
                  {pwFeedback}
                </p>
              )}
            </form>

            <h2 className="dashboard-form-title" style={{ marginTop: 36 }}>Register a New Device</h2>
            <p className="contact-sub">
              Add fingerprint access for a new phone or laptop. You must already be
              logged in to do this — this prevents anyone else from adding their own biometric
              access to your account.
            </p>

            {!showDeviceNameInput ? (
              <button className="btn btn-primary" onClick={startDeviceRegistration}>
                Register This Device
              </button>
            ) : (
              <form onSubmit={handleRegisterDevice} style={{ maxWidth: 360, marginTop: 12 }}>
                <label className="contact-label">Device Name</label>
                <input
                  className="contact-input"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g. My Phone"
                  autoFocus
                  required
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button type="submit" className="btn btn-primary">
                    Scan Fingerprint
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setShowDeviceNameInput(false); setRegistrationOptions(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {deviceFeedback && (
              <p className={`contact-feedback mono ${deviceFeedback.includes('registered') ? 'ok' : 'error'}`}>
                {deviceFeedback}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
