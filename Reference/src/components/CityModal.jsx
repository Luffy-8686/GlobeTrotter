import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, DollarSign } from 'lucide-react';

export default function CityModal({ isOpen, onClose, onSelectCity, cities }) {
  const [search, setSearch] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    if (cities) {
      if (!search.trim()) {
        setFilteredCities(cities);
      } else {
        const q = search.toLowerCase();
        setFilteredCities(cities.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)));
      }
    }
  }, [search, cities]);

  if (!isOpen) return null;

  return (
    <div className="gt-modal-backdrop" onClick={onClose}>
      <div className="gt-modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="gt-h3" style={{ margin: 0 }}>Add Destination City</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gt-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--gt-surface)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-sm)', padding: '8px 12px', gap: 8, marginBottom: 16 }}>
          <Search size={18} color="var(--gt-text-muted)" />
          <input
            type="text"
            placeholder="Search by city or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
          />
        </div>

        {/* City list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {filteredCities.map(city => (
            <div
              key={city.id}
              onClick={() => { onSelectCity(city); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--gt-surface)', borderRadius: 'var(--gt-radius-sm)', cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gt-surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gt-surface)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={city.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}
                  alt={city.name}
                  style={{ width: 44, height: 44, borderRadius: 'var(--gt-radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{city.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gt-text-muted)' }}>{city.country} · {city.region}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--gt-warning)', fontWeight: 700 }}>
                  {'$'.repeat(city.cost_index || 1)}
                </span>
                <button className="gt-btn gt-btn--primary gt-btn--sm" style={{ padding: '4px 10px', fontSize: 12 }}>
                  + Select
                </button>
              </div>
            </div>
          ))}
          {filteredCities.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gt-text-muted)' }}>
              No cities found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
