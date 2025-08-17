/**
 * App routes for ClinicalRxQ
 * Uses HashRouter and gates member pages behind ProtectedRoute.
 * Removes AirtableConfigBanner per request; runtime config is no longer supported.
 */

import { ReactRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import ProgramPage from './pages/programs/ProgramPage'
import ProgramsPage from './pages/Programs'
import ResourcesPage from './pages/Resources'
import ContactPage from './pages/Contact'
import JoinPage from './pages/Join'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './components/auth/AuthContext'

/**
 * Root App component defining public and member-only routes.
 */
export default function App() {
  return (
    <ReactRouter>
      <AuthProvider>
        {/* Runtime Airtable config UI removed by request */}

        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<JoinPage />} />
          {/* Route alias to honor the hero CTA exactly as provided */}
          <Route path="/enroll" element={<JoinPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Member-only (Gated) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <ProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs/:slug"
            element={
              <ProtectedRoute>
                <ProgramPage />
              </ProtectedRoute>
            }
          />
          {/* Resource Library: keep /library for compatibility, add /resources to match UI links */}
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="* " element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </ReactRouter>
  )
}
