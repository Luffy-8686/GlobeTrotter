import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function UserProfile() {
  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    axios.get('http://localhost:5000/api/badges').then(res => setBadges(res.data)).catch(console.error);
  }, []);
  const { user, login, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [lang, setLang] = useState((user as any)?.language_preference || 'en');
  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/auth/me', {
        name,
        language_preference: lang,
        profile_photo_url: photoUrl
      });
      if (token) {
        login(token, res.data);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences.</p>
        </div>
        
        <form onSubmit={handleSave} className="px-4 py-5 sm:p-6 space-y-6">
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" onError={(e) => { 
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23e2e8f0%22%20%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%2394a3b8%22%2F%3E%3Cpath%20d%3D%22M20%20100C20%2075%2080%2075%2080%20100%22%20fill%3D%22%2394a3b8%22%2F%3E%3C%2Fsvg%3E';
                }} />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="ml-5 flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
              <div className="flex relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Language Preference</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
             <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Travel Badges</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Earn badges by visiting new cities around the world.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {badges.map(b => (
              <div key={b.id} className={`flex flex-col items-center text-center p-4 rounded-xl border ${b.earned ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}`}>
                 <div className="text-4xl mb-3">{b.icon_url}</div>
                 <h4 className={`text-sm font-bold ${b.earned ? 'text-indigo-900' : 'text-slate-500'}`}>{b.name}</h4>
                 <p className="text-xs text-slate-500 mt-1 h-8">{b.earned ? b.description : `Visit ${b.city?.name || b.name.split(' ')[0]} to unlock`}</p>
                 {b.earned && <div className="text-[10px] font-semibold text-indigo-400 mt-2">Earned {new Date(b.earned_at).toLocaleDateString()}</div>}
              </div>
            ))}
            {badges.length === 0 && <div className="col-span-full text-sm text-gray-500">No badges available.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
