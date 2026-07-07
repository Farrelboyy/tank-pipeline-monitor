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
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', top: -100, left: -150,
        background: 'radial-gradient(circle, rgba(0,210,255,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', bottom: -80, right: -100,
        background: 'radial-gradient(circle, rgba(167,139,250,0.05), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="card fade-in" style={{
        width: '100%',
        maxWidth: 420,
        padding: '40px 36px',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #00d2ff22, #00d2ff44)',
            border: '1px solid var(--border-accent)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 16px',
          }}>⬡</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Tank & Pipeline Monitor
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>
            Industrial sensor simulation dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••"
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
              ⚠ {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px 20px' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 24 }}>
          Demo credentials: admin / admin
        </p>
      </div>
    </div>
  )
}
