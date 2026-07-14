import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, CalendarClock, AlertTriangle, CheckCircle2, CreditCard } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'upcoming' | 'overdue' | 'success' | 'info';
  date: string;
  read: boolean;
}

// Mock notifications for now
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Upcoming EMI',
    message: 'Home Loan EMI of ₹25,000 is due in 3 days.',
    type: 'upcoming',
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Overdue Payment',
    message: 'Credit Card payment is overdue by 1 day!',
    type: 'overdue',
    date: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: '3',
    title: 'Goal Reached',
    message: 'Congratulations! You reached your Emergency Fund goal.',
    type: 'success',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
  }
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'upcoming': return <CalendarClock size={16} className="text-amber-500" />;
      case 'overdue': return <AlertTriangle size={16} className="text-rose-500" />;
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      default: return <CreditCard size={16} className="text-violet-500" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
        style={{ padding: 8, borderRadius: 'var(--radius-md)', position: 'relative' }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: 'var(--color-accent-rose)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 320,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-bg-tertiary)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: 'var(--color-accent-violet)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  <p style={{ fontSize: 13 }}>You're all caught up!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        background: notif.read ? 'transparent' : 'var(--color-accent-violet-glow)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        gap: 12,
                        position: 'relative',
                      }}
                      className="notification-item"
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {getIcon(notif.type)}
                      </div>
                      <div style={{ flex: 1, paddingRight: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <h4 style={{ fontSize: 13, fontWeight: notif.read ? 500 : 600 }}>{notif.title}</h4>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {new Date(notif.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => removeNotification(notif.id, e)}
                        className="notification-close"
                        style={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <style>{`
                    .notification-item:hover .notification-close { opacity: 1 !important; }
                    .notification-close:hover { color: var(--color-accent-rose) !important; }
                  `}</style>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
