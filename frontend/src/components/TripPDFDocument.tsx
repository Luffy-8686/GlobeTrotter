import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, DollarSign, Activity } from 'lucide-react';

interface TripPDFDocumentProps {
  trip: any;
}

const TripPDFDocument = forwardRef<HTMLDivElement, TripPDFDocumentProps>(({ trip }, ref) => {
  if (!trip) return null;

  return (
    <div ref={ref} className="bg-white text-slate-900 font-sans print-container">
      {/* 
        Tailwind classes can be hit or miss in printing depending on configuration, 
        so we'll use robust inline styles where critical, or rely on standard tailwind if @media print is configured.
      */}
      
      {/* PAGE 1: Cover */}
      <div 
        className="relative w-full h-[1122px] flex flex-col items-center justify-center overflow-hidden"
        style={{ pageBreakAfter: 'always', backgroundColor: '#0f172a' }}
      >
        {trip.cover_photo_url && (
          <img 
            src={trip.cover_photo_url} 
            alt="Cover" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 text-center px-12">
          <div className="inline-block px-6 py-2 border-2 border-white/40 rounded-full text-white/90 text-xl font-bold tracking-widest uppercase mb-8 backdrop-blur-sm">
            Itinerary Profile
          </div>
          <h1 className="text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            {trip.name}
          </h1>
          <p className="text-3xl text-indigo-200 font-semibold flex items-center justify-center gap-3 drop-shadow-md">
            <Calendar className="h-8 w-8" />
            {format(new Date(trip.start_date), 'MMMM d, yyyy')} - {format(new Date(trip.end_date), 'MMMM d, yyyy')}
          </p>
          
          <div className="mt-24 grid grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-2">Destinations</div>
              <div className="text-4xl font-black text-white">{trip.stops?.length || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-2">Duration</div>
              <div className="text-4xl font-black text-white">
                {Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)))} Days
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-2">Activities</div>
              <div className="text-4xl font-black text-white">
                {trip.stops?.reduce((acc: number, stop: any) => acc + (stop.activities?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2+: Itinerary Details */}
      <div className="p-16">
        <div className="mb-12 border-b-4 border-indigo-600 pb-6">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Journey Breakdown</h2>
          <p className="text-lg text-slate-500 mt-2">A detailed look at your upcoming adventure.</p>
        </div>

        <div className="space-y-16">
          {trip.stops?.map((stop: any, index: number) => (
            <div key={stop.id} className="relative pl-12 border-l-4 border-slate-200" style={{ pageBreakInside: 'avoid' }}>
              
              <div className="absolute -left-6 top-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white">
                {index + 1}
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-3xl font-bold text-slate-900">{stop.city.name}</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-bold uppercase tracking-wide">
                    {stop.city.country}
                  </span>
                </div>
                <div className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(stop.start_date), 'MMM d, yyyy')} — {format(new Date(stop.end_date), 'MMM d, yyyy')}
                </div>
              </div>

              {stop.activities?.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {stop.activities.sort((a: any, b: any) => new Date(a.scheduled_date || 0).getTime() - new Date(b.scheduled_date || 0).getTime()).map((act: any) => (
                    <div key={act.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex gap-5">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-inner">
                        {act.activity.image_url && (
                          <img src={act.activity.image_url} alt="Activity" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-1">
                          {act.scheduled_date ? format(new Date(act.scheduled_date), 'MMM d • h:mm a') : 'Unscheduled'}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">{act.activity.name}</h4>
                        
                        <div className="mt-auto flex items-center gap-4 text-sm font-semibold text-slate-500">
                          <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {act.activity.duration_minutes}m</span>
                          <span className="flex items-center"><Activity className="h-4 w-4 mr-1" /> {act.activity.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-slate-500 italic border border-slate-100">
                  Free time to explore {stop.city.name} on your own! No scheduled activities yet.
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 font-medium">
          <p>Generated by GlobeTrotter AI Itinerary Planner</p>
        </div>
      </div>
    </div>
  );
});

export default TripPDFDocument;
