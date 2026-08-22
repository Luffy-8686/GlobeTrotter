import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ArrowLeft } from 'lucide-react';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function TripCalendar() {
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<any>('week');
  const [date, setDate] = useState<Date>(new Date());
  const [tripData, setTripData] = useState<any>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/${id}`);
        const trip = res.data;
        setTripData(trip);
        
        if (trip.start_date) {
           setDate(new Date(trip.start_date));
        }
        
        let mappedEvents: any[] = [];
        
        // Map trip stops to calendar events
        trip.stops.forEach((stop: any) => {
          mappedEvents.push({
            title: `Stay in ${stop.city.name}`,
            start: new Date(stop.start_date),
            end: new Date(stop.end_date),
            allDay: true,
            resource: 'stop'
          });
          
          // Map activities (mocking time for now if missing)
          stop.activities.forEach((act: any) => {
             const actDate = act.scheduled_date ? new Date(act.scheduled_date) : new Date(stop.start_date);
             
             // If scheduled_time is present, parse it (e.g. "14:00")
             if (act.scheduled_time) {
                const [hours, minutes] = act.scheduled_time.split(':');
                actDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
             }
             
             const endDate = new Date(actDate.getTime() + (act.activity.duration_minutes * 60000));
             mappedEvents.push({
               title: act.activity.name,
               start: actDate,
               end: endDate,
               allDay: false,
               resource: 'activity'
             });
          });
        });
        
        setEvents(mappedEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/trips/${id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center mb-2 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Itinerary
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Trip Calendar</h1>
        </div>
      </div>
      
      <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
           <div className="animate-pulse h-full bg-slate-100 rounded-xl"></div>
        ) : (
          <div className="min-w-[700px] h-full min-h-[500px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              view={view}
              onView={(newView) => setView(newView)}
              date={date}
              onNavigate={(newDate) => setDate(newDate)}
              eventPropGetter={(event) => {
                const backgroundColor = event.resource === 'stop' ? '#4f46e5' : '#0ea5e9';
                return { style: { backgroundColor, borderRadius: '6px', border: 'none' } };
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
