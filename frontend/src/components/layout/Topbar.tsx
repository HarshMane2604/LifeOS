/**
 * Topbar — page header with search, theme toggle, and user menu
 */

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getGreeting } from '@/lib/utils';
import { Sun, Moon, LogOut, Search, Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface TopbarProps {
  sidebarWidth: number;
  onMobileMenuToggle: () => void;
}

export default function Topbar({ sidebarWidth, onMobileMenuToggle }: TopbarProps) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: sidebarWidth,
        height: 64,
        background: 'var(--color-bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 30,
        backdropFilter: 'blur(12px)',
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="btn-secondary"
          style={{
            padding: 8,
            display: 'none',
            border: 'none',
          }}
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}>
            {getGreeting()}, <span className="gradient-text">Harsh</span>
          </h2>
          <p style={{
            fontSize: 13,
            color: 'var(--color-text-muted)',
            marginTop: -2,
          }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: 12,
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search LifeOS..."
            className="input-field"
            style={{
              paddingLeft: 36,
              width: 240,
              fontSize: 13,
              height: 38,
            }}
            id="global-search"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ padding: 8, borderRadius: 'var(--radius-md)' }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-secondary"
          style={{ padding: 8, borderRadius: 'var(--radius-md)' }}
          title="Logout"
          id="logout-btn"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
