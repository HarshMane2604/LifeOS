import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

function useOutsideClick(ref: any, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
}

export default function CustomSelect({
  value,
  onChange,
  options,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setIsOpen(false));

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Select...";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="input-field"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          padding: "10px 14px",
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--color-text-muted)",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="glass-card"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              zIndex: 50,
              padding: "8px 0",
              maxHeight: 250,
              overflowY: "auto",
              borderRadius: "8px",
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  color:
                    value === option.value
                      ? "var(--color-text-primary)"
                      : "var(--color-text-muted)",
                  background: "transparent",
                  transition: "background 0.1s, color 0.1s",
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "var(--color-bg-secondary)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color =
                    value === option.value
                      ? "var(--color-text-primary)"
                      : "var(--color-text-muted)";
                }}
              >
                {option.label}
                {value === option.value && (
                  <Check
                    size={16}
                    style={{ color: "var(--color-text-primary)" }}
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
