import React, { useState } from 'react';
import { Calendar, Image, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CreateTrip({ onCreateTrip, setActivePage }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('/images/cities/paris.svg');

  const coverOptions = [
    '/images/cities/paris.svg',
    '/images/cities/tokyo.svg',
    '/images/cities/rome.svg',
    '/images/cities/barcelona.svg',
    '/images/cities/bali.svg',
    '/images/cities/new_york.svg',
    '/images/cities/london.svg',
    '/images/cities/dubai.svg'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateTrip({
      name,
      start_date: startDate,
      end_date: endDate,
      description,
      cover_image: coverImage
    });
  };

  return (
    <div className="gt-container" style={{ maxWidth: 680 }}>
      <button
        className="gt-btn gt-btn--ghost gt-btn--sm"
        onClick={() => setActivePage('dashboard')}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-lg)', padding: '36px', boxShadow: 'var(--gt-shadow-card)' }}>
        <h1 className="gt-h1" style={{ marginBottom: 8 }}>Plan a New Trip ✨</h1>
        <p style={{ color: 'var(--gt-text-muted)', marginBottom: 28 }}>
          Set your destination goals, dates, and cover photo to start designing your custom itinerary.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Trip Name */}
          <div className="gt-form-group">
            <label className="gt-label">Trip Name <span style={{ color: 'var(--gt-error)' }}>*</span></label>
            <input
              type="text"
              className="gt-input"
              placeholder="e.g., Swiss Alps Summer Explorer 2026"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="gt-label">Start Date <span style={{ color: 'var(--gt-error)' }}>*</span></label>
              <input
                type="date"
                className="gt-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="gt-label">End Date <span style={{ color: 'var(--gt-error)' }}>*</span></label>
              <input
                type="date"
                className="gt-input"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="gt-form-group">
            <label className="gt-label">Trip Notes / Description</label>
            <textarea
              className="gt-textarea"
              rows={3}
              placeholder="Bucket list highlights, travel companions, packing reminders..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Cover Photo Selection */}
          <div className="gt-form-group">
            <label className="gt-label">Select Cover Image</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
              {coverOptions.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setCoverImage(url)}
                  style={{
                    height: 64,
                    borderRadius: 'var(--gt-radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: coverImage === url ? '3px solid var(--gt-primary)' : '2px solid transparent',
                    boxShadow: coverImage === url ? '0 0 0 2px rgba(255,90,95,0.3)' : 'none'
                  }}
                >
                  <img src={url} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button
              type="button"
              className="gt-btn gt-btn--ghost"
              onClick={() => setActivePage('dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gt-btn gt-btn--primary gt-btn--lg"
              style={{ flex: 1 }}
            >
              Create Trip &amp; Add Stops <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
