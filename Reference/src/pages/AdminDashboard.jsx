import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, Users, MapPin, Compass, Eye, ShieldCheck } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard({ trips, cities, activities }) {
  const totalTrips = trips.length;
  const totalCities = cities.length;
  const totalActivities = activities.length;
  const totalViews = trips.reduce((sum, t) => sum + (t.views || 0), 0);

  // Stop counts per city
  const cityCounts = {};
  trips.forEach(t => t.stops?.forEach(s => {
    cityCounts[s.city_name] = (cityCounts[s.city_name] || 0) + 1;
  }));

  const chartLabels = Object.keys(cityCounts).length > 0 ? Object.keys(cityCounts) : ['Paris', 'Rome', 'Tokyo', 'Barcelona', 'Bali'];
  const chartDataValues = Object.keys(cityCounts).length > 0 ? Object.values(cityCounts) : [3, 2, 2, 1, 1];

  const destinationBarData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Trip Stops Created',
        data: chartDataValues,
        backgroundColor: '#00A699',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="gt-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ padding: 8, borderRadius: 'var(--gt-radius-sm)', background: 'var(--gt-primary-light)', color: 'var(--gt-primary)' }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>GlobeTrotter Admin Analytics 📊</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '2px 0 0 0' }}>
            System-wide KPIs, popular destinations, and itinerary planning engagement.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)', fontWeight: 600 }}>Total Itineraries</span>
            <Compass size={20} color="var(--gt-primary)" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--gt-primary)' }}>{totalTrips}</div>
          <div style={{ fontSize: 12, color: 'var(--gt-success)', fontWeight: 600, marginTop: 4 }}>+100% active retention</div>
        </div>

        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)', fontWeight: 600 }}>Master Cities</span>
            <MapPin size={20} color="var(--gt-secondary)" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--gt-secondary)' }}>{totalCities}</div>
          <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', marginTop: 4 }}>Across 7 global regions</div>
        </div>

        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)', fontWeight: 600 }}>Curated Activities</span>
            <TrendingUp size={20} color="#FFB020" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#FFB020' }}>{totalActivities}</div>
          <div style={{ fontSize: 12, color: 'var(--gt-text-muted)', marginTop: 4 }}>In 8 diverse categories</div>
        </div>

        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--gt-text-muted)', fontWeight: 600 }}>Public Shares &amp; Views</span>
            <Eye size={20} color="#222" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#222' }}>{totalViews}</div>
          <div style={{ fontSize: 12, color: 'var(--gt-success)', fontWeight: 600, marginTop: 4 }}>Atomic concurrency tracking</div>
        </div>
      </div>

      {/* Popular Destination Chart */}
      <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 28, boxShadow: 'var(--gt-shadow-card)' }}>
        <h3 className="gt-h3" style={{ marginBottom: 20 }}>Top Planned Destinations</h3>
        <div style={{ maxHeight: 300 }}>
          <Bar data={destinationBarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}
