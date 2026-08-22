import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Plus, Trash2, Edit2, Check, X, CreditCard } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface SplitExpensesProps {
  tripId: string;
}

export default function SplitExpenses({ tripId }: SplitExpensesProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  
  const [editingShare, setEditingShare] = useState<string | null>(null);
  const [editingPaid, setEditingPaid] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trips/${tripId}/split-summary`);
      setSummary(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [tripId]);

  const handleToggleSplit = async () => {
    try {
      const newType = summary.split_type === 'NONE' ? 'EQUAL' : 'NONE';
      await axios.put(`http://localhost:5000/api/trips/${tripId}/split`, { split_type: newType });
      fetchSummary();
      toast.success(newType === 'NONE' ? 'Splitting disabled' : 'Splitting enabled');
    } catch (e) { toast.error('Error updating split setting'); }
  };
  
  const handleSetSplitType = async (type: string) => {
    try {
      await axios.put(`http://localhost:5000/api/trips/${tripId}/split`, { split_type: type });
      fetchSummary();
    } catch (e) { toast.error('Error updating split setting'); }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipantName.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/trips/${tripId}/participants`, { name: newParticipantName });
      setNewParticipantName('');
      setShowAddParticipant(false);
      fetchSummary();
      toast.success('Participant added');
    } catch (e) { toast.error('Error adding participant'); }
  };

  const handleRemoveParticipant = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/trips/${tripId}/participants/${id}`);
      fetchSummary();
      toast.success('Participant removed');
    } catch (e) { toast.error('Error removing participant'); }
  };

  const handleSaveShare = async (id: string) => {
    const currentShares = summary.participants.map((p: any) => ({
      participant_id: p.participant_id,
      share_percentage: p.participant_id === id ? parseFloat(editValue) : 
        (p.shareAmount / summary.totalBudget * 100)
    }));
    
    try {
      await axios.put(`http://localhost:5000/api/trips/${tripId}/split`, { split_type: 'CUSTOM', shares: currentShares });
      setEditingShare(null);
      fetchSummary();
      toast.success('Shares updated');
    } catch (e: any) { 
      toast.error(e.response?.data?.error || 'Percentages must sum to 100'); 
    }
  };

  const handleSavePaid = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/trips/${tripId}/participants/${id}/paid`, { amount_paid: parseFloat(editValue) });
      setEditingPaid(null);
      fetchSummary();
    } catch (e) { toast.error('Error updating amount paid'); }
  };

  if (loading || !summary) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" /> Split Expenses
          </h2>
          <p className="text-sm text-slate-500 mt-1">Split the estimated budget among your group.</p>
        </div>
        <div className="flex items-center">
           <label className="flex items-center cursor-pointer">
             <span className="mr-3 text-sm font-medium text-slate-700">{summary.split_type !== 'NONE' ? 'Enabled' : 'Disabled'}</span>
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={summary.split_type !== 'NONE'} onChange={handleToggleSplit} />
               <div className={`block w-10 h-6 rounded-full transition-colors ${summary.split_type !== 'NONE' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
               <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${summary.split_type !== 'NONE' ? 'transform translate-x-4' : ''}`}></div>
             </div>
           </label>
        </div>
      </div>

      {summary.split_type !== 'NONE' && (
        <div className="p-6">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => handleSetSplitType('EQUAL')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${summary.split_type === 'EQUAL' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Equal Split
              </button>
              <button 
                onClick={() => handleSetSplitType('CUSTOM')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${summary.split_type === 'CUSTOM' ? 'bg-white shadow text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Custom %
              </button>
            </div>
            <button 
              onClick={() => setShowAddParticipant(true)}
              className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-sm font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Person
            </button>
          </div>

          {showAddParticipant && (
            <form onSubmit={handleAddParticipant} className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Name" 
                value={newParticipantName}
                onChange={e => setNewParticipantName(e.target.value)}
                className="rounded-lg border-slate-300 sm:text-sm px-3 py-2 flex-1 border"
                autoFocus
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">Add</button>
              <button type="button" onClick={() => setShowAddParticipant(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300">Cancel</button>
            </form>
          )}

          {summary.participants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Share (Owed)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {summary.participants.map((p: any) => (
                    <tr key={p.participant_id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {summary.split_type === 'CUSTOM' && editingShare === p.participant_id ? (
                          <div className="flex items-center gap-2">
                            <input type="number" step="1" className="w-16 rounded border border-slate-300 text-xs py-1 px-2" value={editValue} onChange={e => setEditValue(e.target.value)} /> %
                            <button onClick={() => handleSaveShare(p.participant_id)} className="text-emerald-600"><Check className="h-4 w-4"/></button>
                            <button onClick={() => setEditingShare(null)} className="text-slate-400"><X className="h-4 w-4"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center group">
                            {formatINR(p.shareAmount)}
                            {summary.split_type === 'CUSTOM' && (
                               <button onClick={() => { setEditingShare(p.participant_id); setEditValue(((p.shareAmount / summary.totalBudget)*100).toFixed(0)); }} className="ml-2 text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100"><Edit2 className="h-3 w-3"/></button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {editingPaid === p.participant_id ? (
                          <div className="flex items-center gap-2">
                            <input type="number" step="0.01" className="w-24 rounded border border-slate-300 text-xs py-1 px-2" value={editValue} onChange={e => setEditValue(e.target.value)} />
                            <button onClick={() => handleSavePaid(p.participant_id)} className="text-emerald-600"><Check className="h-4 w-4"/></button>
                            <button onClick={() => setEditingPaid(null)} className="text-slate-400"><X className="h-4 w-4"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center group">
                            {formatINR(p.amountPaid)}
                            <button onClick={() => { setEditingPaid(p.participant_id); setEditValue(p.amountPaid); }} className="ml-2 text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100"><Edit2 className="h-3 w-3"/></button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">
                        {p.balance < -0.01 ? (
                           <span className="text-red-600">Owning {formatINR(Math.abs(p.balance))}</span>
                        ) : p.balance > 0.01 ? (
                           <span className="text-emerald-600">Owed {formatINR(p.balance)}</span>
                        ) : (
                           <span className="text-slate-400">Settled</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button onClick={() => handleRemoveParticipant(p.participant_id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">No participants added yet.</p>
            </div>
          )}

          {summary.settlements.length > 0 && (
            <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" /> How to Settle Up
              </h3>
              <ul className="space-y-3">
                {summary.settlements.map((s: any, idx: number) => (
                  <li key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">
                      <strong>{s.from}</strong> pays <strong>{s.to}</strong>
                    </span>
                    <span className="text-sm font-bold text-emerald-600">{formatINR(s.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
