/**
 * API client for ClinicalRxQ
 * - Uses Airtable REST directly with the new ClinicalRxQ Files base.
 * - Requires AIRTABLE_API_KEY in environment. No localStorage credentials; no in-app config.
 */

import {
  ApiError,
  AuthResponse,
  ClinicalProgram,
  LoginPayload,
  MemberAccount,
  ProgramSlug,
  QuickAccessItem,
  RecentActivity,
  ResourceItem,
  Announcement,
} from './types'
import { airtableService as AirtableService } from './airtable'
import {
  programs as mockPrograms,
  quickAccess as mockQuick,
  resources as mockResources,
  recentActivity as mockActivity,
  announcements as mockAnnouncements,
  mockMember,
} from './mockData'

/** Feature flag to force mock mode (false by default) */
const USE_MOCK = false

/** Local storage keys used for harmless UI persistence only */
const LS_TOKEN = 'crxq_token'
const LS_MEMBER = 'crxq_member'
const LS_LOGIN_ATTEMPTS = 'crxq_login_attempts'
const LS_BOOKMARKS = 'crxq_bookmarks'

/** Safe env */
function safeEnv(): Record<string, any> | undefined {
  try {
    return (import.meta as any)?.env
  } catch {
    return undefined
  }
}

/** Airtable configured only via environment */
function isAirtableConfigured(): boolean {
  const env = safeEnv()
  const apiKey = env?.AIRTABLE_API_KEY
  return !!apiKey
}

/** Same-origin backend base (not used; kept for forwards-compat) */
const API_BASE = '/api'

/** Backend helper (unused in this configuration) */
async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  } as RequestInit)

  if (!res.ok) {
    let detail: any = null
    try {
      detail = await res.json()
    } catch {}
    throw new ApiError(detail?.error || `API error ${res.status}`, res.status, detail?.code)
  }
  return res.json()
}

/** Tiny delay for mock timing parity */
const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/** Bookmark helpers (UI-only persistence) */
function getBookmarkSet(): Set<string> {
  const raw = localStorage.getItem(LS_BOOKMARKS)
  return new Set(raw ? (JSON.parse(raw) as string[]) : [])
}
function setBookmarkSet(set: Set<string>) {
  localStorage.setItem(LS_BOOKMARKS, JSON.stringify(Array.from(set)))
}

/** Mock adapters (unchanged) */
async function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  const attempts = Number(localStorage.getItem(LS_LOGIN_ATTEMPTS) || '0')
  if (attempts >= 5) throw new ApiError('Too many attempts. Please try again later.', 429, 'RATE_LIMIT')
  await wait(200)
  const isValidEmail = /^\S+@\S+\.\S+$/.test(payload.email)
  const isValidPass = payload.password.length >= 8
  if (isValidEmail && isValidPass) {
    const member: MemberAccount = { ...mockMember, email: payload.email, lastLoginISO: new Date().toISOString() }
    const token = 'mock-jwt-token'
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_MEMBER, JSON.stringify(member))
    localStorage.setItem(LS_LOGIN_ATTEMPTS, '0')
    return { token, member }
  }
  localStorage.setItem(LS_LOGIN_ATTEMPTS, String(attempts + 1))
  throw new ApiError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
}
async function mockLogout(): Promise<void> {
  await wait(50)
  localStorage.removeItem(LS_TOKEN)
  localStorage.removeItem(LS_MEMBER)
}
async function mockGetPrograms(): Promise<ClinicalProgram[]> {
  await wait(150)
  return mockPrograms
}
async function mockGetQuickAccess(): Promise<QuickAccessItem[]> {
  await wait(150)
  return mockQuick
}
async function mockGetBookmarkedResources(): Promise<ResourceItem[]> {
  await wait(150)
  const set = getBookmarkSet()
  return mockResources.map((r) => ({ ...r, bookmarked: set.has(r.id) || !!r.bookmarked })).filter((r) => r.bookmarked)
}
async function mockGetRecentActivity(): Promise<RecentActivity[]> {
  await wait(150)
  return mockActivity
}
async function mockGetAnnouncements(): Promise<Announcement[]> {
  await wait(150)
  return mockAnnouncements
}
async function mockToggleBookmark(resourceId: string, value?: boolean): Promise<boolean> {
  await wait(80)
  const set = getBookmarkSet()
  const should = value ?? !set.has(resourceId)
  if (should) set.add(resourceId)
  else set.delete(resourceId)
  setBookmarkSet(set)
  return should
}
async function mockGetProgramResources(slug: ProgramSlug): Promise<ResourceItem[]> {
  await wait(150)
  return mockResources.filter((r) => r.program === slug && r.type === 'Documentation Forms')
}

