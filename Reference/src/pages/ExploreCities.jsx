import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Star, Tag } from 'lucide-react';

export default function ExploreCities({ cities, setActivePage }) {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { id: 'all', label: 'All Regions' },
    { id: 'asia', label: 'Asia' },
    { id: 'europe', label: 'Europe' },
    { id: 'north_america', label: 'North America' },
    { id: 'south_america', label: 'South America' },
    { id: 'africa', label: 'Africa' },
    { id: 'middle_east', label: 'Middle East' },
    { id: 'oceania', label: 'Oceania' }
  ];

  const filteredCities = cities.filter(c => {
    const matchesRegion = selectedRegion === 'all' || c.region === selectedRegion;
    const matchesSearch = !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="gt-container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>Explore World Destinations 🌍</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Discover top travel cities, cost index indicators, and popularity ratings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="gt-btn gt-btn--primary gt-btn--sm">Cities</button>
          <button className="gt-btn gt-btn--ghost gt-btn--sm" onClick={() => setActivePage('explore-activities')}>
            Activities
          </button>
        </div>
      </div>

      {/* Search & Region Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 260, display: 'flex', alignItems: 'center', background: 'var(--gt-surface)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-sm)', padding: '10px 14px', gap: 10 }}>
          <Search size={18} color="var(--gt-text-muted)" />
          <input
            type="text"
            placeholder="Search by city or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {regions.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--gt-radius-full)',
                border: selectedRegion === r.id ? '1px solid var(--gt-primary)' : '1px solid var(--gt-border)',
                background: selectedRegion === r.id ? 'var(--gt-primary)' : 'var(--gt-bg)',
                color: selectedRegion === r.id ? '#FFF' : 'var(--gt-text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {filteredCities.map(city => (
          <div key={city.id} className="gt-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
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
                  background: 'rgba(0,0,0,0.65)',
                  color: '#FFB020',
                  padding: '4px 10px',
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 800,
                  backdropFilter: 'blur(4px)'
                }}
              >
                {'$'.repeat(city.cost_index || 1)}
              </span>
            </div>

            <div className="gt-card-body" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h3 className="gt-card-title" style={{ fontSize: 20, margin: 0 }}>{city.name}</h3>
                <span className="gt-chip" style={{ fontSize: 11, padding: '2px 8px' }}>
                  ★ {city.popularity_score}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 10 }}>
                {city.country} · {city.region?.toUpperCase()}
              </div>

              <p style={{ fontSize: 13, color: 'var(--gt-text-muted)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {city.description}
              </p>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gt-border)' }}>
              <button
                className="gt-btn gt-btn--secondary gt-btn--sm"
                style={{ width: '100%' }}
                onClick={() => setActivePage('create-trip')}
              >
                + Plan Trip to {city.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
