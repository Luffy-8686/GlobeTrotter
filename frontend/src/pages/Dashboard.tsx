import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Map, Calendar, DollarSign, ArrowRight, PlaneTakeoff, X, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortOption, setSortOption] = useState('popularity');

  // Template Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateStartDate, setTemplateStartDate] = useState('');

  const regions = [
    { name: 'Europe', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Asia', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=400&q=80' },
    { name: 'North America', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
    { name: 'South America', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=400&q=80' },
    { name: 'Oceania', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/trips'),
          axios.get('http://localhost:5000/api/cities')
        ]);
        setTrips(tripsRes.data.slice(0, 3)); 
        setAllCities(citiesRes.data);
        setCities(citiesRes.data);
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

  const filteredCities = cities
    .filter(c => regionFilter ? c.region === regionFilter || c.region.includes(regionFilter) : true)
    .filter(c => searchQuery ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    .sort((a, b) => {
      if (sortOption === 'popularity') return b.popularity_score - a.popularity_score;
      if (sortOption === 'cost-low') return a.cost_index - b.cost_index;
      if (sortOption === 'cost-high') return b.cost_index - a.cost_index;
      return 0;
    })
    .slice(0, 4);

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
            Where to next, {user?.first_name || user?.name?.split(' ')[0] || 'Explorer'}? ✈️
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
              to="/trips"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-lg text-sm font-bold text-white bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-md transition-all hover:scale-105"
            >
              View My Trips
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-48">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="block w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="cost-low">Sort by Cost (Low-High)</option>
              <option value="cost-high">Sort by Cost (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Regional Selections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Top Regional Selections</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => setRegionFilter(regionFilter === region.name ? '' : region.name)}
              className={`flex-none w-40 h-24 rounded-2xl relative overflow-hidden group border-2 transition-all ${regionFilter === region.name ? 'border-indigo-600 scale-105' : 'border-transparent'}`}
            >
              <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-all z-10"></div>
              <img src={region.image} alt={region.name} className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute inset-0 z-20 flex items-center justify-center text-white font-bold text-sm drop-shadow-md">
                {region.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Destinations Grid based on filters */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Destinations {regionFilter && `in ${regionFilter}`}</h2>
          <Link to="/create-trip" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : filteredCities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">No destinations found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCities.map((city) => (
              <div key={city.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs font-bold text-emerald-600">
                    {Array(city.cost_index).fill('₹').join('')}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900">{city.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{city.country}</p>
                  <Link
                    to="/create-trip"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    Plan Trip Here
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Trips Strip */}
      {trips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Recent Trips</h2>
            <Link to="/trips" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="flex-none w-72 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="relative h-32">
                  <img src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <h3 className="absolute bottom-3 left-4 text-lg font-bold text-white tracking-wide">{trip.name}</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center text-sm text-slate-500 mb-1">
                    <Calendar className="mr-1.5 h-4 w-4 text-slate-400" />
                    {format(new Date(trip.start_date), 'MMM d, yyyy')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
