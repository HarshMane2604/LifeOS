import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import MainCanvas from '@/components/canvas/MainCanvas';

export default function DebtPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debt, setDebt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchDebt(id);
  }, [id]);

  const fetchDebt = async (debtId: string) => {
    try {
      const res = await api.get<any>(`/debts/${debtId}`);
      setDebt(res);
    } catch (err) {
      console.error('Failed to fetch debt', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCanvas = async (canvasData: any) => {
    if (!debt) return;
    setSaving(true);
    try {
      await api.put(`/debts/${debt.id}`, {
        plan_canvas_data: canvasData
      });
      // Optionally update local state
    } catch (err) {
      console.error('Failed to save canvas', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container">Loading canvas...</div>;
  if (!debt) return <div className="page-container">Debt not found.</div>;

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      margin: 'calc(-1 * var(--space-page))',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header bar */}
      <div style={{
        height: 56,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/finance/debts')}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600 }}>{debt.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/ Debt Plan Canvas</span></h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {saving ? 'Saving...' : 'All changes saved'}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: saving ? 'var(--color-accent-amber)' : 'var(--color-accent-emerald)' }} />
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative', background: 'var(--color-bg-primary)' }}>
        <MainCanvas
          initialData={debt.plan_canvas_data}
          onSave={handleSaveCanvas}
        />
      </div>
    </div>
  );
}
