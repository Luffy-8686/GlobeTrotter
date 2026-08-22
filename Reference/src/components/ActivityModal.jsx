import React, { useState, useEffect } from 'react';
import { X, Search, Clock, DollarSign, Tag } from 'lucide-react';

export default function ActivityModal({ isOpen, onClose, onAddActivity, stop, activities }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [dayIndex, setDayIndex] = useState(1);

  if (!isOpen || !stop) return null;

  // Filter activities for this stop's city
  const cityActivities = activities.filter(a => a.city_id === stop.city_id);

  const filtered = cityActivities.filter(a => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch = !search.trim() || a.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['all', 'sightseeing', 'culture', 'food', 'nature', 'adventure', 'nightlife', 'wellness'];

  const handleAdd = (act) => {
    onAddActivity(stop.id, {
      activity_id: act.id,
      time_slot: timeSlot,
      day_index: dayIndex
    });
  };

  return (
    <div className="gt-modal-backdrop" onClick={onClose}>
      <div className="gt-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 className="gt-h3" style={{ margin: 0 }}>Add Activities</h3>
            <div style={{ fontSize: 13, color: 'var(--gt-text-muted)' }}>for {stop.city_name}, {stop.city_country}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gt-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Day & Time Slot selection */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, background: 'var(--gt-surface)', padding: 12, borderRadius: 'var(--gt-radius-sm)' }}>
          <div style={{ flex: 1 }}>
            <label className="gt-label" style={{ fontSize: 11 }}>Assign Day</label>
            <select
              className="gt-select"
              value={dayIndex}
              onChange={e => setDayIndex(Number(e.target.value))}
              style={{ padding: '6px 10px', fontSize: 13 }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                <option key={d} value={d}>Day {d}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="gt-label" style={{ fontSize: 11 }}>Time Slot</label>
            <select
              className="gt-select"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 13 }}
            >
              <option value="morning">🌅 Morning (6 AM – 12 PM)</option>
              <option value="afternoon">☀️ Afternoon (12 PM – 5 PM)</option>
              <option value="evening">🌆 Evening (5 PM – 9 PM)</option>
              <option value="night">🌙 Night (9 PM – 12 AM)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--gt-radius-full)',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedCategory === cat ? 'var(--gt-primary)' : 'var(--gt-surface)',
                color: selectedCategory === cat ? '#FFF' : 'var(--gt-text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
          {filtered.map(act => {
            const isAdded = stop.activities?.some(a => a.activity_id === act.id);
            return (
              <div
                key={act.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-sm)', background: 'var(--gt-bg)', gap: 12 }}
              >
                <img
                  src={act.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}
                  alt={act.name}
                  style={{ width: 48, height: 48, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{act.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', display: 'flex', gap: 12 }}>
                    <span>⏱ {act.duration_hours}h</span>
                    <span>💰 ₹{act.estimated_cost?.toLocaleString()}</span>
                    <span style={{ textTransform: 'capitalize' }}>🏷 {act.category}</span>
                  </div>
                  {act.description && (
                    <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {act.description}
                    </div>
                  )}
                </div>

                <button
                  className="gt-btn gt-btn--primary gt-btn--sm"
                  onClick={() => handleAdd(act)}
                  style={{
                    background: isAdded ? 'var(--gt-surface)' : 'var(--gt-primary)',
                    color: isAdded ? 'var(--gt-text-muted)' : '#FFF',
                    border: isAdded ? '1px solid var(--gt-border)' : 'none',
                    padding: '6px 12px'
                  }}
                >
                  {isAdded ? '✓ Added Again' : '+ Add to Day'}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gt-text-muted)' }}>
              No activities found in this category.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} className="gt-btn gt-btn--secondary gt-btn--sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
