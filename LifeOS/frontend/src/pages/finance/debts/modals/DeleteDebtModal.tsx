import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function DeleteDebtModal({
  debt,
  onClose,
  onRefresh,
}: {
  debt: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/debts/${debt.id}`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'var(--color-bg-primary)',
          borderRadius: 24,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent-rose)',
            marginBottom: 16,
          }}
        >
          <Trash2 size={24} />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Delete debt?
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-muted)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          This will permanently delete the <strong>{debt.name}</strong> debt
          record. This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--color-accent-rose)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
