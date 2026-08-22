import React from 'react';
import { Home, Luggage, Compass, Calendar, User } from 'lucide-react';

export default function BottomNav({ activePage, setActivePage }) {
  return (
    <nav className="gt-bottom-bar">
      <button className={`gt-bottom-bar-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
        <Home size={20} />
        Home
      </button>
      <button className={`gt-bottom-bar-item ${activePage === 'my-trips' ? 'active' : ''}`} onClick={() => setActivePage('my-trips')}>
        <Luggage size={20} />
        My Trips
      </button>
      <button className={`gt-bottom-bar-item ${activePage.startsWith('explore') ? 'active' : ''}`} onClick={() => setActivePage('explore-cities')}>
        <Compass size={20} />
        Explore
      </button>
      <button className={`gt-bottom-bar-item ${activePage === 'calendar' ? 'active' : ''}`} onClick={() => setActivePage('calendar')}>
        <Calendar size={20} />
        Calendar
      </button>
      <button className={`gt-bottom-bar-item ${activePage === 'profile' ? 'active' : ''}`} onClick={() => setActivePage('profile')}>
        <User size={20} />
        Profile
      </button>
    </nav>
  );
}
