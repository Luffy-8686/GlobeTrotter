import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import Builder from './pages/Builder';
import ItineraryView from './pages/ItineraryView';
import MyTrips from './pages/MyTrips';
import ExploreCities from './pages/ExploreCities';
import ExploreActivities from './pages/ExploreActivities';
import BudgetPage from './pages/BudgetPage';
import CalendarPage from './pages/CalendarPage';
import SharedTrip from './pages/SharedTrip';
import Profile from './pages/Profile';
import Community from './pages/Community';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 className="gt-h2">Something went wrong</h2>
          <p style={{ color: 'var(--gt-text-muted)', marginBottom: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="gt-btn gt-btn--primary"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(1);
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [shareToken, setShareToken] = useState('demo-europe-2026');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Check URL pathname on mount for direct deep-linking (e.g., /trip/shared/:token)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/trip/shared/')) {
      const token = path.replace('/trip/shared/', '');
      setShareToken(token);
      setActivePage('shared-trip');
    }
  }, []);

  // Fetch initial master data
  useEffect(() => {
    fetch('/api/cities').then(r => r.json()).then(setCities).catch(console.error);
    fetch('/api/activities').then(r => r.json()).then(setActivities).catch(console.error);
    fetch('/api/trips').then(r => r.json()).then(data => {
      setTrips(data);
      if (data.length > 0 && !selectedTripId) {
        setSelectedTripId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  // Refresh trips
  const refreshTrips = () => {
    fetch('/api/trips').then(r => r.json()).then(setTrips).catch(console.error);
  };

  // Handlers
  const handleCreateTrip = (tripData) => {
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData)
    })
      .then(r => r.json())
      .then(newTrip => {
        setTrips([newTrip, ...trips]);
        setSelectedTripId(newTrip.id);
        setActivePage('builder');
      })
      .catch(console.error);
  };

  const handleDeleteTrip = (tripId) => {
    fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
      .then(() => {
        setTrips(trips.filter(t => t.id !== tripId));
      })
      .catch(console.error);
  };

  const handleCloneTrip = (tripId) => {
    fetch(`/api/trips/${tripId}/clone`, { method: 'POST' })
      .then(r => r.json())
      .then(cloned => {
        setTrips([cloned, ...trips]);
        setSelectedTripId(cloned.id);
        setActivePage('builder');
      })
      .catch(console.error);
  };

  const handleAddStop = (tripId, stopData) => {
    fetch(`/api/trips/${tripId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stopData)
    })
      .then(r => r.json())
      .then(() => refreshTrips())
      .catch(console.error);
  };

  const handleDeleteStop = (stopId) => {
    fetch(`/api/stops/${stopId}`, { method: 'DELETE' })
      .then(() => refreshTrips())
      .catch(console.error);
  };

  const handleReorderStops = (tripId, stopIds) => {
    fetch('/api/stops/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId, stop_ids: stopIds })
    })
      .then(() => refreshTrips())
      .catch(console.error);
  };

  const handleAddActivity = (stopId, actData) => {
    fetch(`/api/stops/${stopId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actData)
    })
      .then(() => refreshTrips())
      .catch(console.error);
  };

  const handleRemoveActivity = (saId) => {
    fetch(`/api/stop-activities/${saId}`, { method: 'DELETE' })
      .then(() => refreshTrips())
      .catch(console.error);
  };

  const handleAddExpense = (tripId, expData) => {
    fetch(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expData)
    })
      .then(() => refreshTrips())
      .catch(console.error);
  };

  return (
    <div>
      {/* Top Navigation */}
      {activePage !== 'auth' && activePage !== 'shared-trip' && (
        <Navbar activePage={activePage} setActivePage={setActivePage} />
      )}

      {/* Main Pages Router */}
      <ErrorBoundary>
        <main className="gt-page-content">
          {activePage === 'dashboard' && (
            <Dashboard
              trips={trips}
              cities={cities}
              setActivePage={setActivePage}
              setSelectedTripId={setSelectedTripId}
            />
          )}

          {activePage === 'my-trips' && (
            <MyTrips
              trips={trips}
              setActivePage={setActivePage}
              setSelectedTripId={setSelectedTripId}
              onDeleteTrip={handleDeleteTrip}
            />
          )}

          {activePage === 'create-trip' && (
            <CreateTrip
              onCreateTrip={handleCreateTrip}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'builder' && (
            <Builder
              trip={selectedTrip}
              cities={cities}
              activities={activities}
              onAddStop={handleAddStop}
              onDeleteStop={handleDeleteStop}
              onReorderStops={handleReorderStops}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'itinerary-view' && (
            <ItineraryView
              trip={selectedTrip}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'explore-cities' && (
            <ExploreCities
              cities={cities}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'explore-activities' && (
            <ExploreActivities
              activities={activities}
              cities={cities}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'budget' && (
            <BudgetPage
              trip={selectedTrip}
              onAddExpense={handleAddExpense}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'calendar' && (
            <CalendarPage
              trips={trips}
              setActivePage={setActivePage}
              setSelectedTripId={setSelectedTripId}
            />
          )}

          {activePage === 'community' && (
            <Community
              trips={trips}
              onCloneTrip={handleCloneTrip}
              setActivePage={setActivePage}
              setSelectedTripId={setSelectedTripId}
            />
          )}

          {activePage === 'profile' && (
            <Profile setActivePage={setActivePage} />
          )}

          {activePage === 'admin' && (
            <AdminDashboard
              trips={trips}
              cities={cities}
              activities={activities}
            />
          )}

          {activePage === 'shared-trip' && (
            <SharedTrip
              token={shareToken}
              onCloneTrip={handleCloneTrip}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'auth' && (
            <Auth
              onLogin={() => { setIsAuthenticated(true); setActivePage('dashboard'); }}
              setActivePage={setActivePage}
            />
          )}
        </main>
      </ErrorBoundary>

      {/* Mobile Bottom Navigation */}
      {activePage !== 'auth' && activePage !== 'shared-trip' && (
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  );
}
