/**
 * Header navigation component for public pages
 * Includes logo, navigation links, and member login button
 */

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Button } from '../ui/button'
import { Menu, X, LogIn } from 'lucide-react'

/**
 * Header component
 */
const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Public navigation should not include member-gated pages (Programs, Resources)
  // About page removed per request
  const navigation = [
    { name: 'Contact', href: '/contact' },
  ]

  /**
   * Determine if a link is active based on current route path
   */
  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-50">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white">
                CR
              </div>
              <span className="text-xl font-bold text-gray-900">ClinicalRxQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="bg-transparent">
                <LogIn className="mr-2 h-4 w-4" />
                Member Login
              </Button>
            </Link>
            <Link to="/join">
              <Button className="bg-gradient-br blue-500 to cyan-500 hover:bg-gradient-br blue-400 to teal-400 shadow:xL">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-3 py-2 space-y-2 border-t border-gray-200 mt-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full bg-transparent">
                  <LogIn className="mr-2 h-4 w-4" />
                  Member Login
                </Button>
              </Link>
              <Link to="/join" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-amber-500 hover:bg-amber-600">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header