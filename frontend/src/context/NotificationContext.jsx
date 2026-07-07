import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [lastViewedTime, setLastViewedTime] = useState(() => {
    return parseInt(localStorage.getItem('lastViewedAlertsTime') || '0', 10)
  })

  const markViewed = useCallback(() => {
    const now = Date.now()
    setLastViewedTime(now)
    localStorage.setItem('lastViewedAlertsTime', now.toString())
  }, [])

  const getUnreadCount = useCallback((alerts) => {
    if (!alerts || !alerts.length) return 0
    return alerts.filter(a => new Date(a.created_at).getTime() > lastViewedTime).length
  }, [lastViewedTime])

  return (
    <NotificationContext.Provider value={{ lastViewedTime, markViewed, getUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
