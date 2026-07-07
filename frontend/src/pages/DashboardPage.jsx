import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import { useNotification } from '../context/NotificationContext'
import TankCard from '../components/TankCard'
import RealtimeChart from '../components/RealtimeChart'
import { tanksAPI, alertsAPI } from '../services/api'

const POLL_MS = 5000 // refresh every 5 seconds

export default function DashboardPage() {
  const [tanks,       setTanks]       = useState([])
  const [chartData,   setChartData]   = useState([]) // recent readings for chart
  const [alertCount,  setAlertCount]  = useState(0)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { getUnreadCount } = useNotification()

  // Keep last 30 readings per tank merged for the overview chart
  const buildChartData = useCallback(async () => {
    try {
      // Fetch last 30 readings from Tank A (id=1) for the overview sparkline
      const { readings } = await tanksAPI.getHistory(1, null, null)
      setChartData(readings.slice(-30))
    } catch { /* ignore */ }
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [tanksData, alertsData] = await Promise.all([
        tanksAPI.getAll(),
        alertsAPI.getAll(),
      ])
      setTanks(tanksData)
      setAlertCount(alertsData.length)
      setUnreadAlerts(getUnreadCount(alertsData))
    } catch {
      // Network errors are handled by the Axios interceptor (auto-logout on 401/403)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    buildChartData()
    const interval = setInterval(() => {
      fetchAll()
      buildChartData()
    }, POLL_MS)
    return () => clearInterval(interval)
  }, [fetchAll, buildChartData])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar alertCount={unreadAlerts} />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Asset Overview
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
              5 tanks monitored in real-time · auto-refresh every 5s
            </p>
          </div>
          {currentTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Stat bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}>
          {[
            { label: 'Active Tanks',   value: tanks.length,  color: 'var(--accent)' },
            { label: 'Active Alerts',  value: alertCount,    color: alertCount > 0 ? 'var(--danger)' : 'var(--normal)' },
            { label: 'Polling Rate',   value: '5s',          color: 'var(--normal)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tank cards grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid-5" style={{ marginBottom: 28 }}>
            {tanks.map(tank => <TankCard key={tank.id} tank={tank} />)}
          </div>
        )}

        {/* Overview chart: Tank A readings */}
        {chartData.length > 0 && (
          <RealtimeChart
            data={chartData}
            title="Sensor Trend Analysis: Tank A (Last 30 Readings)"
          />
        )}
      </main>
    </div>
  )
}
