/**
 * Income Page — track income sources with analytics
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Briefcase,
  BarChart2,
  Star,
  Layers,
  Activity,
  Calendar as CalendarIcon,
  Filter,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import DetailModal from "@/components/ui/DetailModal";

interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  category: string;
  income_type: string;
  is_recurring: boolean;
  notes: string | null;
}
interface Analytics {
  total_this_month: number;
  total_this_year: number;
  monthly_average: number;
  highest_month: { year: number; month: number; total: number };
  active_sources: number;
  passive_income: number;
  active_vs_passive: Array<{ name: string; total: number }>;
  active_vs_passive_trend: Array<{
    year: number;
    month: number;
    Active: number;
    Passive: number;
  }>;
  by_source: Array<{ name: string; total: number }>;
  monthly_trend: Array<{ year: number; month: number; total: number }>;
}

const COLORS = [
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#ec4899",
  "#3b82f6",
];
const CATEGORIES = [
  "salary",
  "freelancing",
  "consulting",
  "business",
  "rental_income",
  "dividend",
  "interest",
  "mutual_fund",
  "stock_profit",
  "youtube",
  "course_sales",
  "affiliate_marketing",
  "royalties",
  "pension",
  "cashback",
  "refund",
  "gift",
  "other",
];

const getIncomeIcon = (category: string) => {
  if (category === "salary")
    return <Briefcase size={16} className="text-emerald-500" />;
  if (category === "freelancing" || category === "business")
    return <Briefcase size={16} className="text-cyan-500" />;
  if (category === "investments")
    return <BarChart2 size={16} className="text-violet-500" />;
  return <Layers size={16} className="text-amber-500" />;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(
    null,
  );
  const [overviewTimeframe, setOverviewTimeframe] = useState("this_month");

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (currentDate.getMonth() + 1).toString(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear(),
  );

  const [editing, setEditing] = useState<Income | null>(null);
  const [form, setForm] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "salary",
    income_type: "Active",
    is_recurring: false,
    notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const queryParams =
        selectedMonth === "overall"
          ? "?timeframe=overall"
          : `?month=${selectedMonth}&year=${selectedYear}`;

      const [inc, ana] = await Promise.all([
        api.get<Income[]>(`/incomes${queryParams}`),
        api.get<Analytics>(`/incomes/analytics${queryParams}`),
      ]);
      setIncomes(inc);
      setAnalytics(ana);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [selectedMonth, selectedYear]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      source: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "salary",
      income_type: "Active",
      is_recurring: false,
      notes: "",
    });
    setShowModal(true);
  };
  const openEdit = (inc: Income) => {
    setEditing(inc);
    setForm({
      source: inc.source,
      amount: String(inc.amount),
      date: inc.date,
      category: inc.category,
      income_type: inc.income_type,
      is_recurring: inc.is_recurring,
      notes: inc.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      source: form.source,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      income_type: form.income_type,
      is_recurring: form.is_recurring,
      notes: form.notes || null,
    };
    try {
      if (editing) await api.put(`/incomes/${editing.id}`, payload);
      else await api.post("/incomes", payload);
      setShowModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this income?")) return;
    await api.delete(`/incomes/${id}`);
    fetchAll();
  };

  const a = analytics;
  const monthlyData = useMemo(() => {
    return (a?.monthly_trend || []).map((t) => ({
      name: `${MONTH_NAMES[t.month - 1]}`,
      total: t.total,
    }));
  }, [a]);

  const activeVsPassiveData = useMemo(() => {
    return a?.active_vs_passive || [];
  }, [a]);

  const activeVsPassiveTrendData = useMemo(() => {
    return (a?.active_vs_passive_trend || []).map((t) => ({
      name: `${MONTH_NAMES[t.month - 1]}`,
      Active: t.Active,
      Passive: t.Passive,
    }));
  }, [a]);

  const highestMonthDisplay = useMemo(() => {
    if (!a?.highest_month || !a.highest_month.month) return "N/A";
    const fullMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `in ${fullMonths[a.highest_month.month - 1]} ${a.highest_month.year}`;
  }, [a]);

  const renderDetailModalContent = () => {
    if (activeDetailModal === "total_income") {
      const grouped = incomes.reduce(
        (acc, curr) => {
          acc[curr.source] = (acc[curr.source] || 0) + curr.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([source, amt], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500 }}>{source}</span>
              <span
                className="font-mono-financial"
                style={{ color: "var(--color-text-muted)" }}
              >
                {formatCurrency(amt)}
              </span>
            </div>
          ))}
          <hr style={{ borderColor: "var(--color-border)", margin: "8px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <span>Total</span>
            <span className="font-mono-financial">
              {formatCurrency(a?.total_this_month || 0)}
            </span>
          </div>
        </div>
      );
    }
    if (activeDetailModal === "monthly_average") {
      return (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-muted)",
              marginBottom: 16,
            }}
          >
            Monthly Average
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "var(--color-accent-cyan)",
            }}
          >
            {formatCurrency(a?.monthly_average || 0)}
          </h2>
        </div>
      );
    }
    if (activeDetailModal === "highest_month") {
      return (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-muted)",
              marginBottom: 16,
            }}
          >
            The highest amount you earned was
          </p>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              margin: "0",
              color: "var(--color-accent-violet)",
            }}
          >
            {formatCurrency(a?.highest_month?.total || 0)}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-muted)",
              marginTop: 16,
            }}
          >
            {highestMonthDisplay}
          </p>
        </div>
      );
    }
    if (activeDetailModal === "active_sources") {
      const activeIncomes = incomes.filter((i) => i.income_type === "Active");
      const grouped = activeIncomes.reduce(
        (acc, curr) => {
          acc[curr.source] = (acc[curr.source] || 0) + curr.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([source, amt], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500 }}>{source}</span>
              <span
                className="font-mono-financial"
                style={{ color: "var(--color-text-muted)" }}
              >
                {formatCurrency(amt)}
              </span>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-muted)" }}
            >
              No active sources.
            </p>
          )}
        </div>
      );
    }
    if (activeDetailModal === "passive_income") {
      const passiveIncomes = incomes.filter((i) => i.income_type === "Passive");
      const grouped = passiveIncomes.reduce(
        (acc, curr) => {
          acc[curr.source] = (acc[curr.source] || 0) + curr.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([source, amt], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500 }}>{source}</span>
              <span
                className="font-mono-financial"
                style={{ color: "var(--color-text-muted)" }}
              >
                {formatCurrency(amt)}
              </span>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-muted)" }}
            >
              No passive sources.
            </p>
          )}
          {Object.keys(grouped).length > 0 && (
            <>
              <hr
                style={{ borderColor: "var(--color-border)", margin: "8px 0" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                <span>Total Passive Income</span>
                <span className="font-mono-financial">
                  {formatCurrency(a?.passive_income || 0)}
                </span>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const getModalTitle = () => {
    switch (activeDetailModal) {
      case "total_income":
        return selectedMonth === "overall"
          ? "Total Income"
          : "Total This Month";
      case "monthly_average":
        return "Monthly Average";
      case "highest_month":
        return "Highest Month";
      case "active_sources":
        return "Active Sources";
      case "passive_income":
        return "Passive Income";
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            Income Dashboard
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 13,
              margin: 0,
            }}
          >
            Track all your income sources, growth, and insights.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ width: 140 }}>
            <CustomSelect
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              options={[
                { value: "overall", label: "Overall" },
                ...MONTH_NAMES.map((m, i) => ({
                  value: (i + 1).toString(),
                  label: `${m} ${selectedYear}`,
                })),
              ]}
            />
          </div>
          <button
            className="btn-secondary"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            <Filter size={14} /> Filter
          </button>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            <Plus size={16} /> Add Income
          </motion.button>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          className="metric-card"
          onClick={() => setActiveDetailModal("total_income")}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              {selectedMonth === "overall"
                ? "Total Income"
                : "Total This Month"}
            </p>
            <Briefcase size={18} color="var(--color-accent-emerald)" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(a?.total_this_month || 0)}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-accent-emerald)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <TrendingUp size={12} /> +18.6%{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              vs last month
            </span>
          </p>
        </div>

        <div
          className="metric-card"
          onClick={() => setActiveDetailModal("monthly_average")}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              Monthly Average
            </p>
            <BarChart2 size={18} color="var(--color-accent-cyan)" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(a?.monthly_average || 0)}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-accent-emerald)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <TrendingUp size={12} /> +12.3%{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              vs last month
            </span>
          </p>
        </div>

        <div
          className="metric-card"
          onClick={() => setActiveDetailModal("highest_month")}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              Highest Month
            </p>
            <Star size={18} color="var(--color-accent-violet)" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(a?.highest_month?.total || 0)}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CalendarIcon size={12} /> {highestMonthDisplay}
          </p>
        </div>

        <div
          className="metric-card"
          onClick={() => setActiveDetailModal("active_sources")}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              Active Sources
            </p>
            <Layers size={18} color="var(--color-accent-amber)" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {a?.active_sources || 0}
          </h2>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Income sources
          </p>
        </div>

        <div
          className="metric-card"
          onClick={() => setActiveDetailModal("passive_income")}
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              Passive Income
            </p>
            <Activity size={18} color="var(--color-accent-blue)" />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            {formatCurrency(a?.passive_income || 0)}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-accent-emerald)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <TrendingUp size={12} /> +9.2%{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              vs last month
            </span>
          </p>
        </div>
      </div>

      {/* Analytics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Income Overview Line Chart */}
        <div
          className="glass-card"
          style={{ padding: 24, gridColumn: "span 2", minWidth: 0 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Income Overview</h3>
            <div style={{ width: 130 }}>
              <CustomSelect
                value={overviewTimeframe}
                onChange={setOverviewTimeframe}
                options={[
                  { value: "this_month", label: "This Month" },
                  { value: "this_year", label: "This Year" },
                ]}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Income (₹)
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {formatCurrency(a?.total_this_month || 0)}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-accent-emerald)" }}>
              +18.6%{" "}
              <span style={{ color: "var(--color-text-muted)" }}>
                vs last month
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-accent-emerald)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-accent-emerald)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income by Source Donut */}
        <div
          className="glass-card"
          style={{
            padding: 24,
            position: "relative",
            gridColumn: "span 1",
            minWidth: 0,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Income by Source
          </h3>
          <div
            style={{
              height: 180,
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={a?.by_source || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="total"
                  stroke="none"
                >
                  {(a?.by_source || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-tertiary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {formatCurrency(a?.total_this_month || 0)}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                Total Income
              </div>
            </div>
          </div>
          {/* Legend */}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {(a?.by_source || []).slice(0, 4).map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                  <span
                    style={{
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 60,
                    }}
                  >
                    {s.name.replace("_", " ")}
                  </span>
                </div>
                <span className="font-mono-financial">
                  {formatCurrency(s.total)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span
              onClick={() => setShowCategoryModal(true)}
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              View all →
            </span>
          </div>
        </div>

        {/* Active vs Passive Bar Chart */}
        <div
          className="glass-card"
          style={{ padding: 24, gridColumn: "span 2", minWidth: 0 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>
              Active vs Passive Income
            </h3>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Active
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-accent-emerald)",
                }}
              >
                {formatCurrency(
                  activeVsPassiveData.find((d) => d.name === "Active")?.total ||
                    0,
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Passive
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-accent-blue)",
                }}
              >
                {formatCurrency(
                  activeVsPassiveData.find((d) => d.name === "Passive")
                    ?.total || 0,
                )}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={activeVsPassiveTrendData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-text-muted)"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  background: "var(--color-bg-tertiary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="Active"
                fill="var(--color-accent-emerald)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="Passive"
                fill="var(--color-accent-blue)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
      >
        {/* Income Sources Table */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gridColumn: "span 3",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Income Sources</h3>
          </div>
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: 310,
              flex: 1,
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th style={{ textAlign: "right" }}>This Month</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length > 0 ? (
                  incomes.map((inc) => {
                    const type = inc.income_type;
                    let badgeClass = "badge-amber";
                    if (type === "Active") badgeClass = "badge-emerald";
                    if (type === "Passive") badgeClass = "badge-violet";

                    return (
                      <tr key={inc.id}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "var(--radius-md)",
                                background: "var(--color-bg-tertiary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {getIncomeIcon(inc.category)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13,
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {inc.source}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-muted)",
                                  textTransform: "capitalize",
                                }}
                              >
                                {inc.category.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{type}</span>
                        </td>
                        <td
                          style={{
                            fontSize: 13,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {inc.is_recurring ? "Monthly" : "One-time"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className="font-mono-financial"
                            style={{ fontWeight: 600, fontSize: 14 }}
                          >
                            {formatCurrency(inc.amount)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => openEdit(inc)}
                            style={{
                              padding: 6,
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {loading ? "Loading..." : "No income sources yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div
            style={{ padding: 12, borderTop: "1px solid var(--color-border)" }}
          >
            <button
              onClick={openAdd}
              className="btn-ghost"
              style={{ width: "100%", color: "var(--color-text-secondary)" }}
            >
              <Plus size={16} /> Add Income Source
            </button>
          </div>
        </div>

        {/* Recent Incomes */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gridColumn: "span 2",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Incomes</h3>
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              View All
            </span>
          </div>
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              maxHeight: 310,
              overflowY: "auto",
            }}
          >
            {incomes.map((inc) => (
              <div
                key={inc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getIncomeIcon(inc.category)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {inc.source}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      {formatDate(inc.date)}
                    </div>
                  </div>
                </div>
                <div
                  className="font-mono-financial"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-accent-emerald)",
                  }}
                >
                  +{formatCurrency(inc.amount)}
                </div>
              </div>
            ))}
            {incomes.length === 0 && !loading && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: 13,
                  marginTop: 20,
                }}
              >
                No recent incomes
              </div>
            )}
          </div>
          <div
            style={{
              padding: 12,
              borderTop: "1px solid var(--color-border)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              View all transactions →
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: 32 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {editing ? "Edit Income" : "Add Income"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
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
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Source
                  </label>
                  <input
                    type="text"
                    value={form.source}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source: e.target.value }))
                    }
                    className="input-field"
                    placeholder="e.g., Company Name"
                    required
                    id="income-source"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      className="input-field"
                      placeholder="0.00"
                      required
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      id="income-amount"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      Date
                    </label>
                    <CustomDatePicker
                      value={form.date}
                      onChange={(val) => setForm((f) => ({ ...f, date: val }))}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Category
                  </label>
                  <CustomSelect
                    value={form.category}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, category: val }))
                    }
                    options={CATEGORIES.map((c) => ({
                      value: c,
                      label: c
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" "),
                    }))}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Income Type
                  </label>
                  <CustomSelect
                    value={form.income_type}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, income_type: val }))
                    }
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Passive", label: "Passive" },
                    ]}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.is_recurring}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_recurring: e.target.checked }))
                    }
                    id="income-recurring"
                  />
                  <label
                    htmlFor="income-recurring"
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    This is a recurring income
                  </label>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Additional notes..."
                    rows={2}
                    style={{ resize: "vertical" }}
                    id="income-notes"
                  />
                </div>
                {editing && (
                  <div style={{ textAlign: "right", marginTop: -8 }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(editing.id)}
                      style={{
                        color: "var(--color-accent-rose)",
                        fontSize: 12,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Delete this record
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    id="income-submit"
                  >
                    {editing ? "Save Changes" : "Add Income"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: 32, maxWidth: 400 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  Income by Source
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
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

              <div
                style={{
                  height: 180,
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={a?.by_source || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="total"
                      stroke="none"
                    >
                      {(a?.by_source || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-bg-tertiary)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {formatCurrency(a?.total_this_month || 0)}
                  </div>
                  <div
                    style={{ fontSize: 10, color: "var(--color-text-muted)" }}
                  >
                    {selectedMonth === "overall"
                      ? "Total Income"
                      : "Total This Month"}
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {(a?.by_source || []).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "var(--color-bg-secondary)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {s.name.replace("_", " ")}
                      </span>
                    </div>
                    <span
                      className="font-mono-financial"
                      style={{
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {formatCurrency(s.total)}
                    </span>
                  </div>
                ))}
                {(!a?.by_source || a.by_source.length === 0) && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    No income sources found.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DetailModal
        isOpen={!!activeDetailModal}
        onClose={() => setActiveDetailModal(null)}
        title={getModalTitle()}
      >
        {renderDetailModalContent()}
      </DetailModal>
    </div>
  );
}
