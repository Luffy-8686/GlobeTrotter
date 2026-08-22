import React, { useState } from 'react';
import { Search, Clock, DollarSign, Tag, ArrowLeft } from 'lucide-react';

export default function ExploreActivities({ activities, cities, setActivePage }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('all');

  const categories = ['all', 'sightseeing', 'culture', 'food', 'nature', 'adventure', 'nightlife', 'wellness'];

  const filtered = activities.filter(a => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesCity = selectedCityId === 'all' || a.city_id === Number(selectedCityId);
    const matchesSearch = !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()) || a.city_name?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesCity && matchesSearch;
  });

  return (
    <div className="gt-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>Explore Curated Activities 🎯</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Find unique tours, cultural sights, culinary experiences, and outdoor adventures.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('explore-cities')}>
            Cities
          </button>
          <button className="gt-btn gt-btn--primary gt-btn--sm">Activities</button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 240, display: 'flex', alignItems: 'center', background: 'var(--gt-surface)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-sm)', padding: '10px 14px', gap: 10 }}>
          <Search size={18} color="var(--gt-text-muted)" />
          <input
            type="text"
            placeholder="Search activities or experiences..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
          />
        </div>

        <select
          className="gt-select"
          value={selectedCityId}
          onChange={e => setSelectedCityId(e.target.value)}
          style={{ flex: 1, minWidth: 160 }}
        >
          <option value="all">All Cities</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--gt-radius-full)',
              border: selectedCategory === cat ? '1px solid var(--gt-primary)' : '1px solid var(--gt-border)',
              background: selectedCategory === cat ? 'var(--gt-primary)' : 'var(--gt-bg)',
              color: selectedCategory === cat ? '#FFF' : 'var(--gt-text)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filtered.map(act => (
          <div key={act.id} className="gt-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
              <img
                src={act.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
                alt={act.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="gt-chip"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(255, 255, 255, 0.95)',
                  fontSize: 11,
                  textTransform: 'capitalize',
                  fontWeight: 700
                }}
              >
                🏷 {act.category}
              </span>
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#FFF',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)'
                }}
              >
                ₹{act.estimated_cost?.toLocaleString()}
              </span>
            </div>

            <div className="gt-card-body" style={{ flex: 1 }}>
              <h3 className="gt-card-title" style={{ fontSize: 17, marginBottom: 4 }}>{act.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 8 }}>
                📍 {act.city_name} · ⏱ {act.duration_hours} hours
              </div>

              {act.description && (
                <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {act.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
