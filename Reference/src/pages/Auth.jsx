import React, { useState } from 'react';
import { Globe, ArrowRight, Check } from 'lucide-react';

export default function Auth({ onLogin, setActivePage }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('alex.rivera@globetrotter.app');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Alex Rivera');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ name, email });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexWrap: 'wrap' }}>
      {/* Left Hero Panel */}
      <div
        style={{
          flex: 1,
          minWidth: 320,
          background: 'linear-gradient(135deg, var(--gt-primary) 0%, #FF8A80 50%, var(--gt-secondary) 100%)',
          color: '#FFFFFF',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Globe size={28} />
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: '#FFF' }}>
          Your Next Journey Starts Here.
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, maxWidth: 460 }}>
          Join thousands of global travellers designing multi-city itineraries, discovering local spots, and collaborating on dream adventures.
        </p>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          flex: 1,
          minWidth: 320,
          background: 'var(--gt-bg)',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 className="gt-h2" style={{ marginBottom: 6 }}>
            {isSignup ? 'Create Free Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, marginBottom: 24 }}>
            {isSignup ? 'Start planning unforgettable adventures.' : 'Sign in to access your saved itineraries.'}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="gt-form-group">
                <label className="gt-label">Full Name</label>
                <input
                  type="text"
                  className="gt-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="gt-form-group">
              <label className="gt-label">Email Address</label>
              <input
                type="email"
                className="gt-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="gt-form-group" style={{ marginBottom: 20 }}>
              <label className="gt-label">Password</label>
              <input
                type="password"
                className="gt-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="gt-btn gt-btn--primary gt-btn--lg" style={{ width: '100%', marginBottom: 16 }}>
              {isSignup ? 'Sign Up & Start Planning' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14 }}>
            {isSignup ? (
              <span style={{ color: 'var(--gt-text-muted)' }}>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignup(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--gt-secondary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span style={{ color: 'var(--gt-text-muted)' }}>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignup(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--gt-secondary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
