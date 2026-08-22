import React, { useState, useEffect } from 'react';
import { User, Settings, Heart, Trash2, Check } from 'lucide-react';

export default function Profile({ setActivePage }) {
  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex.rivera@globetrotter.app',
    bio: 'Passionate globetrotter, photographer, and foodie exploring cultures and hidden gems around the world.',
    travel_preferences: 'Culture, Food, Nature, Photography, Architecture'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="gt-container" style={{ maxWidth: 640 }}>
      <h1 className="gt-h1" style={{ marginBottom: 24 }}>Profile &amp; Settings ⚙️</h1>

      <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-lg)', padding: 32, boxShadow: 'var(--gt-shadow-card)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--gt-border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gt-primary), var(--gt-secondary))', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
            AR
          </div>
          <div>
            <h2 className="gt-h2" style={{ margin: '0 0 4px 0', fontSize: 22 }}>{profile.name}</h2>
            <div style={{ color: 'var(--gt-text-muted)', fontSize: 14 }}>{profile.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="gt-form-group">
            <label className="gt-label">Full Name</label>
            <input
              type="text"
              className="gt-input"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="gt-form-group">
            <label className="gt-label">Bio / About Me</label>
            <textarea
              className="gt-textarea"
              rows={3}
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="gt-form-group">
            <label className="gt-label">Travel Preferences (tags)</label>
            <input
              type="text"
              className="gt-input"
              value={profile.travel_preferences}
              onChange={e => setProfile({ ...profile, travel_preferences: e.target.value })}
            />
          </div>

          <button type="submit" className="gt-btn gt-btn--primary" style={{ marginTop: 8 }}>
            {saved ? <><Check size={16} /> Saved Successfully!</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ border: '1px solid rgba(255,102,102,0.3)', background: 'rgba(255,102,102,0.04)', borderRadius: 'var(--gt-radius-md)', padding: 24 }}>
        <h3 style={{ color: 'var(--gt-error)', fontSize: 16, margin: '0 0 6px 0' }}>⚠️ Danger Zone</h3>
        <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', margin: '0 0 16px 0' }}>
          Deleting your account will remove all stored itineraries, custom activities, and public links.
        </p>
        <button
          className="gt-btn gt-btn--danger gt-btn--sm"
          onClick={() => { if (confirm('Are you sure you want to reset your local data?')) { window.location.reload(); } }}
        >
          <Trash2 size={15} /> Delete Account &amp; Reset Data
        </button>
      </div>
    </div>
  );
}
