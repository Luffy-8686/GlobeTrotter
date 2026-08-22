import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Compass, Mail, Lock, User, Phone, MapPin, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    additional_info: '',
    profile_photo_url: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First Name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="mx-auto bg-indigo-600 w-16 h-16 flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <Compass className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Log in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Two Column Layout for Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className={`pl-10 block w-full rounded-xl sm:text-sm py-2.5 transition-colors ${errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                    placeholder="John"
                  />
                </div>
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className={`pl-10 block w-full rounded-xl sm:text-sm py-2.5 transition-colors ${errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                    placeholder="Doe"
                  />
                </div>
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`pl-10 block w-full rounded-xl sm:text-sm py-2.5 transition-colors ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`pl-10 block w-full rounded-xl sm:text-sm py-2.5 transition-colors ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="pl-10 block w-full border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Photo URL (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.profile_photo_url}
                    onChange={(e) => setFormData({...formData, profile_photo_url: e.target.value})}
                    className="pl-10 block w-full border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">City (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="pl-10 block w-full border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                    placeholder="New York"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Country (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="pl-10 block w-full border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                    placeholder="USA"
                  />
                </div>
              </div>

            </div>

            {/* Additional Info (Full Width) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Information (Optional)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  value={formData.additional_info}
                  onChange={(e) => setFormData({...formData, additional_info: e.target.value})}
                  rows={3}
                  className="pl-10 block w-full border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2.5"
                  placeholder="Tell us a bit about your travel style..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
