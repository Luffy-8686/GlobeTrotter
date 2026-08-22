import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Map, Calendar, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SharedItinerary() {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/shared/${slug}`);
        setTrip(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading public trip...</div>;
  if (!trip) return <div className="text-center py-20 text-red-500">Trip not found</div>;

  return (
    <div>
      <div className="relative bg-gray-900 h-64 sm:h-80">
        {trip.cover_photo_url && (
          <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover opacity-60" onError={(e) => { 
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221200%22%20height%3D%22400%22%20viewBox%3D%220%200%201200%20400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22grad1%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3A%23334155%3Bstop-opacity%3A1%22%20%2F%3E%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3A%230f172a%3Bstop-opacity%3A1%22%20%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221200%22%20height%3D%22400%22%20fill%3D%22url(%23grad1)%22%20%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%3EDestination%20Cover%3C%2Ftext%3E%3C%2Fsvg%3E';
          }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <h1 className="text-3xl font-bold text-white sm:text-5xl">{trip.name}</h1>
          <p className="mt-2 text-lg text-gray-300 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {format(new Date(trip.start_date), 'MMM d, yyyy')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are viewing a shared, read-only itinerary. 
                {user ? (
                  <button className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600">
                    Copy this trip to your account
                  </button>
                ) : (
                  <Link to="/login" className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600">
                    Log in to copy this trip
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {trip.stops?.map((stop: any, index: number) => (
            <div key={stop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center">
                <div className="flex-shrink-0 bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{stop.city.name}, {stop.city.country}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(stop.start_date), 'MMM d')} - {format(new Date(stop.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                {stop.activities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No activities planned.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {stop.activities.map((tripActivity: any) => (
                      <li key={tripActivity.id} className="flex gap-4 py-4">
                        <img className="h-16 w-16 rounded object-cover bg-gray-100" src={tripActivity.activity.image_url} alt="" onError={(e) => { 
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23f3f4f6%22%20%2F%3E%3Cpath%20d%3D%22M30%2070L70%2030M30%2030L70%2070%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E';
                        }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{tripActivity.activity.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {tripActivity.activity.category}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
