import { useState, useEffect } from 'react';
import { Cloud, Plus, Target, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { Dream } from '@/types/life';
import { formatCurrency } from '@/lib/utils';

export default function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
  // eslint-disable-next-line react-hooks/immutability
    fetchDreams();
  }, []);

  async function fetchDreams() {
    try {
      setLoading(true);
      const data = await api.get<Dream[]>('/dreams');
      setDreams(data);
    } catch (err) {
      console.error('Failed to fetch dreams', err);
    } finally {
      setLoading(false);
    }
  };

  async function handleAddDream() {
    const title = window.prompt("What is your new dream?");
    if (!title || !title.trim()) return;

    try {
      const newDream = await api.post<Dream>('/dreams', {
        title: title.trim(),
        priority: 'medium',
        progress: 0
      });
      setDreams([newDream, ...dreams]);
    } catch (err) {
      console.error('Failed to create dream', err);
      alert('Failed to add dream.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Dream Warehouse</h1>
          <p className="page-description">Capture your deepest aspirations and bucket list items.</p>
        </div>
        <button className="btn-primary" onClick={handleAddDream}>
          <Plus size={16} style={{ marginRight: 8 }} />
          Add Dream
        </button>
      </div>

      {loading ? (
        <div className="p-8">Loading dreams...</div>
      ) : dreams.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <Cloud size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No dreams yet</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Start by adding something you've always wanted to do or have.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {dreams.map(dream => (
            <div key={dream.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Image Header */}
              <div style={{
                height: 160,
                background: 'var(--color-bg-tertiary)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {dream.images && dream.images.length > 0 ? (
                  <img src={dream.images[0].image_url} alt={dream.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Cloud size={32} color="var(--color-text-muted)" />
                )}
                {/* Progress Overlay */}
                {dream.progress > 0 && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ height: '100%', width: `${dream.progress}%`, background: 'var(--color-accent-violet)' }} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{dream.title}</h3>
                {dream.description && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, flex: 1 }}>
                    {dream.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  {dream.estimated_cost ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13 }}>
                      <Wallet size={14} />
                      {formatCurrency(dream.estimated_cost)}
                    </div>
                  ) : <div />}
                  
                  {dream.target_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13 }}>
                      <Target size={14} />
                      {new Date(dream.target_date).getFullYear()}
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
