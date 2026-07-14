import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PeerTracker() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get('/debts').then((res: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDebts(res.filter((d: any) => ['lent', 'borrowed'].includes(d.type)));
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  const lent = debts.filter(d => d.type === 'lent');
  const borrowed = debts.filter(d => d.type === 'borrowed');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Lent to others */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpRight className="text-emerald-500" />
          Money Lent to Others
        </h3>
        {lent.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No active lending records.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lent.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Contact: {d.contact_info || 'N/A'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono-financial" style={{ color: 'var(--color-accent-emerald)', fontWeight: 700 }}>
                    {formatCurrency(d.current_balance)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Borrowed from others */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowDownRight className="text-rose-500" />
          Money Borrowed from Others
        </h3>
        {borrowed.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No active borrowing records.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {borrowed.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Contact: {d.contact_info || 'N/A'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono-financial" style={{ color: 'var(--color-accent-rose)', fontWeight: 700 }}>
                    {formatCurrency(d.current_balance)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
