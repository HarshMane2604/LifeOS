import { useState, useEffect } from 'react';
import { Shuffle, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Calendar } from "@/components/ui/calendar";

export default function DebtStrategy() {
  const [strategy, setStrategy] = useState<any>(null);
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball');
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    api.get('/debts/strategy').then(setStrategy);
  }, []);

  if (!strategy) return <div>Loading strategies...</div>;

  const currentPlan = method === 'snowball' ? strategy.snowball : strategy.avalanche;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 12, background: 'var(--color-bg-tertiary)', padding: 6, borderRadius: 'var(--radius-lg)', alignSelf: 'flex-start' }}>
          <button
            onClick={() => setMethod('snowball')}
            style={{
              padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none',
              background: method === 'snowball' ? 'var(--color-accent-violet)' : 'transparent',
              color: method === 'snowball' ? '#fff' : 'var(--color-text-primary)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Snowball Method
          </button>
          <button
            onClick={() => setMethod('avalanche')}
            style={{
              padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none',
              background: method === 'avalanche' ? 'var(--color-accent-violet)' : 'transparent',
              color: method === 'avalanche' ? '#fff' : 'var(--color-text-primary)',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Avalanche Method
          </button>
        </div>

        {/* Info */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {method === 'snowball' ? 'The Snowball Method' : 'The Avalanche Method'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            {method === 'snowball'
              ? 'Pay off debts from smallest balance to largest. Builds momentum and psychological wins.'
              : 'Pay off debts with the highest interest rate first. Saves the most money on interest.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentPlan.map((d: any, i: number) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--color-bg-secondary)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-accent-violet-glow)', color: 'var(--color-accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600 }}>{d.name}</h4>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.rate}% Interest</p>
                </div>
                <div className="font-mono-financial" style={{ fontSize: 16, fontWeight: 700 }}>
                  {formatCurrency(d.balance)}
                </div>
                {i < currentPlan.length - 1 && <ArrowRight size={16} className="text-muted" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMI Calendar */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>EMI Calendar</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border bg-background"
        />
        <div style={{ marginTop: 24 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Upcoming this month</h4>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No upcoming EMIs on selected date.</p>
        </div>
      </div>
    </div>
  );
}
