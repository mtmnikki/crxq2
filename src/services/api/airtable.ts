/**
 * Airtable API service (ClinicalRxQ Files base)
 * - Uses new Base ID and table/field IDs exactly as provided.
 * - Reads API key from environment only (AIRTABLE_API_KEY). No localStorage. No UI configurator.
 * - Uses returnFieldsByFieldId=true to address fields by ID (robust to renames).
 *
 * Tables (IDs):
 * - ClinicalPrograms: tblXsjw9EvEX1JnCy
 * - TrainingModules: tblrXWJ8gC6G3L2wG
 * - ProtocolManuals: tblh5Hqrd512J5C9e
 * - DocumentationForms: tblFahap8ERhQk0p5
 * - PatientHandouts: tblF0sNzTgGF4EBga
 * - ClinicalGuidelines: tblfIcFCFpVlOpsGr
 * - MedicalBillingResources: tbly4NjBbcptuc9G5
 * - AdditionalResources: tbldWUMJBg4nuq6rQ
 * - memberAccounts: tblxoJz15zMr6CeeV
 */

import {
  ApiError,
  ResourceItem,
  ClinicalProgram,
  MemberAccount,
  ResourceFilters,
  ResourceType,
  ProgramSlug,
} from './types'

/** Get environment safely (supports esbuild) */
function safeEnv(): Record<string, any> | undefined {
  try {
    return (import.meta as any)?.env as Record<string, any>
  } catch {
    return undefined
  }
}

/** Pick an env var */
function envVar(name: string): string | undefined {
  const env = safeEnv()
  return env?.[name]
}

/** First attachment helper */
function firstAttachment(list: any): { url: string; sizeMB?: number } {
  if (!Array.isArray(list) || list.length === 0) return { url: '' }
  const att = list[0]
  const url = att?.url ? String(att.url) : ''
  const size = att?.size ? Number(att.size) : 0
  return { url, sizeMB: size ? +(size / (1024 * 1024)).toFixed(2) : undefined }
}

/** Icon by slug for program cards */
function iconBySlug(slug?: string): string {
  const s = (slug || '').toLowerCase()
  if (s === 'tmm') return 'CalendarCheck'
  if (s === 'mtmtft') return 'Pill'
  if (s === 'tnt') return 'TestTube2'
  if (s === 'a1c') return 'ActivitySquare'
  if (s === 'oc') return 'Stethoscope'
  return 'Layers'
}

/**
 * Airtable service bound to the provided base/schema.
 */
export class AirtableService {
  /** REST root */
  private readonly baseUrl = 'https://api.airtable.com/v0'
  /** Base ID (fixed per request) */
  private readonly baseId = 'appuo6esxsc55yCgI'

  /** Table IDs */
  private readonly tables = {
    programs: 'tblXsjw9EvEX1JnCy',
    training: 'tblrXWJ8gC6G3L2wG',
    protocols: 'tblh5Hqrd512J5C9e',
    forms: 'tblFahap8ERhQk0p5',
    handouts: 'tblF0sNzTgGF4EBga',
    guidelines: 'tblfIcFCFpVlOpsGr',
    billing: 'tbly4NjBbcptuc9G5',
    additional: 'tbldWUMJBg4nuq6rQ',
    members: 'tblxoJz15zMr6CeeV',
  }

