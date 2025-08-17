/**
 * Mock data for local development and preview.
 * This allows functional UI without a backend. Replace with real API integration later.
 */

import {
  Announcement,
  ClinicalProgram,
  MemberAccount,
  ProgramSlug,
  QuickAccessItem,
  RecentActivity,
  ResourceItem,
} from './types'

export const mockMember: MemberAccount = {
  id: 'mem_001',
  pharmacyName: 'Sunrise Community Pharmacy',
  email: 'pharmacy@example.com',
  subscriptionStatus: 'Active',
  lastLoginISO: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
}

export const programs: ClinicalProgram[] = [
  {
    slug: 'tmm',
    name: 'MedSync: TimeMyMeds',
    description: 'Create predictable appointment schedules to enable clinical service delivery.',
    icon: 'CalendarCheck',
    resourceCount: 8,
    lastUpdatedISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    downloadCount: 1200,
    color: 'from-blue-600 to-cyan-500',
  },
  {
    slug: 'mtmtft',
    name: 'MTM The Future Today',
    description:
      'Comprehensive, team-based MTM program with CMR forms, flowsheets, and protocols.',
    icon: 'Pill',
    resourceCount: 106,
    lastUpdatedISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    downloadCount: 8650,
    color: 'from-cyan-500 to-teal-400',
  },
  {
    slug: 'tnt',
    name: 'Test and Treat: Strep, Flu, COVID',
    description: 'Point-of-care testing and treatment protocols for common infectious diseases.',
    icon: 'TestTube2',
    resourceCount: 15,
    lastUpdatedISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    downloadCount: 3100,
    color: 'from-teal-400 to-green-400',
  },
  {
    slug: 'a1c',
    name: 'HbA1C Testing',
    description: 'In-pharmacy glycemic control testing with counseling and billing support.',
    icon: 'ActivitySquare',
    resourceCount: 5,
    lastUpdatedISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    downloadCount: 540,
    color: 'from-green-400 to-emerald-400',
  },
  {
    slug: 'oc',
    name: 'Oral Contraceptives',
    description: 'Pharmacist-prescribed contraceptive services and embedded forms.',
    icon: 'Stethoscope',
    resourceCount: 1,
    lastUpdatedISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    downloadCount: 220,
    color: 'from-emerald-400 to-cyan-400',
  },
]

/**
 * Minimal sample resources including some bookmarked defaults
 */
export const resources: ResourceItem[] = [
  {
    id: 'res_cmr_ws',
    name: 'MTM CMR Worksheet',
    program: 'mtmtft',
    type: 'Documentation Forms',
    tags: ['CMR', 'Worksheet'],
    downloadCount: 2100,
    bookmarked: true,
  },
  {
    id: 'res_tnt_protocol',
    name: 'TNT Protocol Guide',
    program: 'tnt',
    type: 'Protocols',
    tags: ['Flu', 'Strep', 'COVID'],
    downloadCount: 1450,
    bookmarked: true,
  },
  {
    id: 'res_billing_quick',
    name: 'Billing Quick Reference',
    program: 'general',
    type: 'Medical Billing',
    tags: ['CPT', 'Reimbursement'],
    downloadCount: 980,
    bookmarked: true,
  },
  {
    id: 'res_training_mod1',
    name: 'Training Module 1',
    program: 'mtmtft',
    type: 'Training Materials',
    tags: ['Onboarding'],
    downloadCount: 320,
  },
  {
    id: 'res_patient_intake',
    name: 'Patient Intake Form',
    program: 'mtmtft',
    type: 'Documentation Forms',
    tags: ['Intake'],
    bookmarked: true,
  },
  {
    id: 'res_copd_flowsheet',
    name: 'COPD Flowsheet',
    program: 'mtmtft',
    type: 'Clinical Resources',
    tags: ['COPD'],
    bookmarked: true,
  },
  {
    id: 'res_drug_interaction',
    name: 'Drug Interaction Template',
    program: 'mtmtft',
    type: 'Clinical Resources',
    tags: ['Safety'],
    bookmarked: true,
  },
  {
    id: 'res_a1c_protocol',
    name: 'A1C Testing Protocol',
    program: 'a1c',
    type: 'Protocols',
    tags: ['Diabetes'],
    bookmarked: true,
  },
]

/**
 * Quick access items for dashboard
 */
export const quickAccess: QuickAccessItem[] = [
  {
    id: 'qa_cmr',
    title: 'MTM CMR Worksheet',
    subtitle: 'Most Downloaded',
    icon: 'FileText',
    cta: 'Download',
    resourceId: 'res_cmr_ws',
  },
  {
    id: 'qa_tnt',
    title: 'TNT Protocol Guide',
    subtitle: 'Updated This Week',
    icon: 'ClipboardList',
    cta: 'Download',
    resourceId: 'res_tnt_protocol',
  },
  {
    id: 'qa_billing',
    title: 'Billing Quick Reference',
    subtitle: 'Frequently Used',
    icon: 'DollarSign',
    cta: 'Download',
    resourceId: 'res_billing_quick',
  },
  {
    id: 'qa_training',
    title: 'Training Module 1',
    subtitle: 'Start Learning',
    icon: 'PlayCircle',
    cta: 'Watch',
    resourceId: 'res_training_mod1',
  },
]

/**
 * Recent activity sample
 */
export const recentActivity: RecentActivity[] = [
  {
    id: 'act_1',
    resourceId: 'res_cmr_ws',
    name: 'MTM CMR Worksheet',
    program: 'mtmtft',
    accessedAtISO: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'act_2',
    resourceId: 'res_billing_quick',
    name: 'Billing Quick Reference',
    program: 'general',
    accessedAtISO: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'act_3',
    resourceId: 'res_a1c_protocol',
    name: 'A1C Testing Protocol',
    program: 'a1c',
    accessedAtISO: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

/**
 * Announcements sample
 */
export const announcements: Announcement[] = [
  {
    id: 'ann_1',
    title: 'New TNT Protocol Update',
    body: 'Latest CDC guidance integrated for Flu and Strep treatment.',
    dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    type: 'update',
  },
  {
    id: 'ann_2',
    title: 'Upcoming Webinar: MTM Documentation Excellence',
    body: 'Join us next Thursday at 1pm CST to deep dive into CMR best practices.',
    dateISO: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    type: 'webinar',
  },
]
