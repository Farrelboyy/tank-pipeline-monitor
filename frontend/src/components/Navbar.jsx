import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: '⬡' },
  { to: '/alerts',    label: 'Alerts',   icon: '!' },
]

/* ─── Logout Confirmation Modal ─────────────────────────────────────────── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 400, padding: '32px 36px' }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          Confirm Logout
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Are you sure you want to log out of the monitoring dashboard?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            id="logout-cancel"
            onClick={onCancel}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--r-md)',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid var(--border-accent)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            id="logout-confirm"
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              borderRadius: 'var(--r-md)',
              background: 'var(--danger-dim)',
              color: 'var(--danger)',
              border: '1px solid rgba(239,68,68,0.25)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
export default function Navbar({ alertCount = 0 }) {
  const { username, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const [showModal, setShowModal] = useState(false)

  const handleLogoutConfirm = () => {
    setShowModal(false)
    logout()
  }

  return (
    <>
      <nav style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background 0.25s',
      }}>
        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #004488))',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#000', fontWeight: 700,
            }}>T</div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
              Tank<span style={{ color: 'var(--accent)' }}>&</span>Pipeline
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(link => {
              const active = pathname.startsWith(link.to)
              return (
                <Link key={link.to} to={link.to} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  transition: 'all 0.2s',
                }}>
                  {link.label}
                  {link.label === 'Alerts' && alertCount > 0 && (
                    <span style={{
                      background: 'var(--danger)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 10,
                      minWidth: 18,
                      textAlign: 'center',
                    }}>{alertCount}</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: 12, color: 'var(--normal)', fontWeight: 500 }}>LIVE</span>
            </div>

            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 32, height: 32,
                borderRadius: 'var(--r-md)',
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {theme === 'dark'
                ? <Sun size={15} strokeWidth={2} />
                : <Moon size={15} strokeWidth={2} />
              }
            </button>

            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{username}</span>

            <button
              id="logout-btn"
              onClick={() => setShowModal(true)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'var(--danger-dim)',
                color: 'var(--danger)',
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid rgba(239,68,68,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {showModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}
