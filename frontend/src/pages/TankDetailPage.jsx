import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, subHours } from 'date-fns'
import Navbar from '../components/Navbar'
import RealtimeChart from '../components/RealtimeChart'
import { tanksAPI, alertsAPI } from '../services/api'

const PRESETS = [
  { label: '1h',  hours: 1  },
  { label: '6h',  hours: 6  },
  { label: '24h', hours: 24 },
  { label: '7d',  hours: 168 },
]

function StatBox({ label, value, unit, color }) {
  return (
    <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{unit}</p>
    </div>
  )
}

export default function TankDetailPage() {
  const { id } = useParams()
  const [tank,      setTank]      = useState(null)
  const [history,   setHistory]   = useState([])
  const [alertCount, setAlertCount] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [preset,    setPreset]    = useState(6) // hours

  useEffect(() => {
    alertsAPI.getAll().then(d => setAlertCount(d.length)).catch(() => {})
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const toDate   = new Date()
        const fromDate = subHours(toDate, preset)
        const fromStr  = format(fromDate, "yyyy-MM-dd'T'HH:mm:ss")
        const toStr    = format(toDate,   "yyyy-MM-dd'T'HH:mm:ss")

        const [current, histData] = await Promise.all([
          tanksAPI.getCurrent(id),
          tanksAPI.getHistory(id, fromStr, toStr),
        ])
        setTank(current)
        setHistory(histData.readings || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, preset])

  const latest = tank?.latest

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar alertCount={alertCount} />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-3)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent)' }}>Overview</Link>
          <span>›</span>
          <span style={{ color: 'var(--text-1)' }}>{tank?.name || `Tank #${id}`}</span>
        </div>

        {/* Tank header */}
        {tank && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{tank.name} — Detail View</h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
              {tank.location} · Capacity: {tank.capacity_liters?.toLocaleString()} L
            </p>
          </div>
        )}

        {/* Current readings */}
        {latest && (
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <StatBox label="Temperature" value={latest.temperature?.toFixed(1)} unit="°C"  color="#00d2ff" />
            <StatBox label="Pressure"    value={latest.pressure?.toFixed(2)}    unit="bar" color="#a78bfa" />
            <StatBox label="Tank Level"  value={latest.level_percent?.toFixed(1)} unit="%" color="#34d399" />
          </div>
        )}

        {/* Time range selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>
            Historical Data
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {PRESETS.map(p => (
              <button
                key={p.hours}
                onClick={() => setPreset(p.hours)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${preset === p.hours ? 'var(--accent)' : 'var(--border)'}`,
                  background: preset === p.hours ? 'var(--accent-dim)' : 'transparent',
                  color: preset === p.hours ? 'var(--accent)' : 'var(--text-3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >{p.label}</button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : (
          <RealtimeChart
            data={history}
            title={`${tank?.name} — Last ${preset >= 24 ? `${preset / 24}d` : `${preset}h`} (${history.length} readings)`}
          />
        )}
      </main>
    </div>
  )
}
