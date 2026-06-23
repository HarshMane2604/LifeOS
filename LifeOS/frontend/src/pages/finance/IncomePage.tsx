/**
 * Income Page — track income sources with analytics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Income { id: string; source: string; amount: number; date: string; category: string; is_recurring: boolean; notes: string | null; }
interface Analytics { total_this_month: number; total_this_year: number; by_source: Array<{ name: string; total: number }>; monthly_trend: Array<{ year: number; month: number; total: number }>; }

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e', '#ec4899', '#3b82f6'];
const CATEGORIES = ['salary', 'freelancing', 'business', 'investments', 'bonus', 'side_income', 'other'];

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState({ source: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'salary', is_recurring: false, notes: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inc, ana] = await Promise.all([
        api.get<Income[]>('/incomes'),
        api.get<Analytics>('/incomes/analytics'),
      ]);
      setIncomes(inc);
      setAnalytics(ana);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm({ source: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'salary', is_recurring: false, notes: '' }); setShowModal(true); };
  const openEdit = (inc: Income) => { setEditing(inc); setForm({ source: inc.source, amount: String(inc.amount), date: inc.date, category: inc.category, is_recurring: inc.is_recurring, notes: inc.notes || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { source: form.source, amount: parseFloat(form.amount), date: form.date, category: form.category, is_recurring: form.is_recurring, notes: form.notes || null };
    try {
      if (editing) await api.put(`/incomes/${editing.id}`, payload);
      else await api.post('/incomes', payload);
      setShowModal(false); fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete this income?')) return; await api.delete(`/incomes/${id}`); fetchAll(); };

  const a = analytics;
  const monthlyData = (a?.monthly_trend || []).map(t => ({ name: `${t.year}-${String(t.month).padStart(2, '0')}`, total: t.total }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
            <TrendingUp size={24} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle', color: 'var(--color-accent-emerald)' }} />
            Income
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 2 }}>Track your income sources and growth</p>
        </div>
        <motion.button className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} id="add-income-btn">
          <Plus size={18} /> Add Income
        </motion.button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>This Month</p>
          <p className="font-mono-financial" style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent-emerald)' }}>
            {formatCurrency(a?.total_this_month || 0)}
          </p>
        </motion.div>
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>This Year</p>
          <p className="font-mono-financial" style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent-cyan)' }}>
            {formatCurrency(a?.total_this_year || 0)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="var(--color-text-muted)" />
              <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--color-text-muted)" tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 12 }} formatter={(v: any) => [formatCurrency(v), 'Income']} />
              <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>By Source</h3>
          {(a?.by_source || []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {a!.by_source.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, textTransform: 'capitalize' }}>{s.name.replace('_', ' ')}</span>
                  <span className="font-mono-financial" style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(s.total)}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>No income data yet</p>}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Source</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'center', width: 100 }}>Actions</th></tr></thead>
          <tbody>
            {incomes.length > 0 ? incomes.map(inc => (
              <tr key={inc.id}>
                <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{formatDate(inc.date)}</td>
                <td style={{ fontWeight: 500 }}>{inc.source}</td>
                <td><span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>{inc.category.replace('_', ' ')}</span></td>
                <td style={{ textAlign: 'right' }}><span className="font-mono-financial" style={{ fontWeight: 700, color: 'var(--color-accent-emerald)', fontSize: 14 }}>+{formatCurrency(inc.amount)}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    <button onClick={() => openEdit(inc)} style={{ padding: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(inc.id)} style={{ padding: 6, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>{loading ? 'Loading...' : 'No income records yet.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{editing ? 'Edit Income' : 'Add Income'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Source</label>
                  <input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="input-field" placeholder="e.g., Company Name" required id="income-source" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Amount (₹)</label>
                    <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="input-field" placeholder="0.00" required style={{ fontFamily: "'JetBrains Mono', monospace" }} id="income-amount" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required id="income-date" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field" id="income-category">
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="Additional notes..." rows={2} style={{ resize: 'vertical' }} id="income-notes" />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} id="income-submit">{editing ? 'Save Changes' : 'Add Income'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
