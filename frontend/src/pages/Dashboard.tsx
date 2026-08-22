import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Map, Calendar, DollarSign, ArrowRight, PlaneTakeoff, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Template Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateStartDate, setTemplateStartDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/trips'),
          axios.get('http://localhost:5000/api/cities')
        ]);
        setTrips(tripsRes.data.slice(0, 3)); 
        setAllCities(citiesRes.data);
        setCities(citiesRes.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateFromTemplate = async () => {
    if (!templateStartDate) return toast.error("Please select a start date");
    setLoading(true);
    try {
      const endDate = new Date(templateStartDate);
      endDate.setDate(endDate.getDate() + selectedTemplate.days);
      
      const tripRes = await axios.post('http://localhost:5000/api/trips', {
        name: selectedTemplate.name,
        description: `Community Template: ${selectedTemplate.name}`,
        start_date: new Date(templateStartDate).toISOString(),
        end_date: endDate.toISOString(),
        cover_photo_url: selectedTemplate.image
      });
      const tripId = tripRes.data.id;
      
      const daysPerStop = Math.floor(selectedTemplate.days / selectedTemplate.stops.length) || 1;
      let currentStartDate = new Date(templateStartDate);
      
      for (const stopName of selectedTemplate.stops) {
         const city = allCities.find(c => c.name === stopName);
         if (city) {
            const stopEnd = new Date(currentStartDate);
            stopEnd.setDate(stopEnd.getDate() + daysPerStop);
            
            await axios.post(`http://localhost:5000/api/trips/${tripId}/stops`, {
              city_id: city.id,
              start_date: currentStartDate.toISOString(),
              end_date: stopEnd.toISOString()
            });
            
            currentStartDate = stopEnd;
         }
      }
      
      toast.success("Trip created successfully from template!");
      navigate(`/trips/${tripId}`);
    } catch (error) {
       console.error(error);
       toast.error("Failed to generate template");
       setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Template Setup Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Start your adventure</h3>
                  <p className="text-slate-500 text-sm mt-1">When are you starting <strong>{selectedTemplate.name}</strong>?</p>
                </div>
                <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Start Date</label>
                <input 
                  type="date" 
                  value={templateStartDate} 
                  onChange={e => setTemplateStartDate(e.target.value)} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4 text-slate-700 font-medium"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button 
                onClick={handleCreateFromTemplate} 
                disabled={!templateStartDate || loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Itinerary...' : 'Create Trip & View Itinerary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 40%, #0ea5e9 100%)' }}>
        <div className="relative z-10 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/30 shadow-sm">
             <PlaneTakeoff className="h-4 w-4" /> AI-Powered Itinerary Planner
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            Where to next, {user?.name?.split(' ')[0] || 'Explorer'}? ✈️
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl">
            Design multi-city itineraries end-to-end, discover curated activities, track budgets, and share your adventures seamlessly.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/create-trip"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-lg text-sm font-bold text-rose-500 bg-white hover:bg-slate-50 transition-all hover:scale-105"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Plan a New Trip
            </Link>
            <Link
              to="/trips/new/cities" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all"
            >
              <Map className="-ml-1 mr-2 h-5 w-5" />
              Explore Destinations
            </Link>
          </div>
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

      {/* Top Destinations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">🌏 Top Destinations</h3>
            <p className="text-sm text-slate-500 mt-1">Handpicked global cities for your next trip</p>
          </div>
          <Link to="/trips/new/cities" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
            Explore all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
              <div className="h-40 relative overflow-hidden bg-slate-100">
                {city.image_url ? (
                  <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image' }} />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                  {'$'.repeat(city.cost_index || 1)}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-slate-900">{city.name}</h4>
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold">★ {city.popularity_score}</span>
                </div>
                <p className="text-sm text-slate-500">{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Pre-Planned Itineraries */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">🔥 Popular Itinerary Templates</h3>
            <p className="text-sm text-slate-500 mt-1">Pre-planned trips loved by the community</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 't1',
              name: '7 Days in Italy: The Golden Triangle',
              days: 7,
              stops: ['Rome', 'Florence', 'Venice'],
              image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
              budget: '$$$'
            },
            {
              id: 't2',
              name: 'Classic Japan Highlights',
              days: 10,
              stops: ['Tokyo', 'Kyoto', 'Osaka'],
              image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
              budget: '$$$$'
            },
            {
              id: 't3',
              name: 'European Backpacking Route',
              days: 14,
              stops: ['Paris', 'Amsterdam', 'Prague', 'Berlin'],
              image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
              budget: '$$'
            },
            {
              id: 't4',
              name: 'Best of Southeast Asia',
              days: 12,
              stops: ['Bangkok', 'Singapore', 'Bali'],
              image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
              budget: '$$'
            },
            {
              id: 't5',
              name: 'USA Coast to Coast',
              days: 14,
              stops: ['New York City', 'Chicago', 'Los Angeles'],
              image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
              budget: '$$$$'
            },
            {
              id: 't6',
              name: 'South African Explorer',
              days: 10,
              stops: ['Cape Town', 'Kruger', 'Johannesburg'],
              image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80',
              budget: '$$$'
            }
          ].map((template) => (
            <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="h-48 relative overflow-hidden bg-slate-900">
                <img src={template.image} alt={template.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" /> {template.days} Days
                </div>
              </div>
              <div className="p-5">
                <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{template.name}</h4>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.stops.map((stop, i) => (
                    <span key={i} className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {stop}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Budget: <span className="text-emerald-600">{template.budget}</span></span>
                  <button onClick={() => setSelectedTemplate(template)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Use Template &rarr;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
