import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Map, Calendar, Plus, Clock, ExternalLink, DollarSign, ArrowRight, Share2, Wallet, Trash2, MapPin, Edit2, X, Check, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import TripPDFDocument from '../components/TripPDFDocument';
import { getLocalCurrencyInfo, formatINR } from '../utils/currency';

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [stopDates, setStopDates] = useState({ start_date: '', end_date: '' });

  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [activityTime, setActivityTime] = useState({ date: '', time: '' });

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ 
    contentRef: printRef,
    documentTitle: `${trip?.name || 'Trip'}_Itinerary`
  });

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

  const handleDeleteStop = async (stopId: string) => {
    if (!window.confirm("Delete this destination? All planned activities within it will also be removed.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/trips/${id}/stops/${stopId}`);
      toast.success('Destination deleted');
      fetchTrip();
    } catch (error) {
      toast.error('Failed to delete destination');
    }
  };

  const handleUpdateStopDates = async (stopId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/trips/${id}/stops/${stopId}`, {
        start_date: new Date(stopDates.start_date).toISOString(),
        end_date: new Date(stopDates.end_date).toISOString(),
        section_type: (stopDates as any).section_type,
        section_budget: (stopDates as any).section_budget ? (stopDates as any).section_budget / 83.3 : undefined
      });
      toast.success('Dates updated');
      setEditingStop(null);
      fetchTrip();
    } catch (error) {
      toast.error('Failed to update dates');
    }
  };

  const handleUpdateActivityTime = async (stopId: string, tripActivityId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities/${tripActivityId}`, {
        scheduled_date: activityTime.date ? new Date(activityTime.date).toISOString() : null,
        scheduled_time: activityTime.time || null
      });
      toast.success('Activity time updated');
      setEditingActivity(null);
      fetchTrip();
    } catch (error) {
      toast.error('Failed to update activity time');
    }
  };

  const handleRemoveActivity = async (stopId: string, tripActivityId: string) => {
    if (!window.confirm("Remove this activity from your itinerary?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities/${tripActivityId}`);
      toast.success('Activity removed');
      fetchTrip();
    } catch (error) {
      toast.error('Failed to remove activity');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl mb-8" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-20 text-slate-500">Trip not found</div>;
  }

  return (
    <div className="pb-16">
      <div style={{ display: 'none' }}>
        <TripPDFDocument trip={trip} ref={printRef} />
      </div>

      {/* Hero Header */}
      <div className="relative bg-slate-900 h-64 sm:h-80">
        {trip.cover_photo_url && (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => { 
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221200%22%20height%3D%22400%22%20viewBox%3D%220%200%201200%20400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad1%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23334155%3Bstop-opacity%3A1%22%20%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%230f172a%3Bstop-opacity%3A1%22%20%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221200%22%20height%3D%22400%22%20fill%3D%22url(%23grad1)%22%20%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%3EDestination%20Cover%3C%2Ftext%3E%3C%2Fsvg%3E';
            }}
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
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => handlePrint()} className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors border border-white/10">
                <Download className="h-4 w-4 mr-2" /> PDF
              </button>
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
            Add another Section
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {trip.stops?.length === 0 ? (
            <div className="text-center py-12 relative z-10 bg-white border border-slate-200 shadow-sm rounded-2xl">
              <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No sections yet</h3>
              <p className="mt-2 text-sm text-slate-500">Start building your itinerary by adding your first section.</p>
            </div>
          ) : (
            trip.stops?.map((stop: any, index: number) => (
              <div key={stop.id} className="relative z-10 group/stop">
                
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
                    <div className="border-b border-slate-100 px-6 py-5 bg-slate-50 flex flex-col justify-between relative">
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/stop:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteStop(stop.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between pr-12">
                           <h3 className="text-xl font-bold text-slate-900 flex items-center">
                             <span className="md:hidden inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">{index + 1}</span>
                             {stop.city.name}, {stop.city.country}
                           </h3>
                           <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-700 rounded uppercase">{stop.section_type}</span>
                        </div>
                        
                        {editingStop === stop.id ? (
                          <div className="mt-3 flex flex-col gap-2 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                            <div className="flex flex-wrap gap-2 items-center">
                              <input 
                                type="date" 
                                value={stopDates.start_date}
                                onChange={e => setStopDates({...stopDates, start_date: e.target.value})}
                                className="text-xs border-slate-300 rounded focus:ring-indigo-500 py-1"
                              />
                              <span className="text-slate-400 text-xs">to</span>
                              <input 
                                type="date" 
                                value={stopDates.end_date}
                                min={stopDates.start_date}
                                onChange={e => setStopDates({...stopDates, end_date: e.target.value})}
                                className="text-xs border-slate-300 rounded focus:ring-indigo-500 py-1"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <select 
                                value={(stopDates as any).section_type || stop.section_type}
                                onChange={e => setStopDates({...stopDates, section_type: e.target.value} as any)}
                                className="text-xs border-slate-300 rounded focus:ring-indigo-500 py-1"
                              >
                                <option value="TRAVEL">Travel</option>
                                <option value="STAY">Stay</option>
                                <option value="ACTIVITY">Activity</option>
                                <option value="OTHER">Other</option>
                              </select>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                                  ₹
                                </div>
                                <input 
                                  type="number" 
                                  placeholder="Budget"
                                  value={(stopDates as any).section_budget !== undefined 
                                          ? (stopDates as any).section_budget 
                                          : (stop.section_budget ? Math.round(stop.section_budget * 83.3) : '')}
                                  onChange={e => setStopDates({...stopDates, section_budget: parseFloat(e.target.value)} as any)}
                                  className="text-xs pl-6 border-slate-300 rounded focus:ring-indigo-500 py-1 w-24"
                                />
                              </div>
                            </div>
                            <div className="flex gap-1 ml-auto mt-2">
                              <button onClick={() => handleUpdateStopDates(stop.id)} className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700">Save</button>
                              <button onClick={() => setEditingStop(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col mt-1 group/date cursor-pointer" onClick={() => {
                            setEditingStop(stop.id);
                            setStopDates({
                              start_date: new Date(stop.start_date).toISOString().split('T')[0],
                              end_date: new Date(stop.end_date).toISOString().split('T')[0],
                              section_type: stop.section_type,
                              section_budget: stop.section_budget
                            } as any);
                          }}>
                            <div className="flex items-center text-sm font-medium text-slate-500 group-hover/date:text-indigo-600 transition-colors">
                              {format(new Date(stop.start_date), 'MMM d')} - {format(new Date(stop.end_date), 'MMM d, yyyy')}
                              <Edit2 className="h-3 w-3 ml-2 text-slate-300 group-hover/date:text-indigo-400" />
                            </div>
                            {stop.section_budget != null && (
                              <div className="text-xs font-semibold text-emerald-600 mt-1 flex flex-col gap-0.5">
                                <span>Budget: {formatINR(stop.section_budget)}</span>
                                <span className="text-[10px] text-slate-500">{getLocalCurrencyInfo(stop.section_budget, stop.city.country).split(' ')[1]}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Link to={`/trips/${id}/stops/${stop.id}/activities`} className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                          <Plus className="h-4 w-4 mr-1" /> Add Activity
                        </Link>
                      </div>
                    </div>
                    
                    {/* Activities List */}
                    <div className="p-6">
                      {stop.activities.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No activities planned yet.</p>
                      ) : (
                        <ul className="space-y-4">
                          {stop.activities.map((tripActivity: any) => (
                            <li key={tripActivity.id} className="flex gap-4 group/item">
                                <img className="h-14 w-14 rounded-xl object-cover bg-slate-100 shadow-sm" src={tripActivity.activity.image_url} alt="" onError={(e) => { 
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23f1f5f9%22%20%2F%3E%3Cpath%20d%3D%22M30%2070L70%2030M30%2030L70%2070%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E';
                                }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 truncate pr-2">
                                      <h4 className="text-sm font-bold text-slate-900 truncate">{tripActivity.activity.name}</h4>
                                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex flex-col items-center">
                                        <span>{formatINR(tripActivity.cost_override ?? tripActivity.activity.cost)}</span>
                                      </span>
                                    </div>
                                  <button onClick={() => handleRemoveActivity(stop.id, tripActivity.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" title="Remove activity">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                {editingActivity === tripActivity.id ? (
                                  <div className="mt-2 flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                    <input 
                                      type="date" 
                                      value={activityTime.date}
                                      min={new Date(stop.start_date).toISOString().split('T')[0]}
                                      max={new Date(stop.end_date).toISOString().split('T')[0]}
                                      onChange={e => setActivityTime({...activityTime, date: e.target.value})}
                                      className="text-xs border-slate-300 rounded focus:ring-indigo-500 py-1 w-28"
                                    />
                                    <input 
                                      type="time" 
                                      value={activityTime.time}
                                      onChange={e => setActivityTime({...activityTime, time: e.target.value})}
                                      className="text-xs border-slate-300 rounded focus:ring-indigo-500 py-1 w-24"
                                    />
                                    <div className="flex gap-1 ml-auto">
                                      <button onClick={() => handleUpdateActivityTime(stop.id, tripActivity.id)} className="p-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"><Check className="h-3 w-3" /></button>
                                      <button onClick={() => setEditingActivity(null)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X className="h-3 w-3" /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-center gap-2 mt-1 group/actdate cursor-pointer"
                                    onClick={() => {
                                      setEditingActivity(tripActivity.id);
                                      setActivityTime({
                                        date: tripActivity.scheduled_date ? new Date(tripActivity.scheduled_date).toISOString().split('T')[0] : '',
                                        time: tripActivity.scheduled_time || ''
                                      });
                                    }}
                                  >
                                    {(tripActivity.scheduled_date || tripActivity.scheduled_time) ? (
                                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center hover:bg-indigo-100 transition-colors">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {tripActivity.scheduled_date && format(new Date(tripActivity.scheduled_date), 'MMM d')}
                                        {tripActivity.scheduled_date && tripActivity.scheduled_time && ', '}
                                        {tripActivity.scheduled_time}
                                        <Edit2 className="h-2.5 w-2.5 ml-1.5 opacity-0 group-hover/actdate:opacity-100" />
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-medium hover:text-indigo-500 flex items-center">
                                        + Add Date/Time
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                    {tripActivity.activity.category}
                                  </span>
                                  <span className="text-xs font-medium text-slate-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> {tripActivity.activity.duration_minutes}m
                                  </span>
                                </div>
                                {tripActivity.activity.cost > 0 && (
                                  <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                                    <span>{formatINR(tripActivity.activity.cost)}</span>
                                    <span className="text-[10px] text-slate-500 font-normal">({getLocalCurrencyInfo(tripActivity.activity.cost, stop.city.country).split(' ')[1]})</span>
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
