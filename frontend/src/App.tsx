import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts / Components
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import TripBudget from './pages/TripBudget';
import TripCalendar from './pages/TripCalendar';
import SharedItinerary from './pages/SharedItinerary';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import CommunityTab from './pages/CommunityTab';
import MyTripsCalendar from './pages/MyTripsCalendar';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="min-h-screen bg-gray-50 pb-10">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/shared/:slug" element={<SharedItinerary />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><MyTripsCalendar /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityTab /></ProtectedRoute>} />
          <Route path="/trips/:id/build" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
          <Route path="/trips/:id/cities" element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
          <Route path="/trips/:id/stops/:stopId/activities" element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
          <Route path="/trips/:id/budget" element={<ProtectedRoute><TripBudget /></ProtectedRoute>} />
          <Route path="/trips/:id/calendar" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
