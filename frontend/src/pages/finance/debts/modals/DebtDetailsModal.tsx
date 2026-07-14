  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DebtDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debt: any;
  onClose: () => void;
}

export default function DebtDetailsModal({
  debt,
  onClose,
}: DebtDetailsModalProps) {
  const principal = debt.principal || 0;
  const currentBalance = debt.current_balance || 0;
  const monthlyPayment = debt.monthly_payment || 0;

  const paidAmount = principal - currentBalance;
  const progressPercentage = principal > 0 ? (paidAmount / principal) * 100 : 0;

  const paidEmis =
    monthlyPayment > 0 ? Math.floor(paidAmount / monthlyPayment) : 0;
  const remainingEmis =
    monthlyPayment > 0 ? Math.ceil(currentBalance / monthlyPayment) : 0;

  let calculatedEndDate = debt.end_date;
  if (!calculatedEndDate && debt.start_date && monthlyPayment > 0) {
    const totalEmis = paidEmis + remainingEmis;
    if (totalEmis > 0) {
      const d = new Date(debt.start_date);
      d.setMonth(d.getMonth() + totalEmis);
      calculatedEndDate = d.toISOString();
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      <div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 450,
          padding: 24,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--color-bg-secondary)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {debt.name} Details
          </h2>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: 6, border: "none", background: "transparent" }}
          >
            <X size={18} />
          </button>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 10,
          }}
        >
          Review the progress and details of your {debt.type.replace("_", " ")}
        </p>

        <div
          style={{
            height: 1,
            background: "var(--color-border)",
            marginBottom: 10,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div>
                <span
                  style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                >
                  Start Date:{" "}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {formatDate(debt.start_date)}
                </span>
              </div>
              <div>
                <span
                  style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                >
                  End Date:{" "}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {formatDate(calculatedEndDate)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                Remaining Amount
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {formatCurrency(currentBalance)}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  margin: 0,
                  marginTop: 4,
                }}
              >
                out of {formatCurrency(principal)}
              </p>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div
              style={{
                background: "var(--color-bg-primary)",
                padding: 16,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginBottom: 4,
                }}
              >
                Paid EMIs
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--color-accent-emerald)",
                }}
              >
                {paidEmis}
              </p>
            </div>
            <div
              style={{
                background: "var(--color-bg-primary)",
                padding: 16,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginBottom: 4,
                }}
              >
                Remaining EMIs
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--color-accent-amber)",
                }}
              >
                {remainingEmis}
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div
              className="progress-bar"
              style={{ background: "var(--color-bg-tertiary)" }}
            >
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercentage}%`,
                  background: "var(--color-accent-emerald)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}
        >
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
