import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { Plus, Map, Calendar as CalendarIcon, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MyTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trips');
      setTrips(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/trips/${id}`);
      toast.success('Trip deleted');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const today = new Date();

  const ongoingTrips = trips.filter(trip => 
    isWithinInterval(today, { start: new Date(trip.start_date), end: new Date(trip.end_date) })
  );
  
  const upcomingTrips = trips.filter(trip => 
    isAfter(new Date(trip.start_date), today)
  );
  
  const completedTrips = trips.filter(trip => 
    isBefore(new Date(trip.end_date), today)
  );

  const TripGrid = ({ trips, emptyMessage }: { trips: any[], emptyMessage: string }) => {
    if (trips.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Link key={trip.id} to={`/trips/${trip.id}`} className="block group">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col relative">
              <button 
                onClick={(e) => handleDelete(e, trip.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 text-slate-400 hover:text-red-600 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {trip.cover_photo_url ? (
                  <img 
                    src={trip.cover_photo_url} 
                    alt={trip.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { 
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad1%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%234f46e5%3Bstop-opacity%3A1%22%20%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%230ea5e9%3Bstop-opacity%3A1%22%20%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22url(%23grad1)%22%20%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23ffffff%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%3ETrip%20Destinations%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <Map className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="text-xl font-bold text-slate-900 mb-1 truncate pr-8">{trip.name}</h4>
                <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-semibold">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">{trip._count?.stops || 0} stops</span>
                  <span className="text-indigo-600 group-hover:text-indigo-700 flex items-center">
                    View details <ArrowRight className="ml-1 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
          <p className="mt-2 text-sm text-slate-500">All your planned adventures in one place.</p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/calendar"
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all"
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
            Global Calendar
          </Link>
          <Link
            to="/create-trip"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Plan New Trip
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 py-20 px-4">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
             <Map className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No trips planned yet</h3>
          <p className="mt-2 text-slate-500 max-w-sm mx-auto">Get started by creating your very first trip and exploring exciting destinations around the globe.</p>
          <div className="mt-8">
            <Link
              to="/create-trip"
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Plan a New Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {ongoingTrips.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                Ongoing Trips
              </h2>
              <TripGrid trips={ongoingTrips} emptyMessage="" />
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Trips</h2>
            <TripGrid trips={upcomingTrips} emptyMessage="Nothing here yet." />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-slate-400">Completed Trips</h2>
            <div className="opacity-80 hover:opacity-100 transition-opacity">
              <TripGrid trips={completedTrips} emptyMessage="Nothing here yet." />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
