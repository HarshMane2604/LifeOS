import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
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

          <div
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
              borderRadius: 3,
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
              Delete {itemType}?
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-muted)',
                marginBottom: 24,
                lineHeight: 1.5,
              }}
            >
              This will permanently delete the <strong>{itemName}</strong> {itemType}{" "}
              record. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button
                onClick={onClose}
                disabled={loading}
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
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
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
          </div>
        </div>
      )}
    </>
  );
}
