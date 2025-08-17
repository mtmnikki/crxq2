/**
 * Authentication context for ClinicalRxQ
 * Provides member info, token, and login/logout functions across the app.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Api } from '../../services/api'
import { AuthResponse, MemberAccount } from '../../services/api/types'

/**
 * Shape of AuthContext
 */
interface AuthContextValue {
  member: MemberAccount | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/**
 * Default context value
 */
const AuthContext = createContext<AuthContextValue>({
  member: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

/**
 * Provider wrapping the app
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<MemberAccount | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load stored auth on mount
  useEffect(() => {
    const stored = Api.getStoredAuth()
    if (stored) {
      setMember(stored.member)
      setToken(stored.token)
    }
    setLoading(false)
  }, [])

  /**
   * Handles user login via API
   */
  const login = async (email: string, password: string) => {
    const res: AuthResponse = await Api.login({ email, password })
    setMember(res.member)
    setToken(res.token)
  }

  /**
   * Logs out the current user via API
   */
  const logout = async () => {
    await Api.logout()
    setMember(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      member,
      token,
      loading,
      login,
      logout,
    }),
    [member, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 */
export const useAuth = () => useContext(AuthContext)
