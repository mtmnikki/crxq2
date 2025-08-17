/**
 * Sidebar navigation for member dashboard and internal pages
 * Implements fixed desktop sidebar with icons and nested sections.
 * NOTE: Per request, on the Resource Library page only, apply a blue-to-navy gradient
 * background and ensure the Sign Out button/icon are white for visibility.
 */

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Home,
  Library,
  LogOut,
  Settings,
  Layers,
  Pill,
  TestTube2,
  ActivitySquare,
  Stethoscope,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { Link, useLocation } from 'react-router'
import { Button } from '../../components/ui/button'

/**
 * Collapsible section item
 */
const Section: React.FC<{
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}> = ({ title, icon, children, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div>
      <button
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-white/5"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="mt-1 space-y-1 pl-8">{children}</div>}
    </div>
  )
}

/**
 * Link item styled
 */
const NavLinkItem: React.FC<{ to: string; label: string; active?: boolean }> = ({
  to,
  label,
  active,
}) => {
  return (
    <Link
      to={to}
      className={[
        'block rounded-md px-2 py-1.5 text-sm',
        active ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/5',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

/**
 * Sidebar component
 * Applies a special gradient theme when on the Resource Library routes.
 */
const Sidebar: React.FC = () => {
  const { logout, member } = useAuth()
  const location = useLocation()

  /** Determine if we are on the Resource Library page (or legacy /library route) */
  const onResources =
    location.pathname === '/resources' || location.pathname === '/library'

  /** Base container classes with conditional gradient for the Resource Library page only */
  const asideClasses = [
    'fixed left-0 top-0 hidden h-screen w-[280px] flex-col p-4 text-slate-100 lg:flex',
    onResources
      ? 'bg-gradient-to-br from-[#244575] to-[#132B51]'
      : 'bg-[#1A2332]',
  ].join(' ')

  return (
    <aside className={asideClasses}>
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold">CR</div>
        <div>
          <div className="text-sm font-semibold">ClinicalRxQ</div>
          <div className="text-xs text-slate-400">{member?.pharmacyName ?? 'Member'}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        <Link
          to="/dashboard"
          className={[
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/5',
            location.pathname === '/dashboard' ? 'bg-blue-600 text-white' : '',
          ].join(' ')}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        <Section title="Clinical Programs" icon={<Layers className="h-4 w-4" />} defaultOpen>
          <NavLinkItem
            to="/programs/tmm"
            label="MedSync: TimeMyMeds (TMM)"
            active={location.pathname.includes('/programs/tmm')}
          />
          <NavLinkItem
            to="/programs/mtmtft"
            label="MTM The Future Today (MTMTFT)"
            active={location.pathname.includes('/programs/mtmtft')}
          />
          <NavLinkItem
            to="/programs/tnt"
            label="Test and Treat (TNT)"
            active={location.pathname.includes('/programs/tnt')}
          />
          <NavLinkItem
            to="/programs/a1c"
            label="HbA1C Testing (A1C)"
            active={location.pathname.includes('/programs/a1c')}
          />
          <NavLinkItem
            to="/programs/oc"
            label="Oral Contraceptives (OC)"
            active={location.pathname.includes('/programs/oc')}
          />
        </Section>

        <Section title="Resource Library" icon={<Library className="h-4 w-4" />}>
          <NavLinkItem
            to="/resources"
            label="All Resources"
            active={location.pathname === '/resources'}
          />
          <div className="mt-1 pl-2 text-xs text-slate-200">Quick filters</div>
          {/* Make quick filters clickable to open the library with a pre-applied type filter */}
          <div className="mt-1 space-y-1 pl-2">
            <Link
              to="/resources?type=Clinical%20Resources"
              className="flex items-center gap-2 text-xs text-slate-200 hover:text-white"
            >
              <Pill className="h-3.5 w-3.5" /> Clinical Resources
            </Link>
            <Link
              to="/resources?type=Protocols"
              className="flex items-center gap-2 text-xs text-slate-200 hover:text-white"
            >
              <TestTube2 className="h-3.5 w-3.5" /> Protocols
            </Link>
            <Link
              to="/resources?type=Training%20Materials"
              className="flex items-center gap-2 text-xs text-slate-200 hover:text-white"
            >
              <ActivitySquare className="h-3.5 w-3.5" /> Training
            </Link>
            <Link
              to="/resources?type=Documentation%20Forms"
              className="flex items-center gap-2 text-xs text-slate-200 hover:text-white"
            >
              <Stethoscope className="h-3.5 w-3.5" /> Documentation
            </Link>
          </div>
        </Section>

        <Link
          to="/settings"
          className={[
            'flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-white/5',
            location.pathname === '/settings' ? 'bg-blue-600 text-white' : '',
          ].join(' ')}
        >
          <Settings className="h-4 w-4" />
          Account Settings
        </Link>
      </nav>

      <div className="border-t border-white/10 pt-3">
        {/* Ensure visibility on the Resource Library gradient: white text and icon */}
        <Button
          variant="outline"
          className={[
            'w-full bg-transparent',
            onResources ? 'text-white border-white/30 hover:bg-white/10' : '',
          ].join(' ')}
          onClick={logout}
        >
          <LogOut className={['mr-2 h-4 w-4', onResources ? 'text-white' : ''].join(' ')} />
          <span className={onResources ? 'text-white' : ''}>Sign Out</span>
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
