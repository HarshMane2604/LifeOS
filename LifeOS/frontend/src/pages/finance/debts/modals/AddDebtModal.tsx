import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import api from "@/lib/api";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

const DEBT_TYPES = [
  { value: "personal_loan", label: "Personal Loan" },
  { value: "home_loan", label: "Home Loan" },
  { value: "vehicle_loan", label: "Vehicle Loan" },
  { value: "education_loan", label: "Education Loan" },
  { value: "business_loan", label: "Business Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "bnpl", label: "BNPL" },
  { value: "borrowed", label: "Borrowed from Peer" },
  { value: "lent", label: "Lent to Peer" },
  { value: "other", label: "Other" },
];

export default function AddDebtModal({
  onClose,
  onRefresh,
  initialData,
}: {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "personal_loan",
    principal: initialData?.principal?.toString() || "",
    current_balance: initialData?.current_balance?.toString() || "",
    interest_rate: initialData?.interest_rate?.toString() || "0",
    monthly_payment: initialData?.monthly_payment?.toString() || "",
    tenure_months: "",
    start_date: initialData?.start_date
      ? initialData.start_date.split("T")[0]
      : "",
    due_date: initialData?.due_date ? initialData.due_date.split("T")[0] : "",
    contact_info: initialData?.contact_info || "",
  });
  const [noEmi, setNoEmi] = useState(
    initialData
      ? !initialData.monthly_payment ||
          parseFloat(initialData.monthly_payment) <= 0
      : false,
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: any = {
        ...formData,
        principal: parseFloat(formData.principal),
        current_balance: formData.current_balance
          ? parseFloat(formData.current_balance)
          : null,
        interest_rate: parseFloat(formData.interest_rate),
        monthly_payment: noEmi
          ? 0
          : formData.monthly_payment
            ? parseFloat(formData.monthly_payment)
            : null,
        start_date: noEmi ? null : formData.start_date || null,
        due_date: formData.due_date || null,
      };

      if (!noEmi && formData.tenure_months) {
        payload.tenure_months = parseInt(formData.tenure_months);
      }

      if (initialData) {
        await api.put(`/debts/${initialData.id}`, payload);
      } else {
        await api.post("/debts", payload);
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
        className="modal-backdrop"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      <motion.div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 500,
          padding: 24,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "3px",
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
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {initialData ? "Edit Debt / Loan" : "Add Debt / Loan"}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 8, borderRadius: "8px" }}
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="form-group borde">
            <label>Debt Name</label>
            <input
              required
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Home Loan, Alice"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <CustomSelect
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
              options={DEBT_TYPES}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div className="form-group">
              <label>Principal Amount</label>
              <input
                required
                type="number"
                step="0.01"
                className="input-field"
                value={formData.principal}
                onChange={(e) =>
                  setFormData({ ...formData, principal: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData({ ...formData, interest_rate: e.target.value })
                }
              />
            </div>
          </div>

          <div style={{ marginTop: 4, marginBottom: 4 }}>
            <CustomCheckbox
              id="noEmiCheck"
              checked={noEmi}
              onChange={setNoEmi}
              label="No EMIs (One-time settlement / No scheduled payments)"
            />
          </div>

          {!noEmi && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="form-group">
                  <label>Start Date</label>
                  <CustomDatePicker
                    value={formData.start_date}
                    onChange={(val) =>
                      setFormData({ ...formData, start_date: val })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Tenure (Months){" "}
                    <span
                      style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                    >
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.tenure_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenure_months: e.target.value,
                      })
                    }
                    placeholder="e.g., 60"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Monthly EMI{" "}
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    (Optional)
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.monthly_payment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_payment: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ borderRadius: "3px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ borderRadius: "3px" }}
            >
              <Save size={16} style={{ marginRight: 8 }} />
              {loading
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Save Debt"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
