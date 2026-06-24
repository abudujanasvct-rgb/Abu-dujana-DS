import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startAuthentication } from '@simplewebauthn/browser';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('biometric'); // biometric | password
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleBiometricLogin(e) {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const options = await api.webauthnLoginOptions(email);
      const authResp = await startAuthentication(options);
      const { token } = await api.webauthnLoginVerify({ ...authResp, email });
      login(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Biometric login failed.');
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
            Only Abu can edit this site. Use fingerprint / Face ID on supported devices,
            or sign in with a password.
          </p>

          <div className="admin-login-tabs">
            <button
              type="button"
              className={`admin-tab${mode === 'biometric' ? ' active' : ''}`}
              onClick={() => setMode('biometric')}
            >
              Fingerprint / Face ID
            </button>
            <button
              type="button"
              className={`admin-tab${mode === 'password' ? ' active' : ''}`}
              onClick={() => setMode('password')}
            >
              Password
            </button>
          </div>

          <form onSubmit={mode === 'biometric' ? handleBiometricLogin : handlePasswordLogin}>
            <label className="contact-label">Email</label>
            <input
              className="contact-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode === 'password' && (
              <>
                <label className="contact-label">Password</label>
                <input
                  className="contact-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </>
            )}

            <button type="submit" className="btn btn-primary admin-submit" disabled={status === 'loading'}>
              {status === 'loading'
                ? 'Verifying…'
                : mode === 'biometric'
                ? 'Scan Fingerprint / Face ID'
                : 'Sign In'}
            </button>

            {error && <p className="contact-feedback error mono">{error}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
