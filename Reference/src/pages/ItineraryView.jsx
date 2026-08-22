import React from 'react';
import { Calendar, MapPin, Clock, Edit, BarChart2, Share2, ArrowLeft } from 'lucide-react';

export default function ItineraryView({ trip, setActivePage }) {
  if (!trip) {
    return (
      <div className="gt-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2>No trip selected.</h2>
        <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('my-trips')} style={{ marginTop: 16 }}>
          Go to My Trips
        </button>
      </div>
    );
  }

  // Aggregate and sort all activities across stops by day_index
  const daysMap = {};
  trip.stops?.forEach(stop => {
    stop.activities?.forEach(act => {
      const d = act.day_index || 1;
      if (!daysMap[d]) {
        daysMap[d] = {
          day: d,
          cityName: stop.city_name,
          country: stop.city_country,
          activities: []
        };
      }
      daysMap[d].activities.push({ ...act, cityName: stop.city_name });
    });
  });

  const sortedDays = Object.values(daysMap).sort((a, b) => a.day - b.day);

  return (
    <div className="gt-container" style={{ maxWidth: 840 }}>
      {/* Header */}
      <button
        className="gt-btn gt-btn--ghost gt-btn--sm"
        onClick={() => setActivePage('my-trips')}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Back to Trips
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="gt-chip gt-chip--primary">{trip.state?.toUpperCase()}</span>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)' }}>📅 {trip.start_date} → {trip.end_date}</span>
          </div>
          <h1 className="gt-h1" style={{ margin: 0 }}>{trip.name}</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '6px 0 0 0' }}>
            {trip.description || 'Custom multi-city travel itinerary'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gt-btn gt-btn--primary gt-btn--sm" onClick={() => setActivePage('builder')}>
            <Edit size={15} /> Edit Builder
          </button>
          <button className="gt-btn gt-btn--secondary gt-btn--sm" onClick={() => setActivePage('budget')}>
            <BarChart2 size={15} /> Budget Charts
          </button>
        </div>
      </div>

      {/* Overview Destination Chips */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, marginBottom: 28 }}>
        {trip.stops?.map((stop, idx) => (
          <div
            key={stop.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'var(--gt-surface)',
              border: '1px solid var(--gt-border)',
              borderRadius: 'var(--gt-radius-full)',
              whiteSpace: 'nowrap',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <MapPin size={14} color="var(--gt-primary)" />
            <span>Stop {idx + 1}: {stop.city_name}</span>
            <span style={{ color: 'var(--gt-text-muted)', fontWeight: 400 }}>({stop.activities?.length || 0} activities)</span>
          </div>
        ))}
      </div>

      {/* Day-by-Day Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {sortedDays.map(dayGroup => (
          <div key={dayGroup.day}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 10,
                borderBottom: '2px solid var(--gt-secondary)',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--gt-font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--gt-secondary)' }}>
                  Day {dayGroup.day}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gt-text-muted)' }}>
                  · 📍 {dayGroup.cityName}, {dayGroup.country}
                </span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--gt-text-muted)', fontWeight: 600 }}>
                {dayGroup.activities.length} activities
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dayGroup.activities.map(act => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    background: 'var(--gt-bg)',
                    border: '1px solid var(--gt-border)',
                    borderRadius: 'var(--gt-radius-md)',
                    boxShadow: 'var(--gt-shadow-card)',
                    gap: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <img
                      src={act.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}
                      alt={act.activity_name}
                      style={{ width: 54, height: 54, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="gt-chip" style={{ fontSize: 11, padding: '2px 8px', textTransform: 'capitalize' }}>
                          ⏰ {act.time_slot}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--gt-text-muted)' }}>⏱ {act.duration_hours}h</span>
                        <span style={{ fontSize: 12, color: 'var(--gt-text-muted)', textTransform: 'capitalize' }}>🏷 {act.category}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{act.activity_name}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--gt-secondary)', fontSize: 16 }}>
                      ₹{act.cost?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sortedDays.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gt-text-muted)' }}>
            <Calendar size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h3>No activities scheduled yet.</h3>
            <p>Open the builder to add destinations and schedule your favorite activities.</p>
            <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('builder')} style={{ marginTop: 16 }}>
              Open Builder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
