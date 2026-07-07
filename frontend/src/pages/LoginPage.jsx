import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = async e => {
    e.preventDefault()
    const ok = await login(form.username, form.password)
    if (ok) navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.25s',
    }}>
      {/* Background glow blobs - dark mode only visible via opacity */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', top: -100, left: -150,
        background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', bottom: -80, right: -100,
        background: 'radial-gradient(circle, rgba(167,139,250,0.04), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="card fade-in" style={{
        width: '100%',
        maxWidth: 420,
        padding: '40px 36px',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48,
            background: 'var(--accent-dim)',
            border: '1px solid var(--border-accent)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'var(--accent)',
            margin: '0 auto 16px',
          }}>T</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Tank &amp; Pipeline Monitor
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>
            Industrial sensor simulation dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--text-2)', marginBottom: 6,
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              Username
            </label>
            <input
              id="username"
              className="input"
              type="text"
              placeholder="admin"
              autoComplete="username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'var(--text-2)', marginBottom: 6,
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-dim)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px 20px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 20 }}>
          Demo credentials: admin / admin
        </p>

        {/* Demo notice */}
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-3)',
          marginTop: 20,
          lineHeight: 1.6,
          padding: '12px 8px',
          borderTop: '1px solid var(--border)',
        }}>
          This is a simulated monitoring dashboard for demonstration purposes only.
          All sensor data is synthetically generated and does not represent real
          industrial equipment.
        </p>
      </div>
    </div>
  )
}
