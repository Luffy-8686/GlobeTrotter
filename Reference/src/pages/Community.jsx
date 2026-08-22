import React from 'react';
import { Globe, Heart, Share2, ArrowRight, Eye, User } from 'lucide-react';

export default function Community({ trips, onCloneTrip, setActivePage, setSelectedTripId }) {
  return (
    <div className="gt-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="gt-h1" style={{ margin: 0 }}>Community Travel Feed 🌐</h1>
        <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
          Explore, get inspired, and clone curated trips published by fellow explorers.
        </p>
      </div>

      {/* Community Trips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {trips.map(trip => (
          <div key={trip.id} className="gt-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
              <img
                src={trip.cover_image || '/images/cities/paris.svg'}
                alt={trip.name}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/cities/paris.svg'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#FFF',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Eye size={13} /> {trip.views || 1} views
              </span>
            </div>

            <div className="gt-card-body" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gt-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  AR
                </div>
                <span style={{ fontSize: 12, color: 'var(--gt-text-muted)', fontWeight: 600 }}>Alex Rivera</span>
              </div>

              <h3 className="gt-card-title" style={{ fontSize: 18, marginBottom: 6 }}>{trip.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {trip.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gt-surface)', padding: '8px 12px', borderRadius: 'var(--gt-radius-sm)' }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>📍 {trip.stops?.length || 0} stops</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gt-secondary)' }}>₹{trip.total_budget?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid var(--gt-border)', padding: '10px 16px', gap: 8 }}>
              <button
                className="gt-btn gt-btn--ghost gt-btn--sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setSelectedTripId(trip.id);
                  setActivePage('itinerary-view');
                }}
              >
                View Details
              </button>
              <button
                className="gt-btn gt-btn--primary gt-btn--sm"
                style={{ flex: 1 }}
                onClick={() => onCloneTrip(trip.id)}
              >
                📋 Copy Trip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
