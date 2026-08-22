import React from 'react';
import { Plus, Compass, Calendar, ArrowRight, MapPin, Sparkles, TrendingUp } from 'lucide-react';

export default function Dashboard({ trips, cities, setActivePage, setSelectedTripId }) {
  const topCities = cities.slice(0, 8);
  const recentTrips = trips.slice(0, 4);

  return (
    <div className="gt-container">
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8A80 50%, #00A699 100%)',
          borderRadius: 'var(--gt-radius-lg)',
          padding: '48px 40px',
          color: '#FFFFFF',
          marginBottom: 'var(--gt-space-5)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(255, 90, 95, 0.2)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            <Sparkles size={14} /> AI-Powered Itinerary Planner
          </div>
          <h1 style={{ fontSize: 36, lineHeight: 1.2, fontWeight: 800, marginBottom: 12, color: '#FFF' }}>
            Where to next, Explorer? ✈️
          </h1>
          <p style={{ fontSize: 16, opacity: 0.95, marginBottom: 24, lineHeight: 1.5 }}>
            Design multi-city itineraries end-to-end, discover curated activities, track budgets, and share your adventures seamlessly.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="gt-btn"
              onClick={() => setActivePage('create-trip')}
              style={{ background: '#FFFFFF', color: 'var(--gt-primary)', fontWeight: 700, border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            >
              <Plus size={18} /> Plan a New Trip
            </button>
            <button
              className="gt-btn"
              onClick={() => setActivePage('explore-cities')}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1.5px solid rgba(255,255,255,0.4)' }}
            >
              <Compass size={18} /> Explore Destinations
            </button>
          </div>
        </div>
      </div>

      {/* Top Regional Selections */}
      <section style={{ marginBottom: 'var(--gt-space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gt-space-3)' }}>
          <div>
            <h2 className="gt-h2" style={{ margin: 0 }}>🌏 Top Destinations</h2>
            <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: 0 }}>Handpicked global cities with curated activities</p>
          </div>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('explore-cities')}>
            View All ({cities.length}) <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--gt-space-3)' }}>
          {topCities.map(city => (
            <div
              key={city.id}
              className="gt-card"
              onClick={() => setActivePage('explore-cities')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                <img
                  src={city.image_url || '/images/cities/paris.svg'}
                  alt={city.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/cities/paris.svg'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#FFB020',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {'$'.repeat(city.cost_index || 1)}
                </span>
              </div>
              <div className="gt-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 className="gt-card-title" style={{ fontSize: 18, margin: 0 }}>{city.name}</h3>
                  <span className="gt-chip" style={{ fontSize: 11, padding: '2px 8px' }}>
                    ★ {city.popularity_score}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 8 }}>
                  {city.country} · {city.region?.toUpperCase()}
                </div>
                <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {city.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Your Itineraries */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gt-space-3)' }}>
          <div>
            <h2 className="gt-h2" style={{ margin: 0 }}>🧳 Your Itineraries</h2>
            <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: 0 }}>Recent travel plans and itineraries</p>
          </div>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('my-trips')}>
            All Trips ({trips.length}) <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--gt-space-3)' }}>
          {recentTrips.map(trip => (
            <div key={trip.id} className="gt-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
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
                    background: 'rgba(255, 255, 255, 0.92)',
                    color: 'var(--gt-primary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: 11
                  }}
                >
                  {trip.state || 'Upcoming'}
                </span>
              </div>

              <div className="gt-card-body" style={{ flex: 1 }}>
                <h3 className="gt-card-title" style={{ fontSize: 18, marginBottom: 4 }}>{trip.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 12 }}>
                  📅 {trip.start_date} → {trip.end_date}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gt-surface)', padding: '8px 12px', borderRadius: 'var(--gt-radius-sm)', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>📍 {trip.stops?.length || 0} Stops</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gt-secondary)' }}>₹{trip.total_budget?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', borderTop: '1px solid var(--gt-border)', padding: '8px 16px', gap: 8 }}>
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
                  Edit Builder
                </button>
                <button
                  className="gt-btn gt-btn--ghost gt-btn--sm"
                  style={{ flex: 1 }}
                  onClick={() => { setSelectedTripId(trip.id); setActivePage('budget'); }}
                >
                  Budget
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