  /** Field IDs (by table) */
  private readonly fields = {
    programs: {
      programName: 'fldZMC178eiIyTq3w',
      programDescription: 'fldVNSdftxLraYp6P',
      programOverview: 'fldNRUwiQcesXso0s',
      experienceLevel: 'fldAxTeupBBeP9XDb',
      programSlug: 'fldqrANZRsEuolDR6',
      trainingLinks: 'fldrc5dQ9rDynGNIM',
      protocolLinks: 'fldsAVzNg92Mdz1K8',
      formLinks: 'fldlHsJtPJcTl8pyp',
      additionalLinks: 'flduqKYNvbzw6iuOo',
    },
    training: {
      moduleName: 'fldGNfcyijbCckJ77',
      moduleLength: 'fldCbTTBwwjxp6z7d',
      moduleFile: 'fld7FOPvfmAxWd1TI',
      moduleLink: 'fldKyw9533skmVv3p',
      programSlug: 'fldV7PD4KiUwJqdjY',
      sortOrder: 'fldoqOT0FDj1igBAg',
    },
    protocols: {
      protocolName: 'fldBy2Thpsn4AlIbU',
      protocolFile: 'fldi28XFMhDfcosX2',
      fileLink: 'fld1fFDUsAnnAmmLo',
      programSlug: 'fldkzxDH20zEQ51vl',
    },
    forms: {
      formName: 'fldk7HpJIGHv3VOc4',
      formFile: 'fldrRhyCyGgUpWuIG',
      formCategory: 'fldfuX4T5a7NBb9ey',
      formSubcategory: 'fldzNsQ9HJxST0QSD',
      formLink: 'fldGi4HEH9nq4BLVy',
      programSlug: 'fld6gEf0zT4Hkc2Ne',
    },
    handouts: {
      handoutName: 'fld9yN8YbZSDs81IS',
      handoutFile: 'fldPxpdAjgmLUrree',
    },
    guidelines: {
      guidelineName: 'fld73kw2epKg8zjsP',
      guidelineFile: 'fldaMNCCDzIs7kMur',
      guidelineLink: 'fld9o5nSKaww5gEH3',
    },
    billing: {
      billingName: 'fldeYxRrwTvAZxtyS',
      billingFile: 'fldHzAXErEJMBIPkQ',
    },
    additional: {
      resourceName: 'fldPhWKcmTg8mcNUz',
      resourceFile: 'fldOahqDBWH463d6y',
      resourceLink: 'fldTqxYoEEFAw0Y0p',
      programSlug: 'fldA2oPeW3DiTsae0',
    },
    members: {
      email: 'fldn55xDaXjqTHb2O',
      tempPassword: 'fldx139PuTqJcH8jA',
      passwordHash: 'fldExgYYdxtZSIsPE',
      firstName: 'fld3O5fcRKLUL5mVz',
      lastName: 'fldKRPy23W3qwTqN6',
      pharmacyName: 'flds16myqpFa2qzIw',
      subscriptionStatus: 'fldKbzgtYIRkJOalj',
      lastActivity: 'fldb0j5XwlKclqKlQ',
    },
  }

  /** API Key from environment only */
  private get apiKey(): string {
    const key = envVar('AIRTABLE_API_KEY')
    return key ? String(key) : ''
  }

  /** Is Airtable configured? */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * GET records with automatic pagination.
   * Uses returnFieldsByFieldId=true to access fields by ID consistently.
   */
  private async getRecords<T = any>(
    tableId: string,
    params: URLSearchParams = new URLSearchParams()
  ): Promise<Array<{ id: string; createdTime: string; fields: Record<string, any> }>> {
    if (!this.apiKey) throw new ApiError('AIRTABLE_API_KEY is not set', 500, 'CONFIG_ERROR')

    const out: Array<{ id: string; createdTime: string; fields: Record<string, any> }> = []
    let offset: string | undefined

    do {
      const p = new URLSearchParams(params.toString())
      p.set('returnFieldsByFieldId', 'true')
      if (offset) p.set('offset', offset)
      const url = `${this.baseUrl}/${this.baseId}/${encodeURIComponent(tableId)}?${p.toString()}`

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        let detail: any = null
        try {
          detail = await res.json()
        } catch {}
        if (res.status === 429) {
          const retry = Number(res.headers.get('Retry-After') || '1')
          await new Promise((r) => setTimeout(r, retry * 1000))
          continue
        }
        throw new ApiError(detail?.error?.message || `Airtable error ${res.status}`, res.status, detail?.error?.type)
      }

      const data = await res.json()
      if (Array.isArray(data.records)) out.push(...data.records)
      offset = data.offset
    } while (offset)

