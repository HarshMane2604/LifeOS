import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import api from '@/lib/api';

interface RecordEMIModalProps {
  date: Date;
  activeDebts: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function RecordEMIModal({ date, activeDebts, onClose, onRefresh }: RecordEMIModalProps) {
  const [formData, setFormData] = useState({
    debt_id: activeDebts.length > 0 ? activeDebts[0].id : '',
    amount: '',
    notes: '',
    makeRecurring: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.debt_id) return;
    
    try {
      setLoading(true);
      // Record payment
      await api.post(`/debts/${formData.debt_id}/payments`, {
        amount: parseFloat(formData.amount),
        date: date.toISOString().split('T')[0],
        notes: formData.notes || null,
      });
      // In future: logic to set recurring EMI if formData.makeRecurring is true
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
        style={{ position: 'relative', width: '100%', maxWidth: 450, padding: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Record EMI Payment</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Date: {date.toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: 8, alignSelf: 'flex-start' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Select Debt</label>
            <select 
              required 
              className="input-field" 
              value={formData.debt_id} 
              onChange={e => setFormData({...formData, debt_id: e.target.value})}
            >
              <option value="" disabled>Select a loan or debt...</option>
              {activeDebts.map(d => (
                <option key={d.id} value={d.id}>{d.name} (Outstanding: ₹{d.current_balance})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount Paid (₹)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              className="input-field" 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              placeholder="e.g. Extra principal payment"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input 
              type="checkbox" 
              id="recurringCheck"
              checked={formData.makeRecurring}
              onChange={e => setFormData({...formData, makeRecurring: e.target.checked})}
              style={{ width: 16, height: 16, accentColor: 'var(--color-accent-violet)' }}
            />
            <label htmlFor="recurringCheck" style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
              Make this a recurring EMI on this date
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} style={{ marginRight: 8 }} />
              {loading ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
