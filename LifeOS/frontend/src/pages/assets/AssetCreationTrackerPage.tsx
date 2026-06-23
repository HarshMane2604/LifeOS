import { useState, useEffect } from 'react';
import { Asset } from '@/types/assets';
import api from '@/lib/api';
import { Plus, ListTodo, MoreVertical, PlayCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router';

export default function AssetCreationTrackerPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'business',
    status: 'planning',
    expected_value: '',
    expected_monthly_income: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get<Asset[]>('/assets');
      setAssets(res);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (addAnother: boolean) => {
    if (!formData.name.trim()) {
      alert("Asset name is required.");
      return;
    }

    try {
      const newAsset = await api.post<Asset>('/assets', {
        name: formData.name.trim(),
        category: formData.category,
        status: formData.status,
        expected_cost: 0,
        expected_value: Number(formData.expected_value) || 0,
        expected_monthly_income: Number(formData.expected_monthly_income) || 0,
        priority: 'medium',
        scalability: 5
      });
      setAssets([newAsset, ...assets]);

      if (addAnother) {
        setFormData({
          name: '',
          category: 'business',
          status: 'planning',
          expected_value: '',
          expected_monthly_income: ''
        });
      } else {
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to add asset', err);
      alert('Failed to add asset');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'generating_income':
      case 'completed':
        return <span className="badge badge-emerald">Active</span>;
      case 'in_progress':
      case 'under_development':
        return <span className="badge badge-violet">Building</span>;
      case 'planning':
      case 'research':
        return <span className="badge badge-amber">Planning</span>;
      default:
        return <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Asset Creation Tracker</h1>
          <p className="page-description">Manage the lifecycle of your assets from planning to active income generation.</p>
        </div>
        <button className="btn-primary" style={{ borderRadius: '3px' }} onClick={() => {
          setFormData({
            name: '',
            category: 'business',
            status: 'planning',
            expected_value: '',
            expected_monthly_income: ''
          });
          setIsModalOpen(true);
        }}>
          <Plus size={16} style={{ marginRight: 8 }} />
          New Asset
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : assets.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>No Assets Tracked</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Promote an idea from the vault or create a new asset directly.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '3px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Est. Value</th>
                <th>Income /mo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{asset.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {asset.target_completion_date ? `Target: ${new Date(asset.target_completion_date).toLocaleDateString()}` : 'No target date'}
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{asset.category}</td>
                  <td>{getStatusBadge(asset.status)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(asset.expected_value)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: asset.actual_monthly_income > 0 ? 'var(--color-accent-emerald)' : 'inherit' }}>
                    {formatCurrency(asset.actual_monthly_income)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 12, borderRadius: '3px' }}
                        onClick={() => navigate(`/assets/${asset.id}/roadmap`)}
                        title="View Infinite Canvas Roadmap"
                      >
                        <ListTodo size={14} style={{ marginRight: 6 }} />
                        Roadmap
                      </button>
                      <button className="btn-secondary" style={{ padding: 6, borderRadius: '3px' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Asset Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 480, padding: 24, borderRadius: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Add New Asset</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>Asset Name</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ borderRadius: 0 }}
                  placeholder="e.g., SaaS Product"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>Category</label>
                  <select
                    className="input-field"
                    style={{ borderRadius: 0 }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="financial">💰 Financial</option>
                    <option value="business">💼 Business</option>
                    <option value="physical">🏠 Physical</option>
                    <option value="personal">🧠 Personal</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>Status</label>
                  <select
                    className="input-field"
                    style={{ borderRadius: 0 }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="idea">💡 Idea</option>
                    <option value="research">🔍 Research</option>
                    <option value="planning">📝 Planning</option>
                    <option value="in_progress">🚧 In Progress</option>
                    <option value="under_development">⚙️ Under Development</option>
                    <option value="acquired">🛒 Acquired</option>
                    <option value="active">⚡ Active</option>
                    <option value="generating_income">💸 Generating Income</option>
                    <option value="completed">✅ Completed</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>Est. Value (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ borderRadius: 0 }}
                    placeholder="0"
                    value={formData.expected_value}
                    onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--color-text-muted)' }}>Income / Month (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ borderRadius: 0 }}
                    placeholder="0"
                    value={formData.expected_monthly_income}
                    onChange={(e) => setFormData({ ...formData, expected_monthly_income: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid var(--color-border)'
            }}>
              <button
                className="btn-secondary"
                style={{ borderRadius: 5 }}
                onClick={() => handleAddAsset(true)}
              >
                Add Another
              </button>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-secondary"
                  style={{ borderRadius: 5 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ borderRadius: 5 }}
                  onClick={() => handleAddAsset(false)}
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
