/**
 * ProtectedRoute gate component
 * Renders children when authenticated; otherwise redirects to /login.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

/**
 * Simple wrapper to require authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
