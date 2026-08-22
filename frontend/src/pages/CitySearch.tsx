import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CitySearch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCities = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/cities?search=${searchTerm}`);
        if (active) setCities(res.data);
      } catch (error) {
        if (active) toast.error('Failed to fetch destinations');
      } finally {
        if (active) setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchCities();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const handleAddStop = async (cityId: string) => {
    try {
      // First, get the trip to know its dates
      const tripRes = await axios.get(`http://localhost:5000/api/trips/${id}`);
      const trip = tripRes.data;
      
      let start_date = new Date(trip.start_date);
      let end_date = new Date(trip.end_date);
      
      // If there are existing stops, start the new stop where the last one ended
      if (trip.stops && trip.stops.length > 0) {
        const lastStop = trip.stops[trip.stops.length - 1];
        start_date = new Date(lastStop.end_date);
        end_date = new Date(lastStop.end_date);
        end_date.setDate(end_date.getDate() + 2); // Default 2 nights
      } else {
        // If it's the first stop, make it span the whole trip initially
      }

      await axios.post(`http://localhost:5000/api/trips/${id}/stops`, {
        city_id: cityId,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        order_index: trip.stops ? trip.stops.length : 0
      });
      toast.success('Destination added to your itinerary!');
      navigate(`/trips/${id}`);
    } catch (error) {
      toast.error('Failed to add destination');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="mx-auto bg-indigo-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
          <MapPin className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Where to next?</h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Explore destinations and add them to your trip. We'll help you find the best activities once you arrive.</p>
        
        <div className="mt-8 max-w-2xl mx-auto flex rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <div className="relative flex-grow flex items-center">
            <div className="pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-none rounded-r-xl border-0 py-4 pl-3 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-base outline-none bg-transparent"
              placeholder="Search for Paris, Tokyo, New York..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="pt-4 flex justify-between">
                  <div className="h-8 bg-slate-200 rounded-lg w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="h-48 relative overflow-hidden bg-slate-100">
                {city.image_url ? (
                  <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image' }} />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">
                  Pop: {city.popularity_score}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{city.name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-4">{city.country}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md text-slate-600">
                      {'$'.repeat(city.cost_index)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{city.region}</span>
                  </div>
                  
                  <button
                    onClick={() => handleAddStop(city.id)}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Add to Itinerary
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cities.length === 0 && searchTerm && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
              <p className="text-lg font-medium text-slate-900">No destinations found matching "{searchTerm}"</p>
              <p className="mt-1 text-slate-500">Try a different search term or check spelling.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
