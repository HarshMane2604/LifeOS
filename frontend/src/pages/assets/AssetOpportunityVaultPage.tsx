import { useState, useEffect } from 'react';
import { AssetIdea } from '@/types/assets';
import api from '@/lib/api';
import { Plus, Zap, AlertTriangle, TrendingUp, Clock, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AssetOpportunityVaultPage() {
  const [ideas, setIdeas] = useState<AssetIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await api.get<AssetIdea[]>('/assets/ideas');
      setIdeas(res);
    } catch (err) {
      console.error('Failed to fetch asset ideas', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIdea = async () => {
    const title = window.prompt("What is your new asset idea?");
    if (!title || !title.trim()) return;

    try {
      const newIdea = await api.post<AssetIdea>('/assets/ideas', {
        title: title.trim(),
        estimated_cost: 0,
        estimated_time_months: 6,
        potential_roi_percent: 20,
        risk_level: 'medium',
        priority: 'medium'
      });
      setIdeas([newIdea, ...ideas]);
    } catch (err) {
      console.error('Failed to add idea', err);
      alert('Failed to add idea');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-accent-emerald)';
    if (score >= 50) return 'var(--color-accent-amber)';
    return 'var(--color-accent-rose)';
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Opportunity Vault</h1>
          <p className="page-description">Store and evaluate ideas for future wealth-generating assets.</p>
        </div>
        <button className="btn-primary" onClick={handleAddIdea}>
          <Plus size={16} style={{ marginRight: 8 }} />
          New Idea
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : ideas.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <Zap size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Your Vault is Empty</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Start logging your million-dollar ideas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {ideas.map((idea) => (
            <div key={idea.id} className="glass-card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
              {/* Asset Score Badge */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: `rgba(${getScoreColor(idea.asset_score).replace('var(--color-accent-', '').replace(')', '')}, 0.1)`, // Quick hack for bg
                padding: '8px 16px',
                borderBottomLeftRadius: 'var(--radius-lg)',
                borderLeft: '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Zap size={14} color={getScoreColor(idea.asset_score)} />
                <span style={{ fontWeight: 700, color: getScoreColor(idea.asset_score) }}>{idea.asset_score}</span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, paddingRight: 60 }}>{idea.title}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Est. Cost</div>
                  <div style={{ fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{formatCurrency(idea.estimated_cost)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Est. Time</div>
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color="var(--color-text-muted)" />
                    {idea.estimated_time_months} mo
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Potential ROI</div>
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={14} color="var(--color-accent-emerald)" />
                    {idea.potential_roi_percent}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Risk Level</div>
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}>
                    <AlertTriangle size={14} color={idea.risk_level === 'high' ? 'var(--color-accent-rose)' : idea.risk_level === 'low' ? 'var(--color-accent-emerald)' : 'var(--color-accent-amber)'} />
                    {idea.risk_level}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '6px 0', fontSize: 13 }}>Edit Details</button>
                <button className="btn-primary" style={{ flex: 1, padding: '6px 0', fontSize: 13 }}>Promote to Asset</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
