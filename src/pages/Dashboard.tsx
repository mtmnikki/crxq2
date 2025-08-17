/**
 * Member Dashboard
 * Implements header, quick access, bookmarks, recent activity, and announcements.
 */

import React, { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../components/auth/AuthContext'
import { Api } from '../services/api'
import {
  Announcement,
  ClinicalProgram,
  QuickAccessItem,
  RecentActivity,
  ResourceItem,
} from '../services/api/types'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowRight, Calendar, Download, PlayCircle, Star } from 'lucide-react'
import { Link } from 'react-router'

/**
 * Helper UI chips
 */
const StatChip: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{label}</div>
)

/**
 * Quick access card component
 * Simplified per request: remove the subtitle line beneath the title.
 */
const QuickCard: React.FC<{ item: QuickAccessItem }> = ({ item }) => {
  const Icon = (require('lucide-react') as any)[item.icon] || ArrowRight
  return (
    <Card className="hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
        {/* Subtitle removed per red-marked edits */}
      </CardHeader>
      <CardContent>
        <Button variant="secondary" className="w-full">
          {item.cta === 'Download' ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Dashboard page
 */
const DashboardPage: React.FC = () => {
  const { member } = useAuth()
  const [programs, setPrograms] = useState<ClinicalProgram[]>([])
  const [quick, setQuick] = useState<QuickAccessItem[]>([])
  const [bookmarks, setBookmarks] = useState<ResourceItem[]>([])
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [ann, setAnn] = useState<Announcement[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [programsData, quickData, bookmarksData, activityData, annData] = await Promise.all([
          Api.getPrograms(),
          Api.getQuickAccess(),
          Api.getBookmarkedResources(),
          Api.getRecentActivity(),
          Api.getAnnouncements()
        ])
        
        setPrograms(programsData)
        setQuick(quickData)
        setBookmarks(bookmarksData)
        setActivity(activityData)
        setAnn(annData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  const subColor =
    member?.subscriptionStatus === 'Active'
      ? 'bg-green-100 text-green-700'
      : member?.subscriptionStatus === 'Expiring'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-blue-100 text-blue-700'

  return (
    <AppShell
      header={
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-semibold">
              Welcome back, {member?.pharmacyName ?? 'Member'}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString()} • Last login{' '}
                {member?.lastLoginISO ? new Date(member.lastLoginISO).toLocaleString() : '—'}
              </span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${subColor}`}>
                {member?.subscriptionStatus ?? 'Active'}
              </span>
            </div>
          </div>
          <Link to="/resources">
            <Button variant="outline" className="bg-transparent">
              Browse Resources
            </Button>
          </Link>
        </div>
      }
    >
      {/* Programs overview */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Clinical Programs</h2>
          <div className="flex items-center gap-2">
            <StatChip label="49+ Active Pharmacies" />
            <StatChip label="HIPAA Compliant" />
            <StatChip label="Updated Monthly" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((p) => {
            const Icon = (require('lucide-react') as any)[p.icon] || Star
            return (
              <Link key={p.slug} to={`/programs/${p.slug}`}>
                <Card className="group border-blue-50 hover:border-blue-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">{p.name}</CardTitle>
                      </div>
                      {/* Resource count badge removed */}
                    </div>
                    {/* 'Updated ...' subline removed */}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{p.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quick access */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Quick Access</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quick.map((q) => (
            <QuickCard key={q.id} item={q} />
          ))}
        </div>
      </section>

      {/* Bookmarked resources */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Bookmarked Resources</h2>
          <Link to="/resources" className="text-sm text-blue-700 hover:underline">
            View All
          </Link>
        </div>
        {bookmarks.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-slate-600">
            No bookmarks yet. Explore the Resource Library and add bookmarks for quick access.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {bookmarks.map((b) => (
              <Card key={b.id} className="hover:shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{b.name}</CardTitle>
                    <Star className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xs text-slate-500">{b.program?.toUpperCase()}</div>
                </CardHeader>
                <CardContent>
                  <Button size="sm" variant="secondary" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity and announcements */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recently Accessed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-xs text-slate-500">
                      {a.program?.toUpperCase()} • {new Date(a.accessedAtISO).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Re-download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ann.map((an) => (
                <div key={an.id} className="rounded-md border p-3">
                  <div className="text-sm font-semibold">{an.title}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(an.dateISO).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">{an.body}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}

export default DashboardPage
