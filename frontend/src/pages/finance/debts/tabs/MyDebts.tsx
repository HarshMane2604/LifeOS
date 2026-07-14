import { formatCurrency } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

   
   
   
   
   
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MyDebts({ debts, loading, _onRefresh }: { debts: any[]; loading: boolean; _onRefresh: () => void }) {
  if (loading) return <div>Loading...</div>;

  const activeDebts = debts.filter(d => d.status === 'active' && !['lent', 'borrowed'].includes(d.type));

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th style={{ textAlign: 'right' }}>Principal</th>
            <th style={{ textAlign: 'right' }}>Outstanding</th>
            <th style={{ textAlign: 'right' }}>Rate / EMI</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeDebts.length > 0 ? activeDebts.map(d => (
            <tr key={d.id}>
              <td style={{ fontWeight: 600 }}>{d.name}</td>
              <td style={{ textTransform: 'capitalize' }}>{d.type.replace('_', ' ')}</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.principal)}</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-rose)' }}>
                {formatCurrency(d.current_balance)}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{d.interest_rate}%</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatCurrency(d.monthly_payment)}/mo</div>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button className="btn-secondary" style={{ padding: 6, marginRight: 4 }}><Pencil size={14} /></button>
                <button className="btn-secondary" style={{ padding: 6, color: 'var(--color-accent-rose)' }}><Trash2 size={14} /></button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No debts found. You are debt free! 🎉</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
