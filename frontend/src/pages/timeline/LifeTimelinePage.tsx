import { useState, useEffect } from 'react';
   
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Flag, Plus, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { LifeGoal, GoalHorizon } from '@/types/life';

const HORIZONS: { value: GoalHorizon; label: string; yearOffset: number }[] = [
  { value: '1y', label: '1-Year Horizon', yearOffset: 1 },
  { value: '3y', label: '3-Year Horizon', yearOffset: 3 },
  { value: '5y', label: '5-Year Horizon', yearOffset: 5 },
  { value: '10y', label: '10-Year Horizon', yearOffset: 10 },
];

export default function LifeTimelinePage() {
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
   
  // eslint-disable-next-line react-hooks/immutability
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const data = await api.get<LifeGoal[]>('/life-goals');
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch life goals', err);
    } finally {
      setLoading(false);
    }
  };

  const goalsByHorizon = (horizon: GoalHorizon) => goals.filter(g => g.horizon === horizon);

  async function handleAddGoal(horizon: GoalHorizon = '1y') {
    const title = window.prompt(`What is your new ${horizon.toUpperCase()} timeline goal?`);
    if (!title || !title.trim()) return;

    try {
      const targetYear = currentYear + (HORIZONS.find(h => h.value === horizon)?.yearOffset || 1);
      const newGoal = await api.post<LifeGoal>('/life-goals', {
        title: title.trim(),
        horizon: horizon,
        target_year: targetYear,
        progress: 0,
        status: 'not_started'
      });
      setGoals([...goals, newGoal]);
    } catch (err) {
      console.error('Failed to create timeline goal', err);
      alert('Failed to add goal.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Life Timeline</h1>
          <p className="page-description">Map out your macro goals across different time horizons.</p>
        </div>
        <button className="btn-primary" onClick={() => handleAddGoal('1y')}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Add Timeline Goal
        </button>
      </div>

      {loading ? (
        <div className="p-8">Loading timeline...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, position: 'relative', paddingLeft: 24 }}>
          {/* Vertical Timeline Line */}
          <div style={{
            position: 'absolute',
            left: 31,
            top: 24,
            bottom: 24,
            width: 2,
            background: 'linear-gradient(to bottom, var(--color-accent-violet), var(--color-accent-cyan))',
            borderRadius: 2
          }} />

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
          {HORIZONS.map((horizon) => (
            <div key={horizon.value} style={{ position: 'relative' }}>
              {/* Timeline Node */}
              <div style={{
                position: 'absolute',
                left: -3,
                top: 4,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--color-bg-primary)',
                border: '4px solid var(--color-accent-violet)',
                zIndex: 1
              }} />

              <div style={{ marginLeft: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {horizon.label}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>
                    (Target: {currentYear + horizon.yearOffset})
                  </span>
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
                  {goalsByHorizon(horizon.value).map(goal => (
                    <div key={goal.id} className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600 }}>{goal.title}</h3>
                        <span className={`badge ${goal.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      {goal.description && (
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                          {goal.description}
                        </p>
                      )}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, color: 'var(--color-text-muted)' }}>
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${goal.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {goalsByHorizon(horizon.value).length === 0 && (
                    <div style={{
                      padding: 20,
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handleAddGoal(horizon.value)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Plus size={16} style={{ marginRight: 8 }} />
                      Add goal to this horizon
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
