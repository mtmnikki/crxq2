/**
 * AppShell layout
 * Wraps member-only pages with sidebar and responsive content container.
 */

import React from 'react'
import Sidebar from './Sidebar'

/**
 * AppShell with sidebar
 */
const AppShell: React.FC<{ children: React.ReactNode; header?: React.ReactNode }> = ({
  children,
  header,
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-h-screen lg:pl-[280px]">
        {header ? <div className="border-b bg-white">{header}</div> : null}
        <div className="mx-auto max-w-[1280px] px-4 py-6">{children}</div>
      </main>
    </div>
  )
}

export default AppShell
