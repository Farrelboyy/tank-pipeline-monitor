import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview',  icon: '⬡' },
  { to: '/alerts',    label: 'Alerts',    icon: '⚠' },
]

export default function Navbar({ alertCount = 0 }) {
  const { username, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
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
            background: 'linear-gradient(135deg, #00d2ff, #0077aa)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>⬡</div>
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
                position: 'relative',
                transition: 'all 0.2s',
              }}>
                <span>{link.icon}</span>
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

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: 12, color: 'var(--normal)', fontWeight: 500 }}>LIVE</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{username}</span>
          <button
            onClick={logout}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--r-sm)',
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >Logout</button>
        </div>
      </div>
    </nav>
  )
}