/** Direct Airtable adapters (new schema) */
async function atGetPrograms(): Promise<ClinicalProgram[]> {
  return AirtableService.getClinicalPrograms()
}
async function atGetResources(filters?: any): Promise<ResourceItem[]> {
  return AirtableService.getResources(filters)
}
async function atGetProgramDocumentationForms(slug: ProgramSlug): Promise<ResourceItem[]> {
  return AirtableService.getProgramDocumentationForms(slug)
}

/** Auth via Airtable (env only) */
async function realLogin(payload: LoginPayload): Promise<AuthResponse> {
  const attempts = Number(localStorage.getItem(LS_LOGIN_ATTEMPTS) || '0')
  if (attempts >= 5) throw new ApiError('Too many attempts. Please try again later.', 429, 'RATE_LIMIT')
  try {
    const member = await AirtableService.authenticateMember(payload.email, payload.password)
    const token = 'real-jwt-token'
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_MEMBER, JSON.stringify(member))
    localStorage.setItem(LS_LOGIN_ATTEMPTS, '0')
    return { token, member }
  } catch (e) {
    localStorage.setItem(LS_LOGIN_ATTEMPTS, String(attempts + 1))
    throw e
  }
}
async function realLogout(): Promise<void> {
  await wait(80)
  localStorage.removeItem(LS_TOKEN)
  localStorage.removeItem(LS_MEMBER)
}

/**
 * Exported API facade
 */
export const Api = {
  /**
   * Deprecated: no runtime configuration; kept as a no-op for compatibility.
   */
  configureAirtable(_: { apiKey: string; baseId?: string }) {
    return false
  },

  /** Check if Airtable is configured via env. */
  isAirtableConfigured(): boolean {
    return isAirtableConfigured()
  },

  /** Test Airtable by loading programs. */
  async testAirtableConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const list = await AirtableService.getClinicalPrograms()
      return { ok: Array.isArray(list) }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Unknown error' }
    }
  },

  // Auth
  async login(payload: LoginPayload) {
    if (USE_MOCK) return mockLogin(payload)
    if (isAirtableConfigured()) return realLogin(payload)
    return mockLogin(payload)
  },
  async logout() {
    if (USE_MOCK) return mockLogout()
    return realLogout()
  },
  getStoredAuth(): AuthResponse | null {
    const token = localStorage.getItem(LS_TOKEN)
    const memberRaw = localStorage.getItem(LS_MEMBER)
    if (!token || !memberRaw) return null
    try {
      const member = JSON.parse(memberRaw) as MemberAccount
      return { token, member }
    } catch {
      return null
    }
  },

  // Programs
  async getPrograms() {
    if (USE_MOCK) return mockGetPrograms()
    if (isAirtableConfigured()) return atGetPrograms()
    return mockGetPrograms()
  },

  // Dashboard quick access (mock-only for now)
  async getQuickAccess() {
    if (USE_MOCK) return mockGetQuickAccess()
    return mockGetQuickAccess()
  },

  async getBookmarkedResources() {
    if (USE_MOCK) return mockGetBookmarkedResources()
    const set = getBookmarkSet()
    if (isAirtableConfigured()) {
      const list = await atGetResources({})
      return list.map((r) => ({ ...r, bookmarked: set.has(r.id) || !!r.bookmarked })).filter((r) => r.bookmarked)
    }
    return mockGetBookmarkedResources()
  },

  async getRecentActivity() {
    if (USE_MOCK) return mockGetRecentActivity()
    return mockGetRecentActivity()
  },

  async getAnnouncements() {
    if (USE_MOCK) return mockGetAnnouncements()
    return mockGetAnnouncements()
  },

  async toggleBookmark(resourceId: string, value?: boolean) {
    if (USE_MOCK) return mockToggleBookmark(resourceId, value)
    // Local persistence only (Airtable has no bookmark field)
    const set = getBookmarkSet()
    const should = value ?? !set.has(resourceId)
    if (should) set.add(resourceId)
    else set.delete(resourceId)
    setBookmarkSet(set)
    return should
  },

  // Program-specific (Documentation Forms for tab)
  async getProgramResources(slug: ProgramSlug) {
    if (USE_MOCK) return mockGetProgramResources(slug)
    if (isAirtableConfigured()) return atGetProgramDocumentationForms(slug)
    return mockGetProgramResources(slug)
  },

  // Library
  async getResources(filters?: any) {
    if (USE_MOCK) return mockResources
    if (isAirtableConfigured()) return atGetResources(filters)
    return mockResources
  },

  async getResourceById(id: string) {
    if (USE_MOCK) return (mockResources.find((r) => r.id === id) as any)
    if (isAirtableConfigured()) return AirtableService.getResourceById(id)
    return mockResources.find((r) => r.id === id) as any
  },
}
