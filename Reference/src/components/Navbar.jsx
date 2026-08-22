import React, { useState } from 'react';
import { Compass, Search, Plus, User, Globe, MapPin, BarChart3, Calendar, Users } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onSearch }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      setActivePage('explore-cities');
    }
  };

  return (
    <nav className="gt-navbar">
      <div className="gt-navbar-inner">
        {/* Brand Logo */}
        <div className="gt-brand" onClick={() => setActivePage('dashboard')}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #FF5A5F, #00A699)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <Globe size={20} />
          </div>
          GlobeTrotter
        </div>

        {/* Global Search Bar */}
        <div className="gt-navbar-search" style={{ flex: 1, maxWidth: 360, margin: '0 24px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: 'var(--gt-surface)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-sm)', padding: '6px 12px', gap: 8 }}>
            <Search size={16} color="var(--gt-text-muted)" />
            <input
              type="text"
              placeholder="Search cities, activities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14, fontFamily: 'var(--gt-font-body)' }}
            />
          </form>
        </div>

        {/* Navigation Links */}
        <div className="gt-nav-links">
          <button className={`gt-nav-link ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            Home
          </button>
          <button className={`gt-nav-link ${activePage === 'my-trips' ? 'active' : ''}`} onClick={() => setActivePage('my-trips')}>
            My Trips
          </button>
          <button className={`gt-nav-link ${activePage === 'explore-cities' || activePage === 'explore-activities' ? 'active' : ''}`} onClick={() => setActivePage('explore-cities')}>
            Explore
          </button>
          <button className={`gt-nav-link ${activePage === 'calendar' ? 'active' : ''}`} onClick={() => setActivePage('calendar')}>
            Calendar
          </button>
          <button className={`gt-nav-link ${activePage === 'community' ? 'active' : ''}`} onClick={() => setActivePage('community')}>
            Community
          </button>
          <button className={`gt-nav-link ${activePage === 'admin' ? 'active' : ''}`} onClick={() => setActivePage('admin')}>
            Analytics
          </button>

          <button className="gt-btn gt-btn--primary gt-btn--sm" onClick={() => setActivePage('create-trip')} style={{ marginLeft: 8 }}>
            <Plus size={16} /> Plan a Trip
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setActivePage('profile')}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gt-secondary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', marginLeft: 8 }}
            title="User Profile"
          >
            AR
          </div>
        </div>
      </div>
    </nav>
  );
}
