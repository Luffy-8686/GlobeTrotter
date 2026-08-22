import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

export default function CalendarPage({ trips, setActivePage, setSelectedTripId }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build calendar matrix
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ dayNumber: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const matchingTrips = trips.filter(t => {
      return t.start_date && t.end_date && dStr >= t.start_date && dStr <= t.end_date;
    });
    days.push({ dayNumber: i, dateStr: dStr, trips: matchingTrips });
  }

  return (
    <div className="gt-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>Trip Calendar &amp; Timeline 📅</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>
            Interactive timeline view of all your travel dates and schedules.
          </p>
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gt-surface)', padding: '6px 14px', borderRadius: 'var(--gt-radius-full)', border: '1px solid var(--gt-border)' }}>
          <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontFamily: 'var(--gt-font-heading)', fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-lg)', overflow: 'hidden', boxShadow: 'var(--gt-shadow-card)' }}>
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--gt-surface)', borderBottom: '1px solid var(--gt-border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '14px', textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--gt-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--gt-border)' }}>
          {days.map((d, index) => (
            <div
              key={index}
              style={{
                background: 'var(--gt-bg)',
                minHeight: 100,
                padding: 10,
                opacity: d.dayNumber ? 1 : 0.4
              }}
            >
              {d.dayNumber && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gt-text-muted)', marginBottom: 6 }}>
                    {d.dayNumber}
                  </div>
                  {d.trips && d.trips.map(t => (
                    <div
                      key={t.id}
                      onClick={() => { setSelectedTripId(t.id); setActivePage('itinerary-view'); }}
                      style={{
                        background: 'linear-gradient(135deg, var(--gt-primary), #FF8A80)',
                        color: '#FFF',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 4,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        boxShadow: '0 2px 4px rgba(255,90,95,0.2)'
                      }}
                      title={t.name}
                    >
                      ✈️ {t.name}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
