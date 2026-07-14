/**
 * Expenses Page — full expense management with table, filters, search, and CRUD modal
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  X,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string | null;
  category: ExpenseCategory | null;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
}

interface Analytics {
  total_today: number;
  total_this_week: number;
  total_this_month: number;
  total_this_year: number;
  by_category: Array<{ name: string; color: string; total: number }>;
  daily_trend: Array<{ date: string; total: number }>;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#64748b', '#f97316', '#3b82f6', '#a855f7', '#14b8a6'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    is_recurring: false,
    notes: '',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterCategory) params.category_id = filterCategory;

      const [expRes, catRes, anaRes] = await Promise.all([
        api.get<Expense[]>('/expenses', params),
        api.get<ExpenseCategory[]>('/expenses/categories'),
        api.get<Analytics>('/expenses/analytics'),
      ]);
      setExpenses(expRes);
      setCategories(catRes);
      setAnalytics(anaRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      is_recurring: false,
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      amount: String(exp.amount),
      description: exp.description || '',
      date: exp.date,
      category_id: exp.category_id || '',
      is_recurring: exp.is_recurring,
      notes: exp.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(formData.amount),
      description: formData.description || null,
      date: formData.date,
      category_id: formData.category_id || null,
      is_recurring: formData.is_recurring,
      notes: formData.notes || null,
    };

    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const a = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ═══════ Page Header ═══════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
            <Receipt size={24} style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
            Expenses
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 2 }}>
            Track and manage your spending
          </p>
        </div>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          id="add-expense-btn"
        >
          <Plus size={18} />
          Add Expense
        </motion.button>
      </div>

      {/* ═══════ Analytics Cards ═══════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {[
          { label: 'Today', value: a?.total_today || 0, color: 'var(--color-accent-rose)' },
          { label: 'This Week', value: a?.total_this_week || 0, color: 'var(--color-accent-amber)' },
          { label: 'This Month', value: a?.total_this_month || 0, color: 'var(--color-accent-violet)' },
          { label: 'This Year', value: a?.total_this_year || 0, color: 'var(--color-accent-cyan)' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{stat.label}</p>
            <p className="font-mono-financial" style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>
              {formatCurrency(stat.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ═══════ Charts Row ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Daily Trend */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Spending Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={a?.daily_trend || []}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).getDate().toString()}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                }}
                formatter={(value: any) => [formatCurrency(value), 'Spent']}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* By Category Pie */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>By Category</h3>
          {(a?.by_category || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={a?.by_category}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {(a?.by_category || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                    }}
                    formatter={(value: any) => [formatCurrency(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {(a?.by_category || []).slice(0, 5).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 40 }}>
              No category data yet
            </p>
          )}
        </div>
      </div>

      {/* ═══════ Filters & Search ═══════ */}
      <div className="glass-card" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            id="expense-search"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field"
          style={{ width: 200, height: 38, fontSize: 13 }}
          id="expense-category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      {/* ═══════ Expenses Table ═══════ */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center', width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? expenses.map((exp) => (
              <motion.tr
                key={exp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {formatDate(exp.date)}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 500 }}>{exp.description || '—'}</span>
                  {exp.is_recurring && (
                    <span className="badge badge-violet" style={{ marginLeft: 8, fontSize: 10 }}>Recurring</span>
                  )}
                </td>
                <td>
                  {exp.category ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `${exp.category.color}20`,
                      color: exp.category.color,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {exp.category.icon} {exp.category.name}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Uncategorized</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="font-mono-financial" style={{ fontWeight: 700, color: 'var(--color-accent-rose)', fontSize: 14 }}>
                    -{formatCurrency(exp.amount)}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    <button
                      onClick={() => openEditModal(exp)}
                      style={{
                        padding: 6,
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-violet)'; e.currentTarget.style.background = 'var(--color-accent-violet-glow)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{
                        padding: 6,
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-rose)'; e.currentTarget.style.background = 'var(--color-accent-rose-glow)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                  {loading ? 'Loading...' : 'No expenses yet. Start tracking by adding your first expense!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════ Add/Edit Modal ═══════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: 32 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                    className="input-field"
                    placeholder="0.00"
                    required
                    style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace" }}
                    id="expense-amount"
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                    className="input-field"
                    placeholder="What did you spend on?"
                    id="expense-description"
                  />
                </div>

                {/* Date + Category Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
                      className="input-field"
                      required
                      id="expense-date"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(f => ({ ...f, category_id: e.target.value }))}
                      className="input-field"
                      id="expense-category"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                    className="input-field"
                    placeholder="Additional notes..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                    id="expense-notes"
                  />
                </div>

                {/* Recurring toggle */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData(f => ({ ...f, is_recurring: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-accent-violet)' }}
                    id="expense-recurring"
                  />
                  Recurring expense
                </label>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ flex: 1 }}
                    id="expense-submit"
                  >
                    {editingExpense ? 'Save Changes' : 'Add Expense'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