    return out
  }

  /**
   * GET single record by id.
   */
  private async getRecord<T = any>(
    tableId: string,
    id: string
  ): Promise<{ id: string; createdTime: string; fields: Record<string, any> }> {
    if (!this.apiKey) throw new ApiError('AIRTABLE_API_KEY is not set', 500, 'CONFIG_ERROR')
    const url = `${this.baseUrl}/${this.baseId}/${encodeURIComponent(tableId)}/${encodeURIComponent(id)}?returnFieldsByFieldId=true`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      let detail: any = null
      try {
        detail = await res.json()
      } catch {}
      throw new ApiError(detail?.error?.message || `Airtable error ${res.status}`, res.status, detail?.error?.type)
    }
    return res.json()
  }

  /**
   * Authenticate member (dev-appropriate).
   * - Finds record by LOWER({Email Address}) and compares Temp Password (plain) or falls back to error if only hash present.
   */
  async authenticateMember(email: string, password: string): Promise<MemberAccount> {
    if (!this.isConfigured()) throw new ApiError('AIRTABLE_API_KEY is not set', 500, 'CONFIG_ERROR')

    // filterByFormula uses field name, not field ID
    const ff = `LOWER({Email Address})='${email.trim().toLowerCase().replace(/'/g, "\\'")}'`
    const params = new URLSearchParams()
    params.set('filterByFormula', ff)
    params.set('maxRecords', '1')

    const matches = await this.getRecords(this.tables.members, params)
    if (matches.length === 0) throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

    const r = matches[0]
    const f = r.fields
    const tempPass = String(f[this.fields.members.tempPassword] || '')

    if (tempPass && password === tempPass) {
      const member: MemberAccount = {
        id: r.id,
        pharmacyName: String(f[this.fields.members.pharmacyName] || ''),
        email: String(f[this.fields.members.email] || email),
        subscriptionStatus: (String(f[this.fields.members.subscriptionStatus] || 'Active') as any) || 'Active',
        lastLoginISO: String(f[this.fields.members.lastActivity] || r.createdTime || new Date().toISOString()),
      }
      return member
    }

  /**
   * Fetch clinical programs.
   * Maps to ClinicalProgram for UI.
   */
  async getClinicalPrograms(): Promise<ClinicalProgram[]> {
    const records = await this.getRecords(this.tables.programs)
    return records.map((r) => {
      const f = r.fields
      const slug = String(f[this.fields.programs.programSlug] || '').toLowerCase() as ProgramSlug
      const trainingCount = Array.isArray(f[this.fields.programs.trainingLinks]) ? f[this.fields.programs.trainingLinks].length : 0
      const protoCount = Array.isArray(f[this.fields.programs.protocolLinks]) ? f[this.fields.programs.protocolLinks].length : 0
      const formCount = Array.isArray(f[this.fields.programs.formLinks]) ? f[this.fields.programs.formLinks].length : 0
      const addlCount = Array.isArray(f[this.fields.programs.additionalLinks]) ? f[this.fields.programs.additionalLinks].length : 0

      const prog: ClinicalProgram = {
        slug: (slug || 'tmm') as ProgramSlug,
        name: String(f[this.fields.programs.programName] || 'Program'),
        description: String(f[this.fields.programs.programDescription] || ''),
        icon: iconBySlug(slug),
        resourceCount: trainingCount + protoCount + formCount + addlCount,
        lastUpdatedISO: r.createdTime,
        downloadCount: undefined,
      }
      return prog
    })
  }

  /**
   * Fetch documentation forms for a program (used by ProgramPage "Documentation Forms" tab).
   */
  async getProgramDocumentationForms(slug: ProgramSlug): Promise<ResourceItem[]> {
    const params = new URLSearchParams()
    // filterByFormula uses field name, not ID
    params.set('filterByFormula', `{programSlug}='${slug}'`)
    const records = await this.getRecords(this.tables.forms, params)

    return records.map((r) => {
      const f = r.fields
      const link = String(f[this.fields.forms.formLink] || '')
      const { url, sizeMB } = firstAttachment(f[this.fields.forms.formFile])
      const item: ResourceItem = {
        id: r.id,
        name: String(f[this.fields.forms.formName] || 'Form'),
        program: slug,
        type: 'Documentation Forms',
        category: String(f[this.fields.forms.formCategory] || ''),
        tags: undefined,
        fileUrl: link || url,
        sizeMB,
        lastUpdatedISO: r.createdTime,
        downloadCount: undefined,
        bookmarked: false,
      }
      return item
    })
  }

  /**
   * Aggregate resources across all tables for the Resource Library.
   * Applies client-side filters for simplicity.
   */
  async getResources(filters: Partial<ResourceFilters> = {}): Promise<ResourceItem[]> {
    // Pull all tables in parallel
    const [forms, protocols, training, handouts, guidelines, billing, additional] = await Promise.all([
      this.getRecords(this.tables.forms),
      this.getRecords(this.tables.protocols),
      this.getRecords(this.tables.training),
      this.getRecords(this.tables.handouts),
      this.getRecords(this.tables.guidelines),
      this.getRecords(this.tables.billing),
      this.getRecords(this.tables.additional),
    ])

    const items: ResourceItem[] = [
      // Forms
      ...forms.map((r) => {
        const f = r.fields
        const link = String(f[this.fields.forms.formLink] || '')
        const { url, sizeMB } = firstAttachment(f[this.fields.forms.formFile])
        return {
          id: r.id,
          name: String(f[this.fields.forms.formName] || 'Form'),
          program: (String(f[this.fields.forms.programSlug] || '').toLowerCase() as any) || 'general',
          type: 'Documentation Forms' as ResourceType,
          category: String(f[this.fields.forms.formCategory] || ''),
          tags: undefined,
          fileUrl: link || url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Protocols
      ...protocols.map((r) => {
        const f = r.fields
        const link = String(f[this.fields.protocols.fileLink] || '')
        const { url, sizeMB } = firstAttachment(f[this.fields.protocols.protocolFile])
        return {
          id: r.id,
          name: String(f[this.fields.protocols.protocolName] || 'Protocol'),
          program: (String(f[this.fields.protocols.programSlug] || '').toLowerCase() as any) || 'general',
          type: 'Protocols' as ResourceType,
          category: undefined,
          tags: undefined,
          fileUrl: link || url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Training
      ...training.map((r) => {
        const f = r.fields
        const link = String(f[this.fields.training.moduleLink] || '')
        const { url, sizeMB } = firstAttachment(f[this.fields.training.moduleFile])
        return {
          id: r.id,
          name: String(f[this.fields.training.moduleName] || 'Training Module'),
          program: (String(f[this.fields.training.programSlug] || '').toLowerCase() as any) || 'general',
          type: 'Training Materials' as ResourceType,
          category: String(f[this.fields.training.moduleLength] || ''),
          tags: undefined,
          fileUrl: link || url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Patient Handouts
      ...handouts.map((r) => {
        const f = r.fields
        const { url, sizeMB } = firstAttachment(f[this.fields.handouts.handoutFile])
        return {
          id: r.id,
          name: String(f[this.fields.handouts.handoutName] || 'Patient Handout'),
          program: 'general',
          type: 'Patient Handouts' as ResourceType,
          category: undefined,
          tags: undefined,
          fileUrl: url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Clinical Guidelines
      ...guidelines.map((r) => {
        const f = r.fields
        const link = String(f[this.fields.guidelines.guidelineLink] || '')
        const { url, sizeMB } = firstAttachment(f[this.fields.guidelines.guidelineFile])
        return {
          id: r.id,
          name: String(f[this.fields.guidelines.guidelineName] || 'Clinical Guideline'),
          program: 'general',
          type: 'Clinical Resources' as ResourceType,
          category: undefined,
          tags: undefined,
          fileUrl: link || url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Medical Billing
      ...billing.map((r) => {
        const f = r.fields
        const { url, sizeMB } = firstAttachment(f[this.fields.billing.billingFile])
        return {
          id: r.id,
          name: String(f[this.fields.billing.billingName] || 'Billing Resource'),
          program: 'general',
          type: 'Medical Billing' as ResourceType,
          category: undefined,
          tags: undefined,
          fileUrl: url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
      // Additional Resources
      ...additional.map((r) => {
        const f = r.fields
        const link = String(f[this.fields.additional.resourceLink] || '')
        const { url, sizeMB } = firstAttachment(f[this.fields.additional.resourceFile])
        const prog = String(f[this.fields.additional.programSlug] || '').toLowerCase()
        return {
          id: r.id,
          name: String(f[this.fields.additional.resourceName] || 'Resource'),
          program: (prog as any) || 'general',
          type: 'Additional Resources' as ResourceType,
          category: undefined,
          tags: undefined,
          fileUrl: link || url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        } as ResourceItem
      }),
    ]

    // Apply client-side filters
    let filtered = items

    if (filters.program) {
      const wanted = Array.isArray(filters.program) ? filters.program.map((p) => String(p).toLowerCase()) : [String(filters.program).toLowerCase()]
      filtered = filtered.filter((it) => (it.program ? wanted.includes(String(it.program).toLowerCase()) : wanted.includes('general')))
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? (filters.type as ResourceType[]) : [filters.type]
      const typeSet = new Set(types)
      filtered = filtered.filter((it) => typeSet.has(it.type))
    }

    if (filters.search) {
      const q = String(filters.search).toLowerCase()
      filtered = filtered.filter((it) => it.name.toLowerCase().includes(q))
    }

    // Sorting
    const sortBy = filters.sortBy || 'name'
    const sortOrder = (filters.sortOrder || 'asc') === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      const aVal =
        sortBy === 'name'
          ? a.name
          : sortBy === 'lastUpdated'
          ? a.lastUpdatedISO || ''
          : sortBy === 'downloadCount'
          ? a.downloadCount || 0
          : sortBy === 'category'
          ? a.category || ''
          : a.name
      const bVal =
        sortBy === 'name'
          ? b.name
          : sortBy === 'lastUpdated'
          ? b.lastUpdatedISO || ''
          : sortBy === 'downloadCount'
          ? b.downloadCount || 0
          : sortBy === 'category'
          ? b.category || ''
          : b.name
      if (aVal < bVal) return -1 * sortOrder
      if (aVal > bVal) return 1 * sortOrder
      return 0
    })

    return filtered
  }

  /**
   * Fetch a single resource by id by probing all content tables.
   */
  async getResourceById(id: string): Promise<ResourceItem> {
    const probeOrder = [
      { table: this.tables.forms, type: 'Documentation Forms' as ResourceType },
      { table: this.tables.protocols, type: 'Protocols' as ResourceType },
      { table: this.tables.training, type: 'Training Materials' as ResourceType },
      { table: this.tables.additional, type: 'Additional Resources' as ResourceType },
      { table: this.tables.handouts, type: 'Patient Handouts' as ResourceType },
      { table: this.tables.guidelines, type: 'Clinical Resources' as ResourceType },
      { table: this.tables.billing, type: 'Medical Billing' as ResourceType },
    ]

    for (const entry of probeOrder) {
      try {
        const r = await this.getRecord(entry.table, id)
        // Map minimally (used mainly to refresh expiring file URLs)
        const f = r.fields
        let name = ''
        let url = ''
        let sizeMB: number | undefined
        let program: ProgramSlug | 'general' = 'general'

        switch (entry.type) {
          case 'Documentation Forms': {
            name = String(f[this.fields.forms.formName] || 'Form')
            program = (String(f[this.fields.forms.programSlug] || '').toLowerCase() as any) || 'general'
            const link = String(f[this.fields.forms.formLink] || '')
            const first = firstAttachment(f[this.fields.forms.formFile])
            url = link || first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Protocols': {
            name = String(f[this.fields.protocols.protocolName] || 'Protocol')
            program = (String(f[this.fields.protocols.programSlug] || '').toLowerCase() as any) || 'general'
            const link = String(f[this.fields.protocols.fileLink] || '')
            const first = firstAttachment(f[this.fields.protocols.protocolFile])
            url = link || first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Training Materials': {
            name = String(f[this.fields.training.moduleName] || 'Training Module')
            program = (String(f[this.fields.training.programSlug] || '').toLowerCase() as any) || 'general'
            const link = String(f[this.fields.training.moduleLink] || '')
            const first = firstAttachment(f[this.fields.training.moduleFile])
            url = link || first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Additional Resources': {
            name = String(f[this.fields.additional.resourceName] || 'Resource')
            program = (String(f[this.fields.additional.programSlug] || '').toLowerCase() as any) || 'general'
            const link = String(f[this.fields.additional.resourceLink] || '')
            const first = firstAttachment(f[this.fields.additional.resourceFile])
            url = link || first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Patient Handouts': {
            name = String(f[this.fields.handouts.handoutName] || 'Patient Handout')
            const first = firstAttachment(f[this.fields.handouts.handoutFile])
            url = first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Clinical Resources': {
            name = String(f[this.fields.guidelines.guidelineName] || 'Clinical Guideline')
            const link = String(f[this.fields.guidelines.guidelineLink] || '')
            const first = firstAttachment(f[this.fields.guidelines.guidelineFile])
            url = link || first.url
            sizeMB = first.sizeMB
            break
          }
          case 'Medical Billing': {
            name = String(f[this.fields.billing.billingName] || 'Billing Resource')
            const first = firstAttachment(f[this.fields.billing.billingFile])
            url = first.url
            sizeMB = first.sizeMB
            break
          }
        }

        return {
          id: r.id,
          name,
          program,
          type: entry.type,
          category: undefined,
          tags: undefined,
          fileUrl: url,
          sizeMB,
          lastUpdatedISO: r.createdTime,
          downloadCount: undefined,
          bookmarked: false,
        }
      } catch {
        // try next table
      }
    }

    throw new ApiError('Resource not found', 404, 'NOT_FOUND')
  }
}

/** Export singleton */
export const airtableService = new AirtableService()
