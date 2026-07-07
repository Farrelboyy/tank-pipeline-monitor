import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,    setToken]    = useState(() => localStorage.getItem('token'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const login = useCallback(async (user, pass) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authAPI.login(user, pass)
      localStorage.setItem('token',    data.token)
      localStorage.setItem('username', data.username)
      setToken(data.token)
      setUsername(data.username)
      return true
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, username, login, logout, error, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
