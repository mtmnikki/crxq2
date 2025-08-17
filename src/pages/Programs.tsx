/**
 * Programs Overview Page
 * Displays all clinical programs with descriptions and links to detailed program pages
 */

import React from 'react'
import Header from '../components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Link } from 'react-router'
import { ArrowRight, CalendarCheck, Pill, TestTube2, ActivitySquare, Stethoscope } from 'lucide-react'

/**
 * Programs data
 */
const programs = [
  {
    slug: 'tmm',
    name: 'MedSync: TimeMyMeds',
    description: 'Create predictable appointment schedules to enable clinical service delivery.',
    icon: CalendarCheck,
    resourceCount: 8,
    lastUpdated: '2024-01-15',
    downloadCount: 1200,
    color: 'from-blue-600 to-cyan-500'
  },
  {
    slug: 'mtmtft',
    name: 'MTM The Future Today',
    description: 'Comprehensive, team-based MTM program with CMR forms, flowsheets, and protocols.',
    icon: Pill,
    resourceCount: 106,
    lastUpdated: '2024-01-20',
    downloadCount: 8650,
    color: 'from-cyan-500 to-teal-400'
  },
  {
    slug: 'tnt',
    name: 'Test and Treat: Strep, Flu, COVID',
    description: 'Point-of-care testing and treatment protocols for common infectious diseases.',
    icon: TestTube2,
    resourceCount: 15,
    lastUpdated: '2024-01-10',
    downloadCount: 3100,
    color: 'from-teal-400 to-green-400'
  },
  {
    slug: 'a1c',
    name: 'HbA1C Testing',
    description: 'In-pharmacy glycemic control testing with counseling and billing support.',
    icon: ActivitySquare,
    resourceCount: 5,
    lastUpdated: '2023-12-20',
    downloadCount: 540,
    color: 'from-green-400 to-emerald-400'
  },
  {
    slug: 'oc',
    name: 'Oral Contraceptives',
    description: 'Pharmacist-prescribed contraceptive services and embedded forms.',
    icon: Stethoscope,
    resourceCount: 1,
    lastUpdated: '2023-11-15',
    downloadCount: 220,
    color: 'from-emerald-400 to-cyan-400'
  }
]

/**
 * Programs Page Component
 */
const ProgramsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FB] to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1200px] px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Clinical Programs</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Five comprehensive clinical service programs designed to transform your pharmacy practice 
              from traditional dispensing to patient-centered care delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => {
              const Icon = program.icon
              return (
                <Card key={program.slug} className="group border-blue-50 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{program.resourceCount} resources</Badge>
                      <Badge variant="outline" className="bg-transparent">
                        {program.downloadCount.toLocaleString()} downloads
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="text-xs text-gray-500 mb-4">
                      Last updated: {new Date(program.lastUpdated).toLocaleDateString()}
                    </div>
                    <Link to={`/programs/${program.slug}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                        Explore Program
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of pharmacies already using ClinicalRxQ to deliver enhanced clinical services 
            and improve patient outcomes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/join">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-transparent">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProgramsPage