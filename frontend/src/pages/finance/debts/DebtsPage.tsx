import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  Calendar as CalendarIcon,
  BarChart3,
  Trophy,
  Activity,
  Wallet,
  Plus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronLeft,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
  Home,
  Car,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
  CheckCircle2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowRight,
  Map,
} from "lucide-react";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import AddDebtModal from "./modals/AddDebtModal";
import RecordEMIModal from "./modals/RecordEMIModal";
import DebtDetailsModal from "./modals/DebtDetailsModal";
import DeleteDebtModal from "./modals/DeleteDebtModal";
import EMICalendar from "@/components/ui/EMICalendar";

interface DebtAnalytics {
  total_debt: number;
  monthly_emi: number;
  total_interest_remaining: number;
  debt_free_progress: number;
  health_score: number;
  active_debts_count: number;
}

export default function DebtsPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debts, setDebts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<DebtAnalytics | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [strategy, setStrategy] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [method, setMethod] = useState<"snowball" | "avalanche">("snowball");
  const [showAddModal, setShowAddModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showEditModal, setShowEditModal] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showDeleteModal, setShowDeleteModal] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debt: any;
  } | null>(null);
  const [selectedEmiDate, setSelectedEmiDate] = useState<Date | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDebtDetails, setSelectedDebtDetails] = useState<any>(null);
  const [showUpcomingEmis, setShowUpcomingEmis] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [debtsRes, analyticsRes, strategyRes, calendarRes] =
        await Promise.all([
          api.get("/debts"),
          api.get("/debts/analytics"),
          api.get("/debts/strategy"),
          api.get("/debts/calendar"),
        ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDebts(debtsRes as any[]);
      setAnalytics(analyticsRes as DebtAnalytics);
      setStrategy(strategyRes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCalendarData((calendarRes as any).calendar || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   
  // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading || !analytics || !strategy)
    return <div style={{ padding: 24 }}>Loading Dashboard...</div>;

  const currentPlan =
    method === "snowball" ? strategy.snowball : strategy.avalanche;
  const activeDebts = debts.filter(
    (d) => d.status === "active" && !["lent", "borrowed"].includes(d.type),
  );

  const donutData = [
    { name: "Completed", value: analytics.debt_free_progress },
    { name: "Remaining", value: 100 - analytics.debt_free_progress },
  ];

  const getDebtIcon = (type: string) => {
    if (type.includes("home"))
      return <Home size={20} color="var(--color-text-primary)" />;
    if (type.includes("vehicle"))
      return <Car size={20} color="var(--color-text-primary)" />;
    return <CreditCard size={20} color="var(--color-text-primary)" />;
  };

  return (
    <div
      className="page-container"
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div>
          <h1
            className="page-title"
            style={{ fontSize: 18, marginBottom: 0, lineHeight: 1.2 }}
          >
            Debt Management
          </h1>
          <p
            className="page-description"
            style={{ fontSize: 12, marginBottom: 0, marginTop: 4 }}
          >
            Plan, prioritize and pay off your debts faster with the right
            strategy.
          </p>
        </div>

        {/* Upcoming EMIs Popover */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUpcomingEmis(!showUpcomingEmis)}
            style={{
              padding: "8px 16px",
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-bg-tertiary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-bg-secondary)")
            }
          >
            <CalendarIcon size={16} className="text-emerald-500" />
            Upcoming EMIs
          </button>

          {showUpcomingEmis && (
            <div
              className="glass-card popover-anim"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: 350,
                padding: 16,
                zIndex: 50,
                border: "1px solid var(--color-border)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                borderRadius: "3px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                  Upcoming EMIs
                </h3>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {calendarData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((item: any) => item.status === "upcoming")
   
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((item: any, idx: number) => {
                  const isPaid = false;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--color-text-muted)",
                          width: 60,
                        }}
                      >
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Home size={12} className="text-emerald-500" />
                      </div>
                      <div style={{ flex: 1, paddingLeft: 12 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {item.title.replace("EMI: ", "")}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                            margin: 0,
                          }}
                        >
                          Bank
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          className="font-mono-financial"
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </div>
                        <div style={{ display: "inline-block", marginTop: 4 }}>
                          {isPaid ? (
                            <span
                              className="badge badge-emerald"
                              style={{ fontSize: 10 }}
                            >
                              Paid ✔
                            </span>
                          ) : (
                            <span
                              className="badge badge-amber"
                              style={{ fontSize: 10 }}
                            >
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {calendarData.length === 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    No upcoming EMIs.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="metric-card kpi-1">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Total Debt
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-emerald-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-emerald)",
              }}
            >
              <Wallet size={16} />
            </div>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(analytics.total_debt)}
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Across {analytics.active_debts_count} active debts
          </p>
        </div>

        <div className="metric-card kpi-2">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Monthly EMI
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-cyan-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-cyan)",
              }}
            >
              <CalendarIcon size={16} />
            </div>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(analytics.monthly_emi)}
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Total monthly obligation
          </p>
        </div>

        <div className="metric-card kpi-3">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Total Interest
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-emerald-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-emerald)",
              }}
            >
              <BarChart3 size={16} />
            </div>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(analytics.total_interest_remaining)}
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Remaining interest
          </p>
        </div>

        <div className="metric-card kpi-4">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Debt Free By
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-amber-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-amber)",
              }}
            >
              <Trophy size={16} />
            </div>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            Dec 2028
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            With current plan
          </p>
        </div>

        <div className="metric-card kpi-5">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Health Score
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-rose-glow)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-rose)",
              }}
            >
              <Activity size={16} />
            </div>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-accent-rose)",
              marginBottom: 4,
            }}
          >
            {analytics.health_score}/100
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Very Good
          </p>
        </div>
        {/* Left Column (1 box) */}
        <div className="main-col-1">
          {/* Strategy Selection */}
          <div style={{ display: "flex", gap: 12 }}>
            <div
              onClick={() => setMethod("snowball")}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: "var(--radius-lg)",
                border:
                  method === "snowball"
                    ? "2px solid var(--color-text-muted)"
                    : "1px solid var(--color-border)",
                background:
                  method === "snowball"
                    ? "var(--color-bg-secondary)"
                    : "var(--color-bg-primary)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border:
                      method === "snowball"
                        ? "5px solid var(--color-text-muted)"
                        : "1px solid var(--color-border)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color:
                      method === "snowball"
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                  }}
                >
                  Snowball Method
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Pay smallest debt first to build momentum.
              </p>
            </div>

            <div
              onClick={() => setMethod("avalanche")}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: "var(--radius-lg)",
                border:
                  method === "avalanche"
                    ? "2px solid var(--color-text-muted)"
                    : "1px solid var(--color-border)",
                background:
                  method === "avalanche"
                    ? "var(--color-bg-secondary)"
                    : "var(--color-bg-primary)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border:
                      method === "avalanche"
                        ? "5px solid var(--color-text-muted)"
                        : "1px solid var(--color-border)",
                  }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color:
                      method === "avalanche"
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                  }}
                >
                  Avalanche Method
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Pay highest interest debt first to save more.
              </p>
            </div>
          </div>

          {/* Recommended Order */}
          <div
            className="glass-card"
            style={{
              padding: 20,
              background: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Trophy size={16} color="var(--color-text-muted)" />
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                Recommended Order (
                {method === "snowball" ? "Snowball" : "Avalanche"})
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  fontWeight: 600,
                }}
              >
                <span>Order</span>
                <span>Est. Debt Free Date</span>
              </div>
              <div
                className="custom-scrollbar"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: 120,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {currentPlan.map((d: any, i: number) => (
                  <div
                    key={d.id}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        background: "var(--color-bg-tertiary)",
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      Dec 2028
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={14} /> You will save ₹1,18,400 in interest
              </div>
            </div>
          </div>

          {/* Debt Free Progress */}
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Debt Free Progress
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 120, height: 120, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      stroke="none"
                      dataKey="value"
                    >
                      <Cell fill="var(--color-text-muted)" />
                      <Cell fill="var(--color-bg-tertiary)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {Math.round(analytics.debt_free_progress)}%
                  </span>
                  <span
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    Completed
                  </span>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                    Paid Till Date
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {formatCurrency(
                      debts.reduce(
                        (s, d) => s + (d.principal - d.current_balance),
                        0,
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                    Remaining Debt
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {formatCurrency(analytics.total_debt)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                    Target Date
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    Dec 2028
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-accent-emerald)",
                }}
              >
                On Track
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                4 yrs 7 mos left ⏱
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column (2 boxes) */}
        <div
          className="glass-card main-col-2"
          style={{ padding: 24 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Active Debts</h3>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "6px 12px",
                color: "var(--color-text-primary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-tertiary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-secondary)")
              }
            >
              <Plus size={14} className="text-emerald-500" /> Add Debt
            </button>
          </div>

          <div
            className="custom-scrollbar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 520,
              overflowY: "auto",
              paddingRight: 8,
            }}
          >
            {activeDebts.map((d) => {
              const paidProgress =
                d.principal > 0
                  ? ((d.principal - d.current_balance) / d.principal) * 100
                  : 0;
              return (
                <div
                  key={d.id}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  onClick={(e) => {
                    if (contextMenu) return;
                    setSelectedDebtDetails(d);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, debt: d });
                  }}
                  style={{
                    padding: 16,
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-bg-primary)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getDebtIcon(d.type)}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <h4
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {d.name}
                          </h4>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {d.type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="font-mono-financial"
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {formatCurrency(d.current_balance)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          marginTop: 4,
                        }}
                      >
                        Outstanding
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--color-border)"
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--color-text-muted)" }}>
                      <span>{Math.round(paidProgress)}% Paid</span>
                      <span>EMI: {formatCurrency(d.monthly_payment || 0)}</span>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: 11, borderRadius: "5px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/finance/debts/${d.id}/plan`);
                      }}
                    >
                      <Map size={12} style={{ marginRight: 4 }} />
                      Plan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 boxes) */}
        <div className="main-col-3">
          {/* Calendar */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>EMI Calendar</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-accent-emerald)",
                    }}
                  />{" "}
                  Paid
                </span>
                <span
                  style={{
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-accent-amber)",
                    }}
                  />{" "}
                  Upcoming
                </span>
                <span
                  style={{
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-accent-rose)",
                    }}
                  />{" "}
                  Overdue
                </span>
              </div>
            </div>

            {/* Custom Dynamic Calendar */}
            <EMICalendar
              events={calendarData}
              onDateClick={(d) => setSelectedEmiDate(d)}
            />
          </div>

          {/* Upcoming EMIs removed and moved to Popover in header */}
        </div>
      </div>

      {/* Bottom Bar */}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            padding: 4,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            minWidth: 120,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setShowEditModal(contextMenu.debt);
              setContextMenu(null);
            }}
            style={{
              padding: "8px 12px",
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 4,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-border)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Edit
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(contextMenu.debt);
              setContextMenu(null);
            }}
            style={{
              padding: "8px 12px",
              textAlign: "left",
              background: "transparent",
              border: "none",
              color: "var(--color-accent-rose)",
              fontSize: 13,
              cursor: "pointer",
              borderRadius: 4,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-bg-tertiary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Delete
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddDebtModal
          onClose={() => setShowAddModal(false)}
          onRefresh={fetchData}
        />
      )}
      {showEditModal && (
        <AddDebtModal
          initialData={showEditModal}
          onClose={() => setShowEditModal(null)}
          onRefresh={fetchData}
        />
      )}
      {showDeleteModal && (
        <DeleteDebtModal
          debt={showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          onRefresh={fetchData}
        />
      )}
      {selectedEmiDate && (
        <RecordEMIModal
          date={selectedEmiDate}
          activeDebts={activeDebts}
          calendarData={calendarData}
          onClose={() => setSelectedEmiDate(null)}
          onRefresh={fetchData}
        />
      )}
      {selectedDebtDetails && (
        <DebtDetailsModal
          debt={selectedDebtDetails}
          onClose={() => setSelectedDebtDetails(null)}
        />
      )}
    </div>
  );
}
