import { useState } from "react";
import { X } from "lucide-react";

interface RecordEMIModalProps {
  date: Date;
  activeDebts: any[];
  calendarData?: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function RecordEMIModal({
  date,
  activeDebts,
  calendarData = [],
  onClose,
}: RecordEMIModalProps) {
  // Find events for this date
  const eventsOnDate = calendarData.filter((e: any) => {
    const eDate = new Date(e.date);
    return (
      eDate.getFullYear() === date.getFullYear() &&
      eDate.getMonth() === date.getMonth() &&
      eDate.getDate() === date.getDate()
    );
  });

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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Scheduled EMIs</h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                marginTop: 4,
              }}
            >
              Date:{" "}
              {date.toLocaleDateString("default", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: 8, alignSelf: "flex-start" }}
          >
            <X size={16} />
          </button>
        </div>

        {eventsOnDate.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {eventsOnDate.map((event: any, i: number) => {
              const debt = activeDebts.find((d) => d.id === event.debt_id);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {debt ? debt.name : event.title.replace("EMI: ", "")}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {event.status === "paid"
                        ? "Paid"
                        : event.status === "overdue"
                          ? "Overdue"
                          : "Upcoming"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    ₹{event.amount}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14,
              background: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            No EMIs scheduled on this date.
          </div>
        )}
      </div>
    </div>
  );
}
