import React from "react";

export interface Transaction {
  id: string | number;
  title: string;
  subtitle: string;
  amount: string;
  amountColor?: string;
  amountPrefix?: string;
  icon?: React.ReactNode;
}

interface TransactionListProps {
  transactions: Transaction[];
  emptyMessage?: string;
}

export default function TransactionList({
  transactions,
  emptyMessage = "No transactions found.",
}: TransactionListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {transactions.map((tx, index) => (
        <div
          key={tx.id || index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {tx.icon && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {tx.icon}
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {tx.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                {tx.subtitle}
              </div>
            </div>
          </div>
          <div
            className="font-mono-financial"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: tx.amountColor || "var(--color-text-primary)",
            }}
          >
            {tx.amountPrefix || ""}
            {tx.amount}
          </div>
        </div>
      ))}
      {transactions.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: 13,
            paddingTop: 10,
          }}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
