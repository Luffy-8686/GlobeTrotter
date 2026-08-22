import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Clock, DollarSign, MapPin } from 'lucide-react';

export default function ActivitySearch() {
  const { id, stopId } = useParams<{ id: string, stopId: string }>();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // First get the trip to find the stop's city_id
        const tripRes = await axios.get(`http://localhost:5000/api/trips/${id}`);
        const trip = tripRes.data;
        const stop = trip.stops.find((s: any) => s.id === stopId);
        
        if (!stop) {
          toast.error("Stop not found");
          return;
        }
        
        setCityName(stop.city.name);

        // Fetch activities for that city
        const res = await axios.get(`http://localhost:5000/api/activities?city_id=${stop.city_id}`);
        setActivities(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [id, stopId]);

  const handleAddActivity = async (activityId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities`, {
        activity_id: activityId
      });
      toast.success('Activity added to your itinerary!');
      navigate(`/trips/${id}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add activity');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center mb-2 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Itinerary
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
             <MapPin className="mr-2 h-6 w-6 text-indigo-600" /> Discover {cityName}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
             </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 font-medium">No activities found for this destination yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((act) => (
            <div key={act.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="h-48 relative overflow-hidden bg-slate-100">
                {act.image_url ? (
                  <img src={act.image_url} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image' }} />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm uppercase tracking-wider">
                  {act.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{act.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{act.description}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                    <span className="flex items-center text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      <Clock className="mr-1.5 h-4 w-4" />
                      {act.duration_minutes} min
                    </span>
                    <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                      <DollarSign className="h-4 w-4" />
                      {act.cost.toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleAddActivity(act.id)}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Add Activity
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
