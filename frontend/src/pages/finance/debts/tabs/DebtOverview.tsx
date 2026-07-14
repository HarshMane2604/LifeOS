import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DebtOverview({ debts, loading }: { debts: any[]; loading: boolean }) {
  if (loading) return <div>Loading overview...</div>;

  const totalDebt = debts.reduce((sum, d) => sum + d.current_balance, 0);
  const monthlyEmi = debts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0);
  const activeDebts = debts.filter(d => d.status === 'active' && d.current_balance > 0).length;

  const typeMap: Record<string, number> = {};
  debts.forEach(d => {
    if (d.current_balance > 0) {
      typeMap[d.type] = (typeMap[d.type] || 0) + d.current_balance;
    }
  });
  const pieData = Object.entries(typeMap).map(([k, v]) => ({ name: k.replace('_', ' ').toUpperCase(), value: v }));
  const COLORS = ['#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="metric-card">
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Outstanding Debt</p>
          <p className="font-mono-financial" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent-rose)' }}>
            {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Monthly EMI</p>
          <p className="font-mono-financial" style={{ fontSize: 24, fontWeight: 800 }}>
            {formatCurrency(monthlyEmi)}
          </p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Active Debts</p>
          <p className="font-mono-financial" style={{ fontSize: 24, fontWeight: 800 }}>
            {activeDebts}
          </p>
        </div>
        <div className="metric-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent-emerald-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} className="text-emerald-500" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Health Score</p>
            <p className="font-mono-financial" style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent-emerald)' }}>
              85<span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>/100</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Breakdown */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Debt Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                  <span className="font-mono-financial">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
