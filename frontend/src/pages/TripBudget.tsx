import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { ArrowLeft, DollarSign, AlertTriangle, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function TripBudget() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Manual Add state
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'transport', amount: '', date: '' });

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trips/${id}`);
      setTrip(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/trips/${id}/budget`, {
        category: newItem.category,
        amount: parseFloat(newItem.amount),
        date: newItem.date ? new Date(newItem.date).toISOString() : undefined
      });
      toast.success("Budget item added");
      setShowAdd(false);
      fetchTrip();
    } catch (e) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Delete this budget item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/trips/${id}/budget/${itemId}`);
      toast.success("Deleted");
      fetchTrip();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
           <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Calculate budget from BudgetItem rows
  const categories = { transport: 0, stay: 0, meals: 0, activities: 0 };
  const dailySpend: Record<string, number> = {};

  trip.budget_items?.forEach((item: any) => {
    if (categories[item.category as keyof typeof categories] !== undefined) {
      categories[item.category as keyof typeof categories] += item.amount;
    }
    if (item.date) {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      dailySpend[dateStr] = (dailySpend[dateStr] || 0) + item.amount;
    }
  });

  const total = categories.transport + categories.stay + categories.meals + categories.activities;
  
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const perDayAverage = total / durationDays;

  // Chart configs
  const pieData = {
    labels: ['Transport', 'Stay', 'Meals', 'Activities'],
    datasets: [{
      data: [categories.transport, categories.stay, categories.meals, categories.activities],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }],
  };

  const dailyThreshold = 300; // configurable threshold
  const isOverBudget = perDayAverage > dailyThreshold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <Link to={`/trips/${id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center mb-2 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Itinerary
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trip Budget & Expenses</h1>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Expense
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddItem} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              className="rounded-lg border-slate-300 py-2 pl-3 pr-10 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
            >
              <option value="transport">Transport</option>
              <option value="stay">Stay</option>
              <option value="meals">Meals</option>
              <option value="activities">Activities</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
            <input 
              type="number" step="0.01" min="0" required 
              className="rounded-lg border-slate-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-32"
              value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input 
              type="date"
              min={trip.start_date.split('T')[0]}
              max={trip.end_date.split('T')[0]}
              className="rounded-lg border-slate-300 py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})}
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">Save</button>
          <button type="button" onClick={() => setShowAdd(false)} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">Cancel</button>
        </form>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Estimated Cost</h2>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-slate-900">${total.toFixed(2)}</span>
             <span className="text-sm text-slate-500 mb-1">USD</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Average</h2>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-slate-900">${perDayAverage.toFixed(2)}</span>
             <span className="text-sm text-slate-500 mb-1">/ day</span>
          </div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border ${isOverBudget ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
           <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isOverBudget ? 'text-amber-700' : 'text-emerald-700'}`}>
              Budget Health
           </h2>
           {isOverBudget ? (
             <div className="flex items-start gap-3">
               <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-amber-800 font-medium">
                 Your daily average (${perDayAverage.toFixed(0)}) exceeds your threshold of ${dailyThreshold}. Consider adjusting your itinerary.
               </p>
             </div>
           ) : (
             <p className="text-sm text-emerald-800 font-medium">
               Your trip looks great! Your average daily spending is well balanced below ${dailyThreshold}.
             </p>
           )}
        </div>
      </div>

      {total === 0 ? (
        <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 py-16 px-4">
          <DollarSign className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No expenses logged yet</h3>
          <p className="mt-2 text-sm text-slate-500">Add stops and activities to auto-generate a budget, or add custom expenses manually.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Category Breakdown</h2>
            <div className="w-full max-w-[240px] mx-auto mb-6">
              <Pie data={pieData} options={{ maintainAspectRatio: true }} />
            </div>
            <ul className="divide-y divide-slate-100">
              {Object.entries(categories).map(([cat, amount]) => (
                <li key={cat} className="py-3 flex justify-between items-center">
                  <span className="text-slate-600 capitalize font-medium">{cat}</span>
                  <span className="font-bold text-slate-900">${amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Line Items</h2>
            </div>
            <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {trip.budget_items?.map((item: any) => (
                <li key={item.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{item.category}</p>
                    {item.date && (
                      <p className="text-xs text-slate-500 mt-1">Date: {new Date(item.date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
