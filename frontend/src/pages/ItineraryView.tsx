import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Map, Calendar, Plus, Clock, ExternalLink, DollarSign, ArrowRight, Share2, Wallet, Trash2, MapPin } from 'lucide-react';

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trips/${id}`);
      setTrip(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-4">
           <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
           <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!trip) return <div className="text-center py-20 text-red-500 font-medium">Trip not found</div>;

  return (
    <div className="pb-16">
      {/* Hero Header */}
      <div className="relative bg-slate-900 h-64 sm:h-80">
        {trip.cover_photo_url && (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x400?text=Cover' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white sm:text-5xl tracking-tight">{trip.name}</h1>
              <p className="mt-2 text-lg text-slate-300 font-medium flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/trips/${id}/calendar`} className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors border border-white/10">
                <Calendar className="h-4 w-4 mr-2" /> Calendar
              </Link>
              <Link to={`/trips/${id}/budget`} className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors border border-white/10">
                <Wallet className="h-4 w-4 mr-2" /> Budget
              </Link>
              <Link to={`/shared/${trip.share_slug}`} target="_blank" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trip Itinerary</h2>
          <Link
            to={`/trips/${id}/cities`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Destination
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {trip.stops?.length === 0 ? (
            <div className="text-center py-12 relative z-10 bg-white border border-slate-200 shadow-sm rounded-2xl">
              <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No destinations yet</h3>
              <p className="mt-2 text-sm text-slate-500">Start building your itinerary by adding your first stop.</p>
            </div>
          ) : (
            trip.stops?.map((stop: any, index: number) => (
              <div key={stop.id} className="relative z-10 group">
                
                {/* Timeline Marker */}
                <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-4 w-10 h-10 rounded-full bg-indigo-100 border-4 border-white shadow-sm text-indigo-600 font-bold z-20">
                  {index + 1}
                </div>

                <div className="md:grid md:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Side (Empty on even, card on odd) */}
                  <div className={`hidden md:block ${index % 2 === 0 ? 'text-right pr-12' : 'col-start-2 pl-12'}`}>
                    {/* Decorative placeholder to force grid layout */}
                  </div>

                  {/* Actual Card (Left on odd, Right on even) */}
                  <div className={`ml-10 md:ml-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${index % 2 === 0 ? 'md:col-start-1 md:mr-12' : 'md:col-start-2 md:ml-12'}`}>
                    
                    {/* Stop Header */}
                    <div className="border-b border-slate-100 px-6 py-5 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <span className="md:hidden inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">{index + 1}</span>
                          {stop.city.name}, {stop.city.country}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          {format(new Date(stop.start_date), 'MMM d')} - {format(new Date(stop.end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Link to={`/trips/${id}/stops/${stop.id}/activities`} className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                        <Plus className="h-5 w-5" />
                      </Link>
                    </div>
                    
                    {/* Activities List */}
                    <div className="p-6">
                      {stop.activities.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No activities planned yet.</p>
                      ) : (
                        <ul className="space-y-4">
                          {stop.activities.map((tripActivity: any) => (
                            <li key={tripActivity.id} className="flex gap-4">
                              <img className="h-14 w-14 rounded-xl object-cover bg-slate-100 shadow-sm" src={tripActivity.activity.image_url} alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=N/A' }} />
                              <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">{tripActivity.activity.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                    {tripActivity.activity.category}
                                  </span>
                                  <span className="text-xs font-medium text-slate-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> {tripActivity.activity.duration_minutes}m
                                  </span>
                                </div>
                                {tripActivity.activity.cost > 0 && (
                                  <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center">
                                    <DollarSign className="h-3 w-3" /> {tripActivity.activity.cost}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
