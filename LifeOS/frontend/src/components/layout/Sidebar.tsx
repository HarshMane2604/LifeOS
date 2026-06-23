/**
 * Sidebar Navigation — LifeOS main navigation panel
 */

import { NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  CreditCard,
  PieChart,
  Target,
  Lightbulb,
  Flag,
  Sparkles,
  FolderKanban,
  Brain,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Layers,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Command Center' },
    ],
  },
  {
    label: 'Financial OS',
    items: [
      { to: '/finance/expenses', icon: Wallet, label: 'Expenses' },
      { to: '/finance/income', icon: TrendingUp, label: 'Income' },
      { to: '/finance/debts', icon: CreditCard, label: 'Debts' },
      { to: '/finance/investments', icon: PieChart, label: 'Investments' },
      { to: '/finance/net-worth', icon: BarChart3, label: 'Net Worth' },
      { to: '/finance/goals', icon: Target, label: 'Financial Goals' },
      { to: '/finance/ideas', icon: Lightbulb, label: 'Ideas Vault' },
    ],
  },
  {
    label: 'Asset Planning',
    items: [
      { to: '/assets/dashboard', icon: Briefcase, label: 'Asset Dashboard' },
      { to: '/assets/tracker', icon: Layers, label: 'Creation Tracker' },
      { to: '/assets/vault', icon: Zap, label: 'Opportunity Vault' },
    ],
  },
  {
    label: 'Life Management',
    items: [
      { to: '/timeline', icon: Flag, label: 'Life Timeline' },
      { to: '/dreams', icon: Sparkles, label: 'Dream Warehouse' },
      { to: '/goals', icon: FolderKanban, label: 'Goals & Projects' },
      { to: '/brain', icon: Brain, label: 'Second Brain' },
      { to: '/journal', icon: BookOpen, label: 'Journal' },
    ],
  },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 40,
        background: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 64,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 16,
          color: '#fff',
          flexShrink: 0,
        }}>
          L
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                Life<span className="gradient-text">OS</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: -2 }}>
                Personal Operating System
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {navSections.map((section) => (
          <div key={section.label} style={{ marginBottom: 8 }}>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                    padding: '8px 12px 4px',
                  }}
                >
                  {section.label}
                </motion.div>
              )}
            </AnimatePresence>
            {section.items.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: isCollapsed ? '10px' : '10px 16px',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        style={{
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 13,
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Collapse
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.aside>
  );
}
