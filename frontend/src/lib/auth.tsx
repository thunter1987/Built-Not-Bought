import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import { api, getAuthToken, setAuthToken } from './api'
import type { User } from './types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getAuthToken()

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get<User>('/auth/me')
      setUser(response.data)
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status
      if (status === 401) {
        setUser(null)
        setAuthToken(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUser()
    })
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      access_token: string
      token_type: string
    }>('/auth/login', {
      email,
      password,
    })

    setAuthToken(response.data.access_token)
    await refreshUser()
  }

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await api.post('/auth/register', {
      email,
      username,
      password,
    })
    await login(email, password)
  }
  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be use within AuthProvider')
  }

  return context
}
