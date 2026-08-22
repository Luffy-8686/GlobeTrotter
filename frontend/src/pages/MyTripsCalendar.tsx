import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Link, useNavigate } from 'react-router-dom';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function MyTripsCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/trips');
        const trips = res.data;
        const formattedEvents = trips.map((trip: any) => ({
          id: trip.id,
          title: trip.name,
          start: new Date(trip.start_date),
          end: new Date(trip.end_date),
          allDay: true,
          resource: trip,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleSelectEvent = (event: any) => {
    navigate(`/trips/${event.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Link to="/trips" className="mr-4 p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <CalendarIcon className="mr-3 text-indigo-500 h-8 w-8" />
          Global Trip Calendar
        </h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div style={{ height: '70vh' }} className="calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              views={['month', 'agenda']}
              className="font-sans"
              eventPropGetter={() => ({
                className: 'bg-indigo-600 border-indigo-700 text-white rounded-md shadow-sm text-xs font-semibold px-2 py-1',
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
