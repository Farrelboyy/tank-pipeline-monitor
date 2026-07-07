import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import Navbar from '../components/Navbar'
import { alertsAPI } from '../services/api'

const SEVERITY_STYLE = {
  warning: { bg: 'var(--warning-dim)', color: 'var(--warning)', label: 'WARNING' },
  danger:  { bg: 'var(--danger-dim)',  color: 'var(--danger)',  label: 'DANGER'  },
}

const PARAM_LABELS = {
  temperature:   'Temperature',
  pressure:      'Pressure',
  level_percent: 'Tank Level',
}
const PARAM_UNITS = {
  temperature:   '°C',
  pressure:      'bar',
  level_percent: '%',
}

function AlertRow({ alert, index }) {
  const sty = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.warning

  return (
    <div
      className="fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 100px 100px 140px',
        gap: 12,
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        animationDelay: `${index * 0.04}s`,
        transition: 'background 0.2s',
      }}
    >
      <div>
        <p style={{ fontWeight: 600, fontSize: 14 }}>{alert.tank_name}</p>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 2 }}>
          {PARAM_LABELS[alert.parameter] || alert.parameter}
        </p>
      </div>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: sty.color }}>
        {Number(alert.value).toFixed(2)} {PARAM_UNITS[alert.parameter]}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
        ≥ {alert.threshold} {PARAM_UNITS[alert.parameter]}
      </span>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 20,
        background: sty.bg, color: sty.color,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
        width: 'fit-content',
      }}>
        {sty.label}
      </span>

      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
        {format(new Date(alert.created_at), 'HH:mm:ss · dd MMM')}
      </span>
    </div>
  )
}

export default function AlertsPage() {
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await alertsAPI.getAll()
      setAlerts(data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [load])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar alertCount={alerts.length} />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Active Alerts</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
              Threshold violations - refreshed every 5s
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 28,
              color: alerts.length > 0 ? 'var(--danger)' : 'var(--normal)',
            }}>{alerts.length}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>active alerts</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: '50%',
              background: 'var(--normal-dim)',
              border: '2px solid var(--normal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 22,
              color: 'var(--normal)',
              fontWeight: 700,
            }}>OK</div>
            <p style={{ color: 'var(--normal)', fontWeight: 600, fontSize: 16 }}>All systems normal</p>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>No active threshold violations detected</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 100px 100px 140px',
              gap: 12,
              padding: '10px 20px',
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
            }}>
              {['Tank / Parameter', 'Value', 'Threshold', 'Severity', 'Triggered At'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
              ))}
            </div>
            {alerts.map((a, i) => <AlertRow key={a.id} alert={a} index={i} />)}
          </div>
        )}
      </main>
    </div>
  )
}
