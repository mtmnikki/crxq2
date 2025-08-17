/**
 * Generic Program Page
 * Renders header and tabbed content for the given program slug, with the required tab set:
 * Overview, Training Modules, Protocol Manuals, Documentation Forms, Additional Resources.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router'
import AppShell from '../../components/layout/AppShell'
import { Api } from '../../services/api'
import { ClinicalProgram, ProgramSlug, ResourceItem } from '../../services/api/types'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { programs as programList } from '../../services/api/mockData'

/**
 * Program meta lookup
 */
function getProgramMeta(slug: ProgramSlug): ClinicalProgram | undefined {
  return programList.find((p) => p.slug === slug)
}

/**
 * Program Page component
 */
const ProgramPage: React.FC = () => {
  const params = useParams()
  const slug = (params.slug as ProgramSlug) || 'mtmtft'

  const meta = useMemo(() => getProgramMeta(slug), [slug])
  const [items, setItems] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Api.getProgramResources(slug)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [slug])

  // MTMTFT special nested accordion structure (demo)
  const mtmCategories: { title: string; count?: number; children: string[] }[] = [
    { title: 'CMR Forms', count: 3, children: ['Authorization for Medication Review', 'Patient Intake Form', 'Pharmacist CMR Worksheet'] },
    { title: 'Guides and Checklists', count: 5, children: ['Clinical Quick Pick Text', 'Folder Prep Quick Reference', 'CMR Overview', 'Pharmacist Form Explanations', 'Technician Form Explanations'] },
    { title: 'Medical Condition Flowsheets', count: 12, children: ['Alzheimers', 'Asthma', 'COPD', 'Chronic Heart Failure', 'Chronic Kidney Disease', 'Depression', 'Diabetes', 'GERD', 'Hyperlipidemia', 'Hypertension', 'Hypothyroidism', 'Osteoporosis'] },
    { title: 'Outcomes TIP Forms', count: 23, children: ['TIP A', 'TIP B', 'TIP C'] },
    { title: 'Prescriber Communication Forms', count: 50, children: ['General Communication A', 'General Communication B'] },
    { title: 'Training', count: 7, children: ['Module 1', 'Module 2', 'Module 3'] },
  ]

  return (
    <AppShell
      header={
        <div className="mx-auto max-w-[1280px] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{meta?.name ?? 'Program'}</h1>
              <div className="mt-1 text-sm text-slate-600">{meta?.description}</div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">{meta?.resourceCount ?? 0} resources</Badge>
                <Badge variant="outline" className="bg-transparent">
                  Last updated: {meta?.lastUpdatedISO ? new Date(meta.lastUpdatedISO).toLocaleDateString() : '—'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                Downloads: {meta?.downloadCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Tabs: Overview, Training Modules, Protocol Manuals, Documentation Forms, Additional Resources */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="protocols">Protocol Manuals</TabsTrigger>
          <TabsTrigger value="documentation">Documentation Forms</TabsTrigger>
          <TabsTrigger value="additional">Additional Resources</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About this program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  {meta?.description ||
                    'This program provides resources, protocols, and training to implement and scale clinical services in your pharmacy.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{meta?.resourceCount ?? 0} total resources</Badge>
                  {meta?.lastUpdatedISO && (
                    <Badge variant="outline" className="bg-transparent">
                      Updated {new Date(meta.lastUpdatedISO).toLocaleDateString()}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-transparent">
                    Downloads {meta?.downloadCount ?? 0}
                  </Badge>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to={`/resources?program=${slug}`}>
                    <Button>
                      Browse all {meta?.name?.split(':')[0] || 'Program'} resources
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#documentation">
                    <Button variant="outline" className="bg-transparent">
                      Jump to Documentation Forms
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="rounded-md border p-3">Evidence-based workflows and protocols</div>
                <div className="rounded-md border p-3">Forms designed for clinical + billing needs</div>
                <div className="rounded-md border p-3">Training to onboard your entire team</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Modules */}
        <TabsContent value="training" className="mt-4">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-600">
            Training modules and videos will appear here.
          </div>
        </TabsContent>

        {/* Protocol Manuals */}
        <TabsContent value="protocols" className="mt-4">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-600">
            Protocol manuals listing will appear here.
          </div>
        </TabsContent>

        {/* Documentation Forms */}
        <TabsContent value="documentation" className="mt-4" id="documentation">
          {slug === 'mtmtft' ? (
            <Accordion type="multiple" className="w-full">
              {mtmCategories.map((cat) => (
                <AccordionItem key={cat.title} value={cat.title}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between">
                      <span>{cat.title}</span>
                      {cat.count ? <Badge variant="secondary">{cat.count}</Badge> : null}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {cat.children.map((child) => (
                        <Card key={child}>
                          <CardContent className="flex items-center justify-between p-3">
                            <div className="text-sm">{child}</div>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              Download <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-10">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : items.length ? (
                items.map((it) => (
                  <Card key={it.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="text-sm font-medium">{it.name}</div>
                        <div className="text-xs text-slate-500">{(it.program ?? '').toUpperCase()}</div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Download <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-6 text-slate-600">
                  No documentation forms available.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Additional Resources */}
        <TabsContent value="additional" className="mt-4">
          <div className="rounded-md border border-dashed p-6 text-sm text-slate-600">
            Additional resources (clinical references, patient handouts, billing aids) will appear here.
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

export default ProgramPage
