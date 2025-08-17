/**
 * API type definitions and Airtable schema for ClinicalRxQ
 * Defines core entities, payloads, and helper enums to enable typed API calls and UI rendering.
 */

export type SubscriptionStatus = 'Active' | 'Expiring' | 'Trial'

/**
 * Represents the authenticated member account (pharmacy/team)
 */
export interface MemberAccount {
  id: string
  pharmacyName: string
  email: string
  subscriptionStatus: SubscriptionStatus
  lastLoginISO: string
}

/**
 * Authentication response payload
 */
export interface AuthResponse {
  token: string
  member: MemberAccount
}

/**
 * Login payload for authentication
 */
export interface LoginPayload {
  email: string
  password: string
}

/**
 * Clinical program identifiers (slugs) used across routing and filtering
 */
export type ProgramSlug = 'tmm' | 'mtmtft' | 'tnt' | 'a1c' | 'oc'

/**
 * Clinical program model used for navigation and page headers
 */
export interface ClinicalProgram {
  slug: ProgramSlug
  name: string
  description: string
  icon: string // lucide icon name
  resourceCount: number
  lastUpdatedISO?: string
  downloadCount?: number
}

/**
 * Resource type classification used for filters and badges
 */
export type ResourceType =
  | 'Documentation Forms'
  | 'Clinical Resources'
  | 'Patient Handouts'
  | 'Protocols'
  | 'Training Materials'
  | 'Medical Billing'
  | 'Additional Resources'

/**
 * General resource model
 */
export interface ResourceItem {
  id: string
  name: string
  program?: ProgramSlug | 'general'
  type: ResourceType
  category?: string
  tags?: string[]
  fileUrl?: string
  sizeMB?: number
  lastUpdatedISO?: string
  downloadCount?: number
  bookmarked?: boolean
}

/**
 * Dashboard quick access card info
 */
export interface QuickAccessItem {
  id: string
  title: string
  subtitle: string
  icon: string // lucide icon name
  cta: 'Download' | 'Watch'
  resourceId?: string
}

/**
 * Simple announcement model
 */
export interface Announcement {
  id: string
  title: string
  body: string
  dateISO: string
  type?: 'update' | 'webinar' | 'regulatory'
}

/**
 * Activity feed item
 */
export interface RecentActivity {
  id: string
  resourceId: string
  name: string
  program?: ProgramSlug | 'general'
  accessedAtISO: string
}

/**
 * Airtable table record base type
 */
export interface AirtableRecord<TFields> {
  id: string
  createdTime: string
  fields: TFields
}

/**
 * Airtable: Members table fields
 */
export interface AirtableMemberFields {
  Email: string
  PharmacyName: string
  SubscriptionStatus: SubscriptionStatus
  PasswordHash: string
  LastLoginISO?: string
  Phone?: string
  Address?: string
  City?: string
  State?: string
  ZIP?: string
  CurrentServices?: string[]
  JoinDate?: string
}

/**
 * Airtable: Clinical Programs table fields
 */
export interface AirtableProgramFields {
  Name: string
  Slug: string
  Description: string
  Icon: string
  ResourceCount: number
  LastUpdatedISO?: string
  DownloadCount?: number
  Color: string
  IsActive: boolean
}

/**
 * Airtable: Resource fields for all resources
 */
export interface AirtableResourceFields {
  DisplayName: string
  Program: string
  ResourceType: ResourceType
  Category?: string
  Tags?: string[]
  File?: Array<{ url: string; filename: string; size: number }>
  LastUpdatedISO?: string
  DownloadCount?: number
  Version?: string | number
  SizeMB?: number
  MedicalCondition?: string[]
  IsBookmarked?: boolean
  ContentPreview?: string
}

/**
 * Airtable: Announcements table fields
 */
export interface AirtableAnnouncementFields {
  Title: string
  Body: string
  DateISO: string
  Type?: 'update' | 'webinar' | 'regulatory'
  IsPublished: boolean
  Priority?: 'low' | 'medium' | 'high'
}

/**
 * Airtable: Quick Access table fields
 */
export interface AirtableQuickAccessFields {
  Title: string
  Subtitle: string
  Icon: string
  CTA: 'Download' | 'Watch'
  ResourceId: string
  IsActive: boolean
  SortOrder: number
}

/**
 * Resource filters for querying
 */
export interface ResourceFilters {
  program?: ProgramSlug | 'general'
  type?: ResourceType
  category?: string
  tags?: string[]
  medicalCondition?: string[]
  bookmarked?: boolean
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'name' | 'lastUpdated' | 'downloadCount' | 'category'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Generic API error
 */
export class ApiError extends Error {
  code?: string
  status?: number
  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
