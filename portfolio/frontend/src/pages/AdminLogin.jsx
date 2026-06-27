import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAuthentication } from '@simplewebauthn/browser';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

// This is the only account that can ever log in, so we don't need to ask for it
const ADMIN_EMAIL = 'abudujana4840@gmail.com';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('biometric'); // biometric | password
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleBiometricLogin() {
    setError('');
    setStatus('loading');
    try {
      const options = await api.webauthnLoginOptions(ADMIN_EMAIL);
      const authResp = await startAuthentication(options);
      const { token } = await api.webauthnLoginVerify({ ...authResp, email: ADMIN_EMAIL });
      login(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Fingerprint login failed.');
      setStatus('idle');
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const { token } = await api.login(email, password);
      login(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
      setStatus('idle');
    }
  }

  return (
    <section className="admin-login">
      <div className="container admin-login-inner">
        <div className="admin-login-card">
          <span className="eyebrow">Restricted Access</span>
          <h1 className="admin-login-title">Admin Sign In</h1>
          <p className="admin-login-sub">
            Only Abu can edit this site. Use fingerprint on supported devices,
            or sign in with a password.
          </p>

          <div className="admin-login-tabs">
            <button
              type="button"
              className={`admin-tab${mode === 'biometric' ? ' active' : ''}`}
              onClick={() => setMode('biometric')}
            >
              Fingerprint
            </button>
            <button
              type="button"
              className={`admin-tab${mode === 'password' ? ' active' : ''}`}
              onClick={() => setMode('password')}
            >
              Password
            </button>
          </div>

          {mode === 'biometric' ? (
            <div className="fingerprint-panel">
              <button
                type="button"
                className="fingerprint-button"
                onClick={handleBiometricLogin}
                disabled={status === 'loading'}
                aria-label="Scan fingerprint to sign in"
              >
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C9.5 2 7.2 2.9 5.5 4.4M12 2c2.5 0 4.8.9 6.5 2.4M12 6a7 7 0 0 0-7 7c0 1.5.3 2.9.8 4.2M12 6a7 7 0 0 1 7 7c0 1-.1 2-.4 3M12 9a4 4 0 0 0-4 4c0 2.5.8 4.8 2 6.7M12 9a4 4 0 0 1 4 4c0 1.2-.1 2.3-.4 3.4M12 12.5v3M9.5 21c-.6-1.1-1.1-2.3-1.4-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <p className="fingerprint-label mono">
                {status === 'loading' ? 'Verifying…' : 'Tap to scan fingerprint'}
              </p>
              {error && <p className="contact-feedback error mono">{error}</p>}
            </div>
          ) : (
            <form onSubmit={handlePasswordLogin}>
              <label className="contact-label">Email</label>
              <input
                className="contact-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="contact-label">Password</label>
              <input
                className="contact-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="btn btn-primary admin-submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Verifying…' : 'Sign In'}
              </button>

              {error && <p className="contact-feedback error mono">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
