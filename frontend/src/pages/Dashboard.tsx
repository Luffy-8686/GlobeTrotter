import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Map, Calendar, DollarSign, ArrowRight, PlaneTakeoff } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/trips');
        setTrips(res.data.slice(0, 3)); 
      } catch (error) {
        console.error("Failed to fetch trips", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex-1 min-w-0 flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
             <PlaneTakeoff className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}!
            </h2>
            <p className="mt-1 text-slate-500">Ready for your next adventure?</p>
          </div>
        </div>
        <div className="mt-6 flex md:mt-0 md:ml-4">
          <Link
            to="/create-trip"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:-translate-y-0.5"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: 'Total Trips', value: loading ? '-' : trips.length, icon: Map, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Upcoming Stops', value: loading ? '-' : trips.reduce((acc, trip) => acc + (trip._count?.stops || 0), 0), icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Planned Budget', value: loading ? '-' : '$2,450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' } // Still mocked budget summary for dashboard
        ].map((stat, idx) => (
          <div key={idx} className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">{stat.label}</dt>
                  <dd className="text-2xl font-bold text-slate-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trips Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Trips</h3>
          <Link to="/trips" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="pt-4 border-t border-slate-100 flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="block group">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {trip.cover_photo_url ? (
                      <img 
                        src={trip.cover_photo_url} 
                        alt={trip.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image' }} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Map className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 mb-1 truncate">{trip.name}</h4>
                    <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-semibold">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{trip._count?.stops || 0} stops</span>
                      <span className="text-indigo-600 group-hover:text-indigo-700 flex items-center">
                        Itinerary <ArrowRight className="ml-1 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 py-16 px-4">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Map className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">No trips planned yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">Get started by creating your very first trip and exploring exciting destinations.</p>
            <div className="mt-8">
              <Link
                to="/create-trip"
                className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Plan Trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
