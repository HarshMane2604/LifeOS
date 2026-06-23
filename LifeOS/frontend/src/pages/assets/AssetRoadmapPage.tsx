import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Asset } from '@/types/assets';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import AssetRoadmapCanvas from '@/components/canvas/AssetRoadmapCanvas';

export default function AssetRoadmapPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchAsset(id);
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    try {
      const res = await api.get<Asset>(`/assets/${assetId}`);
      setAsset(res);
    } catch (err) {
      console.error('Failed to fetch asset', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCanvas = async (canvasData: any) => {
    if (!asset) return;
    setSaving(true);
    try {
      await api.put(`/assets/${asset.id}`, {
        roadmap_canvas_data: canvasData
      });
      // Optionally update local asset state, but the canvas handles its own state
    } catch (err) {
      console.error('Failed to save canvas', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container">Loading canvas...</div>;
  if (!asset) return <div className="page-container">Asset not found.</div>;

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
            onClick={() => navigate('/assets/tracker')}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 16, fontWeight: 600 }}>{asset.name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/ Roadmap Canvas</span></h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {saving ? 'Saving...' : 'All changes saved'}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: saving ? 'var(--color-accent-amber)' : 'var(--color-accent-emerald)' }} />
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative', background: 'var(--color-bg-primary)' }}>
        <AssetRoadmapCanvas
          initialData={asset.roadmap_canvas_data}
          onSave={handleSaveCanvas}
        />
      </div>
    </div>
  );
}
