import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Calendar, Clock, ArrowUp, ArrowDown, Share2, BarChart2, Eye, DollarSign } from 'lucide-react';
import CityModal from '../components/CityModal';
import ActivityModal from '../components/ActivityModal';

export default function Builder({ trip, cities, activities, onAddStop, onDeleteStop, onReorderStops, onAddActivity, onRemoveActivity, setActivePage }) {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [activeActivityModalStop, setActiveActivityModalStop] = useState(null);

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

  const handleMoveStop = (index, direction) => {
    const newStops = [...trip.stops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    onReorderStops(trip.id, newStops.map(s => s.id));
  };

  return (
    <div className="gt-container">
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="gt-chip gt-chip--primary">{trip.state?.toUpperCase()}</span>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)' }}>📅 {trip.start_date} → {trip.end_date}</span>
          </div>
          <h1 className="gt-h1" style={{ margin: 0 }}>{trip.name}</h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 14 }}>
            <span>📍 <strong>{trip.stops?.length || 0}</strong> Destinations</span>
            <span>💰 Total Budget: <strong style={{ color: 'var(--gt-secondary)' }}>₹{trip.total_budget?.toLocaleString()}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('itinerary-view')}>
            <Eye size={16} /> View Itinerary
          </button>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('budget')}>
            <BarChart2 size={16} /> Budget Breakdown
          </button>
          <button
            className="gt-btn gt-btn--secondary gt-btn--sm"
            onClick={() => {
              const shareUrl = `${window.location.origin}/trip/shared/${trip.share_token}`;
              navigator.clipboard.writeText(shareUrl);
              alert(`Public share link copied to clipboard!\n${shareUrl}`);
            }}
          >
            <Share2 size={16} /> Share Link
          </button>
        </div>
      </div>

      {/* Stops Timeline Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {trip.stops?.map((stop, index) => (
          <div
            key={stop.id}
            style={{
              background: 'var(--gt-bg)',
              border: '1px solid var(--gt-border)',
              borderRadius: 'var(--gt-radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--gt-shadow-card)'
            }}
          >
            {/* Stop Header */}
            <div
              style={{
                background: 'var(--gt-surface)',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--gt-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    onClick={() => handleMoveStop(index, -1)}
                    disabled={index === 0}
                    style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.2 : 0.7 }}
                    title="Move stop up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveStop(index, 1)}
                    disabled={index === trip.stops.length - 1}
                    style={{ background: 'none', border: 'none', cursor: index === trip.stops.length - 1 ? 'default' : 'pointer', opacity: index === trip.stops.length - 1 ? 0.2 : 0.7 }}
                    title="Move stop down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {(() => {
                    const matchedCity = cities.find(c => c.id === stop.city_id);
                    return matchedCity ? (
                      <img
                        src={matchedCity.image_url}
                        alt={stop.city_name}
                        style={{ width: 44, height: 44, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover' }}
                      />
                    ) : null;
                  })()}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} color="var(--gt-primary)" />
                      Stop {index + 1}: {stop.city_name}, {stop.city_country}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', marginTop: 2 }}>
                      📅 {stop.arrival_date} → {stop.departure_date} · {stop.duration_days || 3} days
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--gt-secondary)', fontSize: 16 }}>
                    ₹{stop.stop_budget?.toLocaleString() || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gt-text-muted)' }}>
                    {stop.activities?.length || 0} activities
                  </div>
                </div>

                <button
                  onClick={() => onDeleteStop(stop.id)}
                  className="gt-btn gt-btn--ghost gt-btn--sm"
                  style={{ color: 'var(--gt-error)', padding: '6px 8px' }}
                  title="Remove Stop"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Stop Activities List */}
            <div style={{ padding: '16px 20px' }}>
              {stop.activities && stop.activities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stop.activities.map(act => {
                    const matchedAct = activities.find(a => a.id === act.activity_id);
                    const actImg = matchedAct?.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80';
                    return (
                      <div
                        key={act.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'var(--gt-surface)',
                          borderRadius: 'var(--gt-radius-sm)',
                          border: '1px solid var(--gt-border)',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                          <img
                            src={actImg}
                            alt={act.activity_name}
                            style={{ width: 44, height: 44, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span className="gt-chip" style={{ fontSize: 11, padding: '1px 6px' }}>
                                Day {act.day_index || 1}
                              </span>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{act.activity_name}</div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', display: 'flex', gap: 10 }}>
                              <span style={{ textTransform: 'capitalize' }}>⏰ {act.time_slot}</span>
                              <span>⏱ {act.duration_hours}h</span>
                              <span style={{ textTransform: 'capitalize' }}>🏷 {act.category}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontWeight: 700, color: 'var(--gt-secondary)', fontSize: 15 }}>
                            ₹{act.cost?.toLocaleString() || 0}
                          </span>
                          <button
                            onClick={() => onRemoveActivity(act.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--gt-error)', cursor: 'pointer' }}
                            title="Remove activity"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--gt-text-muted)', fontSize: 14 }}>
                  No activities added to this stop yet. Click below to add exciting tours, sights, and dining.
                </div>
              )}

              {/* Add Activity Button */}
              <div style={{ marginTop: 14 }}>
                <button
                  className="gt-btn gt-btn--secondary gt-btn--sm"
                  onClick={() => setActiveActivityModalStop(stop)}
                >
                  <Plus size={15} /> Add Activity to {stop.city_name}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Section / Stop Button */}
        <button
          onClick={() => setIsCityModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '24px',
            borderRadius: 'var(--gt-radius-md)',
            border: '2px dashed var(--gt-secondary)',
            background: 'var(--gt-secondary-light)',
            color: 'var(--gt-secondary)',
            fontFamily: 'var(--gt-font-heading)',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 180ms ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,166,153,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--gt-secondary-light)'}
        >
          <Plus size={20} /> Add Another City Destination Stop
        </button>
      </div>

      {/* Modals */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        cities={cities}
        onSelectCity={(city) => onAddStop(trip.id, { city_id: city.id })}
      />

      <ActivityModal
        isOpen={!!activeActivityModalStop}
        onClose={() => setActiveActivityModalStop(null)}
        stop={activeActivityModalStop}
        activities={activities}
        onAddActivity={(stopId, data) => onAddActivity(stopId, data)}
      />
    </div>
  );
}
