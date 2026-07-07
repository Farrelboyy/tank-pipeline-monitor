/**
 * TankCard.jsx
 * Shows current sensor readings for one tank with color-coded status indicators.
 * Status: normal | warning | danger
 */

import { useNavigate } from 'react-router-dom'

function getStatus(value, param) {
  if (param === 'temperature') {
    if (value < 15 || value > 40) return 'warning'
  }
  if (param === 'pressure') {
    if (value > 5) return 'danger'
  }
  if (param === 'level_percent') {
    if (value < 10 || value > 95) return 'warning'
  }
  return 'normal'
}

function StatusDot({ status }) {
  const colors = { normal: '#10b981', warning: '#f59e0b', danger: '#ef4444' }
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8,
      borderRadius: '50%',
      background: colors[status] || colors.normal,
      boxShadow: `0 0 6px ${colors[status]}`,
      flexShrink: 0,
    }} />
  )
}

function ParamRow({ label, value, unit, status }) {
  const colors = {
    normal:  { text: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    warning: { text: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    danger:  { text: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
  }
  const c = colors[status]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 10px',
      borderRadius: 8,
      background: c.bg,
      marginBottom: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status={status} />
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: 14,
        color: c.text,
      }}>
        {value !== null ? value.toFixed(1) : '—'} {unit}
      </span>
    </div>
  )
}

export default function TankCard({ tank }) {
  const navigate = useNavigate()
  const { id, name, location, temperature, pressure, level_percent, recorded_at } = tank

  const tStatus = getStatus(temperature, 'temperature')
  const pStatus = getStatus(pressure,    'pressure')
  const lStatus = getStatus(level_percent, 'level_percent')

  // Overall card status = worst status
  const statuses = [tStatus, pStatus, lStatus]
  const overallStatus = statuses.includes('danger')
    ? 'danger'
    : statuses.includes('warning') ? 'warning' : 'normal'

  const statusColor = { normal: '#10b981', warning: '#f59e0b', danger: '#ef4444' }
  const statusLabel = { normal: 'NORMAL', warning: 'WARNING', danger: 'DANGER'  }

  const levelPct = level_percent ?? 0

  return (
    <div
      onClick={() => navigate(`/tanks/${id}`)}
      className="card"
      style={{
        padding: 20,
        cursor: 'pointer',
        borderColor: overallStatus !== 'normal'
          ? `${statusColor[overallStatus]}44`
          : 'var(--border)',
        transition: 'all 0.25s',
        animation: 'fadeIn 0.4s ease forwards',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>{name}</h3>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{location}</p>
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 20,
          background: `${statusColor[overallStatus]}18`,
          color: statusColor[overallStatus],
          alignSelf: 'flex-start',
          letterSpacing: '0.5px',
        }}>{statusLabel[overallStatus]}</span>
      </div>

      {/* Level bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text-3)', marginBottom: 5,
        }}>
          <span>Tank Level</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: statusColor[lStatus] }}>
            {levelPct.toFixed(1)}%
          </span>
        </div>
        <div style={{
          height: 6, background: 'var(--bg-surface)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${levelPct}%`,
            background: `linear-gradient(90deg, ${statusColor[lStatus]}, ${statusColor[lStatus]}99)`,
            borderRadius: 3,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Sensor params */}
      <ParamRow label="Temperature" value={temperature} unit="°C"  status={tStatus} />
      <ParamRow label="Pressure"    value={pressure}    unit="bar" status={pStatus} />

      {/* Timestamp */}
      {recorded_at && (
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10, textAlign: 'right' }}>
          Last update: {new Date(recorded_at).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
