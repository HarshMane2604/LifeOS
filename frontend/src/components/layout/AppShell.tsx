/**
 * AppShell — main layout wrapper with sidebar + topbar + content area
 */

import { useState } from 'react';
import { Outlet } from 'react-router';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Topbar */}
      <Topbar
        sidebarWidth={sidebarWidth}
        onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          marginTop: 64,
          minHeight: 'calc(100vh - 64px)',
          padding: 'var(--space-page)',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
