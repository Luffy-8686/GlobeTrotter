import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function UserProfile() {
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
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=User' }} />
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
    </div>
  );
}
