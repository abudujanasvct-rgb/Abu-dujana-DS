import { useState } from 'react';
import { api } from '../api/client';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      await api.sendMessage(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  return (
    <section className="contact-page">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">Get in Touch</span>
          <h1 className="contact-title">Let's talk</h1>
          <p className="contact-sub">
            Open to AI/ML internships and collaboration. Drop a message and I'll reply by email.
          </p>

          <div className="contact-direct">
            <a href="mailto:abudujana4840@gmail.com" className="contact-direct-link">
              abudujana4840@gmail.com
            </a>
            <a href="tel:+919445280411" className="contact-direct-link">
              +91 94452 80411
            </a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-label" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={100}
            className="contact-input"
            placeholder="Your name"
          />

          <label className="contact-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={150}
            className="contact-input"
            placeholder="you@example.com"
          />

          <label className="contact-label" htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            maxLength={2000}
            rows={5}
            className="contact-input"
            placeholder="What's on your mind?"
          />

          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>

          {status === 'sent' && (
            <p className="contact-feedback ok mono">Message sent. Thanks — I'll get back to you.</p>
          )}
          {status === 'error' && (
            <p className="contact-feedback error mono">{errorMsg || 'Could not send message.'}</p>
          )}
        </form>
      </div>
    </section>
  );
}
