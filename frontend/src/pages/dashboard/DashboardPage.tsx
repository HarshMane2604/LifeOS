/**
 * Dashboard — Life Command Center
 * The hero page showing all key life metrics at a glance
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Sparkles,
  CheckSquare,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { formatCurrency, calcProgress } from '@/lib/utils';

interface DashboardData {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  active_goals_count: number;
  active_projects_count: number;
  pending_tasks_count: number;
  total_dreams: number;
  financial_health_score: number;
  expense_trend: Array<{ date: string; amount: number }>;
  income_vs_expense: Array<{ month: string; income: number; expense: number }>;
  top_expenses: Array<{ category: string; amount: number }>;
  goal_progress: Array<{ name: string; target: number; current: number; progress: number }>;
  upcoming_tasks: Array<{ title: string; due_date: string | null; priority: string; status: string }>;
  recent_journal: Array<{ date: string; mood: string | null; energy_level: number | null; thoughts_preview: string | null }>;
}

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];

const motivationalQuotes = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Don't watch the clock; do what it does. Keep going.",
  "Wealth is not about having a lot of money; it's about having a lot of options.",
  "The journey of a thousand miles begins with a single step.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Invest in yourself. Your career is the engine of your wealth.",
  "Financial freedom is available to those who learn about it and work for it.",
  "Small daily improvements over time lead to stunning results.",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote] = useState(() =>
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  useEffect(() => {
    api.get<DashboardData>('/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div className="animate-shimmer" style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent-violet)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const d = data || {} as DashboardData;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* ═══════ Hero Metric Cards ═══════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {/* Net Worth */}
        <div className="metric-card" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-violet-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wallet size={20} color="var(--color-accent-violet)" />
            </div>
            <div className="badge badge-emerald" style={{ fontSize: 11 }}>
              <ArrowUpRight size={12} style={{ marginRight: 4 }} />
              +12%
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Net Worth</p>
          <p className="font-mono-financial" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
            {formatCurrency(d.net_worth || 0, true)}
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-emerald-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="var(--color-accent-emerald)" />
            </div>
            {(d.monthly_savings || 0) >= 0 ? (
              <div className="badge badge-emerald" style={{ fontSize: 11 }}>Saving</div>
            ) : (
              <div className="badge badge-rose" style={{ fontSize: 11 }}>Deficit</div>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Monthly Savings</p>
          <p className="font-mono-financial" style={{
            fontSize: 28,
            fontWeight: 800,
            color: (d.monthly_savings || 0) >= 0 ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
          }}>
            {formatCurrency(d.monthly_savings || 0)}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Savings Rate: <span className="font-mono-financial" style={{ color: 'var(--color-text-secondary)' }}>
              {Number(d.savings_rate || 0).toFixed(1)}%
            </span>
          </p>
        </div>

        {/* Monthly Income */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-cyan-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ArrowUpRight size={20} color="var(--color-accent-cyan)" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Monthly Income</p>
          <p className="font-mono-financial" style={{ fontSize: 28, fontWeight: 800 }}>
            {formatCurrency(d.monthly_income || 0)}
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-rose-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ArrowDownRight size={20} color="var(--color-accent-rose)" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Monthly Expenses</p>
          <p className="font-mono-financial" style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-accent-rose)' }}>
            {formatCurrency(d.monthly_expenses || 0)}
          </p>
        </div>
      </div>

      {/* ═══════ Financial Health + Quick Stats ═══════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 16,
      }}>
        {/* Health Score Gauge */}
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Financial Health</p>
          <div style={{
            position: 'relative',
            width: 140,
            height: 140,
            margin: '0 auto 16px',
          }}>
            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(d.financial_health_score || 50) * 3.267} 326.7`}
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="font-mono-financial" style={{ fontSize: 36, fontWeight: 800 }}>
                {d.financial_health_score || 50}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>/ 100</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12 }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Assets</span>
              <p className="font-mono-financial" style={{ fontWeight: 600, color: 'var(--color-accent-emerald)' }}>
                {formatCurrency(d.total_assets || 0, true)}
              </p>
            </div>
            <div style={{ width: 1, background: 'var(--color-border)' }} />
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Liabilities</span>
              <p className="font-mono-financial" style={{ fontWeight: 600, color: 'var(--color-accent-rose)' }}>
                {formatCurrency(d.total_liabilities || 0, true)}
              </p>
            </div>
          </div>
        </div>

        {/* Income vs Expense Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Income vs Expenses</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.income_vs_expense || []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return d.toLocaleDateString('en-IN', { month: 'short' });
                }}
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
                formatter={(value: any) => [formatCurrency(value), '']}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══════ Quick Stats Row ═══════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {[
          { label: 'Active Goals', value: d.active_goals_count || 0, icon: Target, color: 'var(--color-accent-violet)' },
          { label: 'Active Projects', value: d.active_projects_count || 0, icon: Activity, color: 'var(--color-accent-cyan)' },
          { label: 'Pending Tasks', value: d.pending_tasks_count || 0, icon: CheckSquare, color: 'var(--color-accent-amber)' },
          { label: 'Dreams', value: d.total_dreams || 0, icon: Sparkles, color: 'var(--color-accent-rose)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div>
              <p className="font-mono-financial" style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ Bottom Row: Goals + Expenses + Tasks ═══════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16,
      }}>
        {/* Financial Goal Progress */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Financial Goals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(d.goal_progress || []).length > 0 ? d.goal_progress.map((goal, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{goal.name}</span>
                  <span className="font-mono-financial" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {goal.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  <span>{formatCurrency(goal.current, true)}</span>
                  <span>{formatCurrency(goal.target, true)}</span>
                </div>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
                No financial goals yet. Create your first one!
              </p>
            )}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Expenses This Month</h3>
          {(d.top_expenses || []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {d.top_expenses.map((exp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: CHART_COLORS[i % CHART_COLORS.length],
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{exp.category}</span>
                  <span className="font-mono-financial" style={{ fontSize: 13, fontWeight: 600 }}>
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
              No expenses tracked this month yet.
            </p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Upcoming Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(d.upcoming_tasks || []).length > 0 ? d.upcoming_tasks.map((task, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-tertiary)',
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: task.priority === 'high' || task.priority === 'critical'
                    ? 'var(--color-accent-rose)'
                    : task.priority === 'medium'
                      ? 'var(--color-accent-amber)'
                      : 'var(--color-text-muted)',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
                No pending tasks. You're all caught up! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Motivation Widget ═══════ */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))',
          borderColor: 'rgba(139,92,246,0.15)',
          textAlign: 'center',
        }}
      >
        <Heart size={20} color="var(--color-accent-violet)" style={{ margin: '0 auto 12px' }} />
        <p style={{
          fontSize: 16,
          fontWeight: 500,
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
          maxWidth: 600,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          "{quote}"
        </p>
      </div>
    </div>
  );
}
