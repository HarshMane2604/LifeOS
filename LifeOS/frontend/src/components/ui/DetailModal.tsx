import { X } from "lucide-react";
import React from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  children,
}: DetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 32,
          width: 400,
          height: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <hr
          style={{
            borderColor: "var(--color-border)",
            margin: "0 0 16px 0",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
