import React, { useState } from 'react';
import { Plus, MapPin, Calendar, ArrowRight, Share2, Edit, BarChart2, Trash2 } from 'lucide-react';

export default function MyTrips({ trips, setActivePage, setSelectedTripId, onDeleteTrip }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const filteredTrips = trips.filter(t => {
    if (activeTab === 'ongoing') return t.state === 'ongoing';
    if (activeTab === 'upcoming') return t.state === 'upcoming' || !t.state;
    if (activeTab === 'completed') return t.state === 'completed';
    return true;
  });

  return (
    <div className="gt-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>My Itineraries 🧳</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Manage, organize, and customize all your travel plans.
          </p>
        </div>
        <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('create-trip')}>
          <Plus size={18} /> Plan a Trip
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--gt-border)', paddingBottom: 12, marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          className="gt-btn"
          style={{
            background: activeTab === 'upcoming' ? 'var(--gt-primary)' : 'transparent',
            color: activeTab === 'upcoming' ? '#FFF' : 'var(--gt-text-muted)',
            border: 'none',
            fontSize: 14,
            padding: '8px 18px'
          }}
        >
          📅 Upcoming ({trips.filter(t => t.state === 'upcoming' || !t.state).length})
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          className="gt-btn"
          style={{
            background: activeTab === 'ongoing' ? 'var(--gt-primary)' : 'transparent',
            color: activeTab === 'ongoing' ? '#FFF' : 'var(--gt-text-muted)',
            border: 'none',
            fontSize: 14,
            padding: '8px 18px'
          }}
        >
          🟢 Ongoing ({trips.filter(t => t.state === 'ongoing').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className="gt-btn"
          style={{
            background: activeTab === 'completed' ? 'var(--gt-primary)' : 'transparent',
            color: activeTab === 'completed' ? '#FFF' : 'var(--gt-text-muted)',
            border: 'none',
            fontSize: 14,
            padding: '8px 18px'
          }}
        >
          ✅ Completed ({trips.filter(t => t.state === 'completed').length})
        </button>
      </div>

      {/* Trip Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {filteredTrips.map(trip => (
          <div key={trip.id} className="gt-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
              <img
                src={trip.cover_image || '/images/cities/paris.svg'}
                alt={trip.name}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/cities/paris.svg'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="gt-chip"
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: 'var(--gt-primary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 11
                }}
              >
                {trip.state || 'Upcoming'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete trip "${trip.name}"?`)) {
                    onDeleteTrip(trip.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--gt-error)'
                }}
                title="Delete Trip"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="gt-card-body" style={{ flex: 1 }}>
              <h3 className="gt-card-title" style={{ fontSize: 20, marginBottom: 6 }}>{trip.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 12 }}>
                📅 {trip.start_date} → {trip.end_date}
              </div>

              {trip.description && (
                <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {trip.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gt-surface)', padding: '10px 14px', borderRadius: 'var(--gt-radius-sm)' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>📍 {trip.stops?.length || 0} Destinations</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--gt-secondary)' }}>₹{trip.total_budget?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid var(--gt-border)', padding: '10px 16px', gap: 8 }}>
              <button
                className="gt-btn gt-btn--ghost gt-btn--sm"
                style={{ flex: 1 }}
                onClick={() => { setSelectedTripId(trip.id); setActivePage('itinerary-view'); }}
              >
                View
              </button>
              <button
                className="gt-btn gt-btn--secondary gt-btn--sm"
                style={{ flex: 1 }}
                onClick={() => { setSelectedTripId(trip.id); setActivePage('builder'); }}
              >
                <Edit size={14} /> Builder
              </button>
              <button
                className="gt-btn gt-btn--ghost gt-btn--sm"
                style={{ flex: 1 }}
                onClick={() => { setSelectedTripId(trip.id); setActivePage('budget'); }}
              >
                <BarChart2 size={14} /> Budget
              </button>
              <button
                className="gt-btn gt-btn--ghost gt-btn--sm"
                style={{ padding: '6px 10px' }}
                onClick={() => {
                  const url = `${window.location.origin}/trip/shared/${trip.share_token}`;
                  navigator.clipboard.writeText(url);
                  alert('Share link copied!');
                }}
                title="Copy share link"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filteredTrips.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', background: 'var(--gt-surface)', borderRadius: 'var(--gt-radius-lg)', border: '1px dashed var(--gt-border)' }}>
            <Calendar size={48} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
            <h3 className="gt-h3">No {activeTab} trips found</h3>
            <p style={{ color: 'var(--gt-text-muted)', marginBottom: 20 }}>
              Start planning your next unforgettable journey today!
            </p>
            <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('create-trip')}>
              + Plan a New Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
