/**
 * App.tsx — Root component with routing, auth guards, and providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ExpensesPage from '@/pages/finance/ExpensesPage';
import IncomePage from '@/pages/finance/IncomePage';
import {
  InvestmentsPage,
  NetWorthPage,
  FinancialIdeasPage,
} from '@/pages/PlaceholderPages';
import DebtsPage from '@/pages/finance/debts/DebtsPage';
import DebtPlanPage from '@/pages/finance/debts/DebtPlanPage';
import BrainPage from '@/pages/brain/BrainPage';
import FinancialGoalsPage from '@/pages/finance/FinancialGoalsPage';
import LifeTimelinePage from '@/pages/timeline/LifeTimelinePage';
import DreamsPage from '@/pages/dreams/DreamsPage';
import GoalsPage from '@/pages/goals/GoalsPage';
import JournalPage from '@/pages/journal/JournalPage';

import AssetDashboardPage from '@/pages/assets/AssetDashboardPage';
import AssetCreationTrackerPage from '@/pages/assets/AssetCreationTrackerPage';
import AssetOpportunityVaultPage from '@/pages/assets/AssetOpportunityVaultPage';
import AssetRoadmapPage from '@/pages/assets/AssetRoadmapPage';

/** Protected Route wrapper — redirects to login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent-violet)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/** Public Route wrapper — redirects to dashboard if already authenticated */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected — wrapped in AppShell layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Financial OS */}
        <Route path="/finance/expenses" element={<ExpensesPage />} />
        <Route path="/finance/income" element={<IncomePage />} />
        <Route path="/finance/debts" element={<DebtsPage />} />
        <Route path="/finance/debts/:id/plan" element={<DebtPlanPage />} />
        <Route path="/finance/investments" element={<InvestmentsPage />} />
        <Route path="/finance/net-worth" element={<NetWorthPage />} />
        <Route path="/finance/goals" element={<FinancialGoalsPage />} />
        <Route path="/finance/ideas" element={<FinancialIdeasPage />} />

        {/* Life Management */}
        <Route path="/timeline" element={<LifeTimelinePage />} />
        <Route path="/dreams" element={<DreamsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/brain" element={<BrainPage />} />
        <Route path="/journal" element={<JournalPage />} />

        {/* Asset Planning */}
        <Route path="/assets/dashboard" element={<AssetDashboardPage />} />
        <Route path="/assets/tracker" element={<AssetCreationTrackerPage />} />
        <Route path="/assets/vault" element={<AssetOpportunityVaultPage />} />
        <Route path="/assets/:id/roadmap" element={<AssetRoadmapPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
