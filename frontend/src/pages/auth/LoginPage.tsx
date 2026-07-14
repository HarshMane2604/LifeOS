/**
 * Login Page — keyword-based authentication gate
 * Premium, full-screen glassmorphism design
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await login(keyword.trim());
    } catch {
      setError('Access denied. Invalid keyword.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        top: -100,
        right: -100,
        filter: 'blur(60px)',
        animation: 'gradient-shift 8s ease infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        bottom: -80,
        left: -80,
        filter: 'blur(60px)',
      }} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: 'var(--shadow-glow-violet)',
            }}
          >
            <Shield size={32} color="#fff" />
          </motion.div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 4,
          }}>
            Life<span className="gradient-text">OS</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Enter your access keyword to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="glass-card" style={{ padding: 32 }}>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  marginBottom: 20,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-rose-glow)',
                  color: 'var(--color-accent-rose)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: 8,
              }}>
                Access Keyword
              </label>
              <input
                type="password"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter your secret keyword..."
                className="input-field"
                style={{
                  fontSize: 15,
                  padding: '14px 16px',
                  letterSpacing: '0.1em',
                }}
                autoFocus
                id="keyword-input"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="btn-primary"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                opacity: isLoading || !keyword.trim() ? 0.6 : 1,
              }}
              id="login-btn"
            >
              {isLoading ? (
                <div style={{
                  width: 20,
                  height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              ) : (
                <>
                  Access LifeOS
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--color-text-muted)',
          marginTop: 24,
        }}>
          Private Personal Operating System · Authorized Access Only
        </p>
      </motion.div>

      {/* Spin keyframe (inline for login page) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        #mobile-menu-btn { display: none !important; }
      `}</style>
    </div>
  );
}
