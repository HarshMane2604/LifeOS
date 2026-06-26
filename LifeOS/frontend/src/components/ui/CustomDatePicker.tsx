import { useState, useRef, useEffect } from "react";
import {
  format,
  parseISO,
  isValid,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        (!popoverRef.current || !popoverRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateValue = value ? parseISO(value) : undefined;
  const displayValue =
    dateValue && isValid(dateValue)
      ? format(dateValue, "MMM dd, yyyy")
      : placeholder;

  // Set current month to the selected date when opened
  useEffect(() => {
    if (isOpen && value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        setCurrentMonth(parsed);
      }
    }
  }, [isOpen, value]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const toggleOpen = () => {
    if (!isOpen) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className="input-field"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            color: value
              ? "var(--color-text-primary)"
              : "var(--color-text-muted)",
          }}
        >
          {displayValue}
        </span>
        <CalendarIcon size={16} style={{ color: "var(--color-text-muted)" }} />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="glass-card"
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  zIndex: 99999,
                  padding: 12,
                  width: coords.width,
                  userSelect: "none",
                  borderRadius: "3px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <button
                    type="button"
                    onClick={prevMonth}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {format(currentMonth, "MMMM yyyy")}
                  </div>
                  <button
                    type="button"
                    onClick={nextMonth}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Weekdays */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                  }}
                >
                  {days.map((day, i) => {
                    const isSelected =
                      dateValue &&
                      isValid(dateValue) &&
                      isSameDay(day, dateValue);
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          onChange(format(day, "yyyy-MM-dd"));
                          setIsOpen(false);
                        }}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          borderRadius: "8px",
                          background: isSelected
                            ? "rgba(255, 255, 255, 0.15)"
                            : "transparent",
                          color: isSelected
                            ? "var(--color-text-primary)"
                            : isCurrentMonth
                              ? "var(--color-text-primary)"
                              : "var(--color-border-active)",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.05)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {format(day, "d")}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
