import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, TrendingUp, MoreVertical, X } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string | null;
  color: string | null;
}

export default function FinancialGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '', icon: '🎯', color: '#8b5cf6' });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get<Goal[]>('/financial-goals');
      setGoals(res);
    } catch (err) {
      console.error('Failed to fetch financial goals', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        target_amount: parseFloat(form.target_amount),
        current_amount: 0,
        deadline: form.deadline || null,
        icon: form.icon,
        color: form.color
      };
      await api.post('/financial-goals', payload);
      setShowModal(false);
      setForm({ name: '', target_amount: '', deadline: '', icon: '🎯', color: '#8b5cf6' });
      fetchGoals();
    } catch (err) {
      console.error('Failed to create goal', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Target className="text-violet-500" />
            Financial Goals
          </h1>
          <p className="page-description">Track your savings targets, emergency funds, and major purchases.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: 8 }} />
          New Goal
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <Target size={48} style={{ margin: '0 auto 16px', color: 'var(--color-text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Financial Goals</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Set a savings target to start tracking your progress.</p>
          <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => setShowModal(true)}>
            <Plus size={16} style={{ marginRight: 8 }} />
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {goals.map(goal => {
            const progress = getProgress(goal.current_amount, goal.target_amount);
            const color = goal.color || '#8b5cf6'; // Default violet

            const chartData = [{ name: 'Progress', value: progress, fill: color }];

            return (
              <div key={goal.id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>{goal.name}</h3>
                      {goal.deadline && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          Target: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                  <div style={{ width: 100, height: 100, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={chartData} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {progress}%
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Current Saved</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(goal.current_amount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Target Amount</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 'auto' }}>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    <TrendingUp size={14} style={{ marginRight: 8 }} />
                    Add Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add Financial Goal</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Goal Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g., Emergency Fund" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target Amount (₹)</label>
                    <input type="number" step="0.01" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} className="input-field" placeholder="0.00" required style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Icon (Emoji)</label>
                    <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input-field" maxLength={2} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Color</label>
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 38, padding: 0, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Goal</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
