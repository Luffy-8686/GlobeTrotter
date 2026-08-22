import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Plus, DollarSign, ArrowLeft, AlertTriangle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function BudgetPage({ trip, onAddExpense, setActivePage }) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseCat, setExpenseCat] = useState('transport');
  const [expenseAmount, setExpenseAmount] = useState('');

  if (!trip) {
    return (
      <div className="gt-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2>No trip selected.</h2>
        <button className="gt-btn gt-btn--primary" onClick={() => setActivePage('my-trips')} style={{ marginTop: 16 }}>
          Go to My Trips
        </button>
      </div>
    );
  }

  // Calculate breakdown
  let actTotal = 0;
  const stopSpends = {};
  trip.stops?.forEach(s => {
    let sTotal = 0;
    s.activities?.forEach(a => {
      sTotal += Number(a.cost) || 0;
    });
    stopSpends[s.city_name] = sTotal;
    actTotal += sTotal;
  });

  const catMap = {
    activity: actTotal,
    transport: 0,
    stay: 0,
    meal: 0,
    other: 0
  };

  (trip.expenses || []).forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + (Number(e.amount) || 0);
  });

  const totalSpend = Object.values(catMap).reduce((a, b) => a + b, 0);

  // Chart Data
  const doughnutData = {
    labels: ['Activities', 'Flights & Transport', 'Hotels & Stay', 'Food & Meals', 'Other'],
    datasets: [
      {
        data: [catMap.activity, catMap.transport, catMap.stay, catMap.meal, catMap.other],
        backgroundColor: ['#FFB020', '#FF5A5F', '#00A699', '#FF8A80', '#9E9E9E'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: Object.keys(stopSpends),
    datasets: [
      {
        label: 'Destination Activity Spend (₹)',
        data: Object.values(stopSpends),
        backgroundColor: '#00A699',
        borderRadius: 6,
      },
    ],
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!expenseName || !expenseAmount) return;
    onAddExpense(trip.id, {
      name: expenseName,
      category: expenseCat,
      amount: Number(expenseAmount),
    });
    setExpenseName('');
    setExpenseAmount('');
    setIsAddingExpense(false);
  };

  return (
    <div className="gt-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <button
        className="gt-btn gt-btn--ghost gt-btn--sm"
        onClick={() => setActivePage('my-trips')}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Back to Trips
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="gt-h1" style={{ margin: 0 }}>Budget &amp; Cost Breakdown 💰</h1>
          <p style={{ color: 'var(--gt-text-muted)', fontSize: 14, margin: '4px 0 0 0' }}>{trip.name}</p>
        </div>
        <button className="gt-btn gt-btn--primary gt-btn--sm" onClick={() => setIsAddingExpense(true)}>
          <Plus size={16} /> Add Custom Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 20, textAlign: 'center', boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gt-primary)' }}>₹{totalSpend.toLocaleString()}</div>
          <div style={{ color: 'var(--gt-text-muted)', fontSize: 13, marginTop: 4 }}>Total Estimated Budget</div>
        </div>
        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 20, textAlign: 'center', boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gt-secondary)' }}>₹{actTotal.toLocaleString()}</div>
          <div style={{ color: 'var(--gt-text-muted)', fontSize: 13, marginTop: 4 }}>Activity Costs</div>
        </div>
        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 20, textAlign: 'center', boxShadow: 'var(--gt-shadow-card)' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#222' }}>₹{(totalSpend - actTotal).toLocaleString()}</div>
          <div style={{ color: 'var(--gt-text-muted)', fontSize: 13, marginTop: 4 }}>Flights, Stays &amp; Meals</div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <h3 className="gt-h3" style={{ marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ maxHeight: 260, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div style={{ background: 'var(--gt-bg)', border: '1px solid var(--gt-border)', borderRadius: 'var(--gt-radius-md)', padding: 24, boxShadow: 'var(--gt-shadow-card)' }}>
          <h3 className="gt-h3" style={{ marginBottom: 16 }}>Destination Spending</h3>
          <div style={{ maxHeight: 260 }}>
            <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* Add Expense Form Modal */}
      {isAddingExpense && (
        <div className="gt-modal-backdrop" onClick={() => setIsAddingExpense(false)}>
          <div className="gt-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="gt-h3" style={{ marginTop: 0 }}>Add Custom Expense</h3>
            <form onSubmit={handleCreateExpense}>
              <div className="gt-form-group">
                <label className="gt-label">Expense Description</label>
                <input
                  type="text"
                  className="gt-input"
                  placeholder="e.g., Eurostar Train Ticket Paris to Rome"
                  value={expenseName}
                  onChange={e => setExpenseName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="gt-label">Category</label>
                  <select className="gt-select" value={expenseCat} onChange={e => setExpenseCat(e.target.value)}>
                    <option value="transport">✈️ Transport &amp; Flights</option>
                    <option value="stay">🏨 Hotel &amp; Stay</option>
                    <option value="meal">🍽️ Food &amp; Meals</option>
                    <option value="other">📌 Other</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="gt-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="gt-input"
                    placeholder="e.g., 4500"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="gt-btn gt-btn--ghost" onClick={() => setIsAddingExpense(false)}>
                  Cancel
                </button>
                <button type="submit" className="gt-btn gt-btn--primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
