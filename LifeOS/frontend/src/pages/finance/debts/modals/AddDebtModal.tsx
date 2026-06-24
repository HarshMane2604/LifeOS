import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import api from '@/lib/api';

export default function AddDebtModal({ onClose, onRefresh, initialData }: { onClose: () => void; onRefresh: () => void; initialData?: any }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'personal_loan',
    principal: initialData?.principal?.toString() || '',
    current_balance: initialData?.current_balance?.toString() || '',
    interest_rate: initialData?.interest_rate?.toString() || '0',
    monthly_payment: initialData?.monthly_payment?.toString() || '',
    tenure_months: '',
    start_date: initialData?.start_date ? initialData.start_date.split('T')[0] : '',
    due_date: initialData?.due_date ? initialData.due_date.split('T')[0] : '',
    contact_info: initialData?.contact_info || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: any = {
        ...formData,
        principal: parseFloat(formData.principal),
        current_balance: formData.current_balance ? parseFloat(formData.current_balance) : null,
        interest_rate: parseFloat(formData.interest_rate),
        monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null
      };

      if (formData.tenure_months) {
        payload.tenure_months = parseInt(formData.tenure_months);
      }

      if (initialData) {
        await api.put(`/debts/${initialData.id}`, payload);
      } else {
        await api.post('/debts', payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card"
        style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{initialData ? 'Edit Debt / Loan' : 'Add Debt / Loan'}</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: 8 }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Debt Name</label>
            <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Home Loan, Alice" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Type</label>
              <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="personal_loan">Personal Loan</option>
                <option value="home_loan">Home Loan</option>
                <option value="vehicle_loan">Vehicle Loan</option>
                <option value="education_loan">Education Loan</option>
                <option value="business_loan">Business Loan</option>
                <option value="credit_card">Credit Card</option>
                <option value="bnpl">BNPL</option>
                <option value="borrowed">Borrowed from Peer</option>
                <option value="lent">Lent to Peer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Info (Optional)</label>
              <input type="text" className="input-field" value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} placeholder="Phone / Email" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Principal Amount</label>
              <input required type="number" step="0.01" className="input-field" value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" className="input-field" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input type="number" step="0.01" className="input-field" value={formData.interest_rate} onChange={e => setFormData({...formData, interest_rate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Tenure (Months) <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>(Optional)</span></label>
              <input type="number" className="input-field" value={formData.tenure_months} onChange={e => setFormData({...formData, tenure_months: e.target.value})} placeholder="e.g., 60" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Monthly EMI <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>(Optional)</span></label>
              <input type="number" step="0.01" className="input-field" value={formData.monthly_payment} onChange={e => setFormData({...formData, monthly_payment: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Current Balance <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>(Optional override)</span></label>
              <input type="number" step="0.01" className="input-field" value={formData.current_balance} onChange={e => setFormData({...formData, current_balance: e.target.value})} placeholder="Auto-calculated if blank" />
            </div>
          </div>

          <div className="form-group">
            <label>Next Due Date</label>
            <input type="date" className="input-field" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Save Debt')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
