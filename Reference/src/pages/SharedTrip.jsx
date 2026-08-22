import React, { useState, useEffect } from 'react';
import { Globe, Copy, Check, MapPin, Eye, ArrowRight, User } from 'lucide-react';

export default function SharedTrip({ token, onCloneTrip, setActivePage }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${token || 'demo-europe-2026'}`)
      .then(r => r.json())
      .then(data => {
        setTrip(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClone = () => {
    if (trip) {
      onCloneTrip(trip.id);
    }
  };

  if (loading) {
    return (
      <div className="gt-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p>Loading shared itinerary...</p>
      </div>
    );
  }

  if (!trip || trip.error) {
    return (
      <div className="gt-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Shared Trip Not Found</h2>
        <p style={{ color: 'var(--gt-text-muted)', marginBottom: 20 }}>This shared trip link is invalid or has expired.</p>
        <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('dashboard')}>
          Go to GlobeTrotter Home
        </button>
      </div>
    );
  }

  return (
    <div className="gt-container" style={{ maxWidth: 840 }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', padding: '36px 0 24px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gt-primary), var(--gt-secondary))', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: 24, fontWeight: 800 }}>
          AR
        </div>
        <div style={{ fontSize: 13, color: 'var(--gt-text-muted)' }}>
          Shared by <strong>Alex Rivera</strong> · 👁️ {trip.views || 1} views
        </div>
        <h1 style={{ fontSize: 36, margin: '8px 0 12px 0' }}>{trip.name}</h1>
        <p style={{ color: 'var(--gt-text-muted)', maxWidth: 600, margin: '0 auto 18px auto' }}>
          {trip.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 14, color: 'var(--gt-text-muted)', marginBottom: 24, flexWrap: 'wrap' }}>
          <span>📅 {trip.start_date} → {trip.end_date}</span>
          <span>📍 {trip.stops?.length || 0} destinations</span>
          <span>💰 Estimated Budget: <strong style={{ color: 'var(--gt-secondary)' }}>₹{trip.total_budget?.toLocaleString()}</strong></span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="gt-btn gt-btn--primary gt-btn--lg" onClick={handleClone}>
            📋 Copy This Trip to My Account
          </button>
          <button className="gt-btn gt-btn--secondary gt-btn--lg" onClick={handleCopyLink}>
            {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>

      {/* Itinerary Overview */}
      <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-lg)', padding: 28, boxShadow: 'var(--gt-shadow-card)', marginTop: 24 }}>
        <h3 className="gt-h3" style={{ marginBottom: 20, borderBottom: '2px solid var(--gt-secondary)', paddingBottom: 8 }}>
          Itinerary Schedule
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {trip.stops?.map((stop, sIdx) => (
            <div key={stop.id} style={{ borderBottom: sIdx === trip.stops.length - 1 ? 'none' : '1px solid var(--gt-border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="var(--gt-primary)" />
                  Stop {sIdx + 1}: {stop.city_name}, {stop.city_country}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gt-text-muted)' }}>
                  {stop.arrival_date} → {stop.departure_date}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stop.activities?.map(act => (
                  <div
                    key={act.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--gt-surface)', borderRadius: 'var(--gt-radius-sm)', gap: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <img
                        src={act.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}
                        alt={act.activity_name}
                        style={{ width: 44, height: 44, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{act.activity_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gt-text-muted)' }}>
                          Day {act.day_index || 1} · {act.time_slot} · {act.duration_hours}h
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gt-secondary)', fontSize: 14 }}>
                      ₹{act.cost?.toLocaleString() || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
