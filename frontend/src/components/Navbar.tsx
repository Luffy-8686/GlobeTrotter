import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Trips', path: '/trips' },
    { name: 'Community', path: '/community' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 hidden sm:block tracking-tight">GlobeTrotter</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="ml-4 pl-4 border-l border-slate-200 flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="text-slate-600 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`sm:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className="absolute right-0 w-64 h-full bg-white shadow-xl flex flex-col pt-16">
          <div className="px-2 pt-2 pb-3 space-y-1 overflow-y-auto flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 space-y-2">
             <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
             <button
                onClick={() => { setIsOpen(false); logout(); }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
