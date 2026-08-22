import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, Clock, DollarSign, MapPin, Calendar, Check, X } from 'lucide-react';
import { getLocalCurrencyInfo, formatINR } from '../utils/currency';

export default function ActivitySearch() {
  const { id, stopId } = useParams<{ id: string, stopId: string }>();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState('');
  const [stopDates, setStopDates] = useState({ start: '', end: '' });

  // Scheduler state
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '' });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const tripRes = await axios.get(`http://localhost:5000/api/trips/${id}`);
        const trip = tripRes.data;
        const stop = trip.stops.find((s: any) => s.id === stopId);
        
        if (!stop) {
          toast.error("Stop not found");
          return;
        }
        
        setCityName(stop.city.name);
        setStopDates({
          start: new Date(stop.start_date).toISOString().split('T')[0],
          end: new Date(stop.end_date).toISOString().split('T')[0]
        });

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

  const getAvailableSlots = (act: any) => {
    const name = act.name.toLowerCase();
    const duration = act.duration_minutes;
    if (duration >= 300) return [{ label: 'Full Day (09:00)', value: '09:00' }];
    
    let slots = [
      { label: 'Morning (09:00)', value: '09:00' },
      { label: 'Afternoon (14:00)', value: '14:00' },
      { label: 'Evening (17:00)', value: '17:00' },
      { label: 'Night (20:00)', value: '20:00' }
    ];

    if (name.includes('night')) return [slots[3]];
    if (name.includes('dinner')) return [slots[2], slots[3]];
    if (name.includes('sunset')) return [slots[2]];
    if (name.includes('breakfast')) return [slots[0]];
    if (name.includes('lunch')) return [slots[1]];

    return slots;
  };

  const handleOpenScheduler = (act: any) => {
    const slots = getAvailableSlots(act);
    setScheduleData({ date: stopDates.start, time: slots[0].value });
    setSelectedActivity(act.id);
  };

  const handleAddActivity = async (activityId: string) => {
    if (!scheduleData.date || !scheduleData.time) {
      toast.error('Please select a date and time slot.');
      return;
    }
    
    try {
      await axios.post(`http://localhost:5000/api/trips/${id}/stops/${stopId}/activities`, {
        activity_id: activityId,
        scheduled_date: scheduleData.date,
        scheduled_time: scheduleData.time
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
          {activities.map((act) => {
            const isSelected = selectedActivity === act.id;
            const availableSlots = getAvailableSlots(act);
            
            return (
              <div key={act.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  {act.image_url ? (
                    <img src={act.image_url} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { 
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%23f1f5f9%22%20%2F%3E%3Cpath%20d%3D%22M200%20300L400%20100M200%20100L400%20300%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%2220%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E';
                    }} />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <MapPin className="h-12 w-12" />
                    </div>
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
                      <span className="flex flex-col items-end text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <span className="font-bold">{formatINR(act.cost)}</span>
                        <span className="text-[10px] text-emerald-600/80">{getLocalCurrencyInfo(act.cost, cityName).split(' ')[1]}</span>
                      </span>
                    </div>
                    
                    {isSelected ? (
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Schedule Activity</span>
                          <button onClick={() => setSelectedActivity(null)} className="text-indigo-400 hover:text-indigo-600"><X className="h-4 w-4" /></button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Select Date</label>
                          <input 
                            type="date"
                            min={stopDates.start}
                            max={stopDates.end}
                            value={scheduleData.date}
                            onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                            className="w-full text-sm border-slate-300 rounded-lg focus:ring-indigo-500 py-2"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Select Time Slot</label>
                          <select 
                            value={scheduleData.time}
                            onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                            className="w-full text-sm border-slate-300 rounded-lg focus:ring-indigo-500 py-2 bg-white"
                          >
                            {availableSlots.map(slot => (
                              <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => handleAddActivity(act.id)}
                          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors mt-2"
                        >
                          <Check className="-ml-1 mr-2 h-4 w-4" />
                          Confirm & Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenScheduler(act)}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        <Calendar className="-ml-1 mr-2 h-4 w-4" />
                        Schedule Activity
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
