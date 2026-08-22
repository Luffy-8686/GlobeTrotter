import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Users, Map, Activity, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [topCities, setTopCities] = useState<any[]>([]);
  const [topActivities, setTopActivities] = useState<any[]>([]);
  const [interestCats, setInterestCats] = useState<any[]>([]);
  const [seasonality, setSeasonality] = useState<any[]>([]);
  const [tripDuration, setTripDuration] = useState<any[]>([]);
  const [budgetRanges, setBudgetRanges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [
          statsRes, citiesRes, actsRes, catsRes,
          seasonRes, durRes, budgetRes, usersRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats/overview'),
          axios.get('http://localhost:5000/api/admin/trends/top-cities'),
          axios.get('http://localhost:5000/api/admin/trends/top-activities'),
          axios.get('http://localhost:5000/api/admin/trends/interest-categories'),
          axios.get('http://localhost:5000/api/admin/trends/seasonality'),
          axios.get('http://localhost:5000/api/admin/trends/trip-duration'),
          axios.get('http://localhost:5000/api/admin/trends/budget-ranges'),
          axios.get('http://localhost:5000/api/admin/users')
        ]);
        
        setStats(statsRes.data);
        setTopCities(citiesRes.data);
        setTopActivities(actsRes.data);
        setInterestCats(catsRes.data);
        setSeasonality(seasonRes.data);
        setTripDuration(durRes.data);
        setBudgetRanges(budgetRes.data);
        setUsers(usersRes.data);
      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 403) {
           toast.error('Unauthorized: Admin access required');
        } else {
           toast.error('Failed to load admin dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-indigo-500 font-bold text-xl animate-pulse">Loading Admin Data...</div>;
  }

  if (!stats) return <div className="p-8 text-red-500 text-center font-bold">Failed to load admin data</div>;

  // Chart Configs
  const topCitiesData = {
    labels: topCities.map(c => c.name),
    datasets: [{
      label: 'Stops',
      data: topCities.map(c => c.count),
      backgroundColor: 'rgba(99, 102, 241, 0.7)', // Indigo
      borderRadius: 4,
    }]
  };

  const topActsData = {
    labels: topActivities.map(a => a.name.length > 25 ? a.name.substring(0, 25) + '...' : a.name),
    datasets: [{
      label: 'Bookings',
      data: topActivities.map(a => a.count),
      backgroundColor: 'rgba(236, 72, 153, 0.7)', // Pink
      borderRadius: 4,
    }]
  };

  const interestData = {
    labels: interestCats.map(c => c.category),
    datasets: [{
      data: interestCats.map(c => c.count),
      backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#14b8a6'],
      borderWidth: 1,
    }]
  };

  const seasonalityData = {
    labels: seasonality.map(s => s.month),
    datasets: [{
      label: 'Trips Started',
      data: seasonality.map(s => s.count),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const durationData = {
    labels: tripDuration.map(d => d.range),
    datasets: [{
      label: 'Number of Trips',
      data: tripDuration.map(d => d.count),
      backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald
      borderRadius: 4,
    }]
  };

  const budgetData = {
    labels: budgetRanges.map(b => b.range),
    datasets: [{
      label: 'Number of Trips',
      data: budgetRanges.map(b => b.count),
      backgroundColor: 'rgba(245, 158, 11, 0.7)', // Amber
      borderRadius: 4,
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Intelligence</h1>
        <p className="mt-2 text-sm text-slate-500 font-medium">Real-time travel trends and platform statistics.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
          { label: 'Total Trips', value: stats.totalTrips, icon: Map, color: 'text-indigo-500' },
          { label: 'Public Shared Trips', value: stats.publicTrips, icon: Activity, color: 'text-pink-500' },
          { label: 'Active Trips (This Month)', value: stats.activeTripsThisMonth, icon: Calendar, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm border border-slate-100 rounded-2xl p-6 flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-xl bg-slate-50 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-semibold text-slate-500 truncate">{stat.label}</dt>
              <dd className="text-2xl font-black text-slate-900">{stat.value}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Visited Cities</h3>
          <div className="h-72">
            <Bar data={topCitiesData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Most Booked Activities</h3>
          <div className="h-72">
            <Bar data={topActsData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Trends Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Travel Seasonality</h3>
          <div className="h-72">
            <Line data={seasonalityData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Activity Interests</h3>
          <div className="h-72 flex justify-center">
            <Doughnut data={interestData} options={{ maintainAspectRatio: false, cutout: '65%' }} />
          </div>
        </div>
      </div>

      {/* Distributions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Trip Duration Distribution</h3>
          <div className="h-64">
            <Bar data={durationData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Trip Budget Ranges</h3>
          <div className="h-64">
            <Bar data={budgetData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Platform Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trips</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{u.name}</span>
                      <span className="text-sm text-slate-500">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                    {u._count.trips}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
