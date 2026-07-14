/**
 * Placeholder pages for modules that will be fully built in Phase 2/3
 * Each has a premium "Coming Soon" state with the module's identity
 */

import { motion } from 'framer-motion';
import { CreditCard, PieChart, BarChart3, Target, Lightbulb, Flag, Sparkles, FolderKanban, Brain, BookOpen } from 'lucide-react';

interface PlaceholderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

function ModulePlaceholder({ icon: Icon, title, description, color }: PlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 40,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 'var(--radius-xl)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon size={36} color={color} />
      </motion.div>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>{title}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 400, lineHeight: 1.6 }}>{description}</p>
      <div className="badge badge-violet" style={{ marginTop: 20, padding: '6px 16px', fontSize: 12 }}>
        Coming in Phase 2
      </div>
    </motion.div>
  );
}

export function DebtsPage() {
  return <ModulePlaceholder icon={CreditCard} title="Debt Management" description="Track loans, credit cards, money lent & borrowed with payment history and payoff progress." color="var(--color-accent-rose)" />;
}

export function InvestmentsPage() {
  return <ModulePlaceholder icon={PieChart} title="Investment Portfolio" description="Monitor stocks, mutual funds, SIPs, gold, crypto, real estate with ROI tracking and allocation charts." color="var(--color-accent-emerald)" />;
}

export function NetWorthPage() {
  return <ModulePlaceholder icon={BarChart3} title="Net Worth Dashboard" description="Automatically calculated net worth with historical growth charts and asset/liability breakdown." color="var(--color-accent-cyan)" />;
}

export function FinancialGoalsPage() {
  return <ModulePlaceholder icon={Target} title="Financial Goals" description="Track savings goals like Emergency Fund, House Fund, Car Fund with progress rings and target dates." color="var(--color-accent-violet)" />;
}

export function FinancialIdeasPage() {
  return <ModulePlaceholder icon={Lightbulb} title="Ideas Vault" description="Store business ideas, investment opportunities, and wealth creation strategies with priority and status tracking." color="var(--color-accent-amber)" />;
}

export function TimelinePage() {
  return <ModulePlaceholder icon={Flag} title="Life Timeline" description="Visualize your 1-year, 3-year, 5-year, and 10-year goals on an interactive timeline." color="var(--color-accent-cyan)" />;
}

export function DreamsPage() {
  return <ModulePlaceholder icon={Sparkles} title="Dream Warehouse" description="Store and visualize your dream house, car, office, lifestyle, gadgets, and travel destinations." color="var(--color-accent-rose)" />;
}

export function GoalsPage() {
  return <ModulePlaceholder icon={FolderKanban} title="Goals & Projects" description="Command center for all goals with milestones, tasks, Kanban board, timeline and calendar views." color="var(--color-accent-violet)" />;
}

export function BrainPage() {
  return <ModulePlaceholder icon={Brain} title="Second Brain" description="Personal knowledge management with rich notes, backlinks, categories, tags, and full-text search." color="var(--color-accent-emerald)" />;
}

export function JournalPage() {
  return <ModulePlaceholder icon={BookOpen} title="Journal" description="Daily journaling with mood tracking, wins, lessons, gratitude, and calendar navigation." color="var(--color-accent-amber)" />;
}
