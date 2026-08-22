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
          <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover opacity-60" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x400?text=Cover' }} />
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
                      <li key={tripActivity.id} className="py-4 flex">
                        <img className="h-16 w-16 rounded object-cover bg-gray-100" src={tripActivity.activity.image_url} alt="" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=N/A' }} />
                        <div className="ml-4 flex-1">
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
