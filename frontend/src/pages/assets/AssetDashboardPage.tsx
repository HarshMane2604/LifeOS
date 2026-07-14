import { useState, useEffect } from 'react';
import { AssetDashboardData } from '@/types/assets';
import api from '@/lib/api';
import { TrendingUp, PieChart, Activity, DollarSign, Wallet } from 'lucide-react';

export default function AssetDashboardPage() {
  const [data, setData] = useState<AssetDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get<AssetDashboardData>('/assets/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch asset dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || !data) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Asset Planning Dashboard</h1>
        <p className="page-description">Monitor your wealth-generating assets and passive income.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {/* Metric 1 */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: 'rgba(139, 92, 246, 0.1)', borderRadius: 12, color: 'var(--color-accent-violet)' }}>
              <Wallet size={20} />
            </div>
            <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Active Assets</h3>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(data.total_assets_value)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Current value of acquired assets
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, color: 'var(--color-accent-emerald)' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>Future Portfolio Value</h3>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(data.future_assets_value)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Expected value once all assets are complete
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: 'rgba(6, 182, 212, 0.1)', borderRadius: 12, color: 'var(--color-accent-cyan)' }}>
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>Passive Income</h3>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(data.total_monthly_income)}
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 400 }}> /mo</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Target: {formatCurrency(data.expected_monthly_income)}/mo
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 10, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, color: 'var(--color-accent-amber)' }}>
              <Activity size={20} />
            </div>
            <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 500 }}>Pipeline Health</h3>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {data.active_assets_count} <span style={{ fontSize: 16, color: 'var(--color-text-muted)', fontWeight: 400 }}>Active</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            {data.ideas_count} ideas in the Opportunity Vault
          </div>
        </div>
      </div>
      
      {/* Additional Visuals could go here */}
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <PieChart size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 8 }}>Asset Allocation & Performance</h3>
        <p>Charts and visual analytics will be rendered here.</p>
      </div>
    </div>
  );
}
