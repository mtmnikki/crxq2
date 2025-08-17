/**
 * Airtable transform utilities mapped to the ClinicalRxQ Member Site App base
 * - Converts Airtable records into domain models used by the app
 * - Uses your exact field names per crxqairtableschema.txt
 */

import {
  AirtableRecord,
  MemberAccount,
  ClinicalProgram,
  ResourceItem,
  Announcement,
  QuickAccessItem,
  SubscriptionStatus,
  ProgramSlug,
} from './types'

/**
 * Safely get the first attachment's URL and size (if present).
 * Note: Airtable attachment URLs expire ~2 hours after issuance.
 */
function firstAttachment(list: any): { url: string; sizeMB?: number } {
  if (!Array.isArray(list) || list.length === 0) return { url: '' }
  const att = list[0]
  const url = (att && typeof att === 'object' && 'url' in att ? String(att.url || '') : '') as string
  const size = (att && typeof att === 'object' && 'size' in att ? Number(att.size || 0) : 0) as number
  return { url, sizeMB: size ? +(size / (1024 * 1024)).toFixed(2) : undefined }
}

/**
 * Map base Subscription Status values into app union type.
 * Your base uses: 'Active', 'Expired'. We map 'Expired' -> 'Expiring' to fit the UI union.
 */
function mapSubscriptionStatus(value: string | undefined): SubscriptionStatus {
  if (!value) return 'Active'
  if (value.toLowerCase() === 'active') return 'Active'
  if (value.toLowerCase() === 'expired') return 'Expiring'
  // fallback
  return 'Active'
}

/**
 * Derive program slug from the Program_Name.
 * No slug field in the base; keep this mapping deterministic & case-insensitive.
 */
export function programNameToSlug(name: string): ProgramSlug {
  const n = (name || '').toLowerCase()
  if (n.includes('timemymeds')) return 'tmm'
  if (n.includes('mtm the future today')) return 'mtmtft'
  if (n.includes('test and treat')) return 'tnt'
  if (n.includes('hb') && n.includes('a1c')) return 'a1c'
  if (n.includes('oral') && n.includes('contracept')) return 'oc'
  // Default to 'tmm' to avoid breaking routes if a label is slightly off; adjust as needed.
  return 'tmm'
}

/**
 * Transform an Airtable Member record into MemberAccount
 * Members fields used: 
 * - 'Email Address', 'Pharmacy Name', 'Subscription Status', 'Last Login'
 */
export function transformAirtableMember(
  record: AirtableRecord<any>
): MemberAccount {
  const f: any = record?.fields || {}
  const member: MemberAccount = {
    id: record.id,
    pharmacyName: f['Pharmacy Name'] || '',
    email: f['Email Address'] || '',
    subscriptionStatus: mapSubscriptionStatus(f['Subscription Status']),
    lastLoginISO: f['Last Login'] || record?.createdTime || new Date().toISOString(),
  }
  return member
}

/**
 * Transform an Airtable Clinical Programs record into ClinicalProgram
 * Clinical Programs fields used:
 * - 'Program_Name', 'Program_Description', 'linkedResourceID' (rollup array of Resource RECORD_IDs)
 */
export function transformAirtableProgram(
  record: AirtableRecord<any>
): ClinicalProgram {
  const f: any = record?.fields || {}
  const name: string = f['Program_Name'] || 'Clinical Program'
  const slug = programNameToSlug(name)
  const resourceCount = Array.isArray(f['linkedResourceID']) ? f['linkedResourceID'].length : 0

  const program: ClinicalProgram = {
    slug,
    name,
    description: f['Program_Description'] || '',
    icon: slug === 'tmm'
      ? 'CalendarCheck'
      : slug === 'mtmtft'
      ? 'Pill'
      : slug === 'tnt'
      ? 'TestTube2'
      : slug === 'a1c'
      ? 'ActivitySquare'
      : 'Stethoscope',
    resourceCount,
    lastUpdatedISO: record?.createdTime || new Date().toISOString(),
    downloadCount: undefined,
  }
  return program
}

/**
 * Transform an Airtable Resource record into ResourceItem
 * Resources fields used:
 * - 'resourceName', 'resourceFile' (attachments), links: 'typeName', 'clinicalgroupName', 'categoryName', 'tagName'
 * Link names are resolved outside and passed via resolver maps.
 */
export function transformAirtableResource(
  record: AirtableRecord<any>,
  linkResolvers: {
    typeNameById?: Record<string, string>
    categoryNameById?: Record<string, string>
    programNameById?: Record<string, string>
    tagNameById?: Record<string, string>
  } = {}
): ResourceItem {
  const f: any = record?.fields || {}
  const { url, sizeMB } = firstAttachment(f['resourceFile'])

  // Resolve first linked ids to names
  const typeIds: string[] = Array.isArray(f['typeName']) ? f['typeName'] : []
  const programIds: string[] = Array.isArray(f['clinicalgroupName']) ? f['clinicalgroupName'] : []
  const categoryIds: string[] = Array.isArray(f['categoryName']) ? f['categoryName'] : []
  const tagIds: string[] = Array.isArray(f['tagName']) ? f['tagName'] : []

  const typeName = typeIds.length ? linkResolvers.typeNameById?.[typeIds[0]] : undefined
  const programName = programIds.length ? linkResolvers.programNameById?.[programIds[0]] : undefined
  const categoryName = categoryIds.length ? linkResolvers.categoryNameById?.[categoryIds[0]] : undefined
  const tags = tagIds.map((id) => linkResolvers.tagNameById?.[id]).filter(Boolean) as string[]

  const item: ResourceItem = {
    id: record.id,
    name: f['resourceName'] || 'Resource',
    program: programName ? programNameToSlug(programName) : 'general',
    type: (typeName as any) || 'Additional Resources',
    category: categoryName,
    tags,
    fileUrl: url,
    sizeMB,
    lastUpdatedISO: record?.createdTime || new Date().toISOString(),
    downloadCount: undefined,
    bookmarked: Boolean(f['IsBookmarked']), // if you later add this field
  }
  return item
}

/**
 * Transform an Airtable Announcement record into Announcement
 * Placeholder: adjust if you later add an Announcements table.
 */
export function transformAirtableAnnouncement(
  record: AirtableRecord<any>
): Announcement {
  const f: any = record?.fields || {}
  const announcement: Announcement = {
    id: record.id,
    title: f['Title'] || 'Announcement',
    body: f['Body'] || '',
    dateISO: f['DateISO'] || record?.createdTime || new Date().toISOString(),
    type: f['Type'] || 'update',
  }
  return announcement
}

/**
 * Transform an Airtable Quick Access record into QuickAccessItem
 * Placeholder: adjust if you later add a Quick Access table.
 */
export function transformAirtableQuickAccess(
  record: AirtableRecord<any>
): QuickAccessItem {
  const f: any = record?.fields || {}
  const quick: QuickAccessItem = {
    id: record.id,
    title: f['Title'] || 'Quick Access',
    subtitle: f['Subtitle'] || '',
    icon: f['Icon'] || 'File',
    cta: f['CTA'] || 'Download',
    resourceId: f['ResourceId'] || undefined,
  }
  return quick
}
