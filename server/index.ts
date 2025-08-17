/**
 * Minimal Airtable proxy server (no external deps)
 * - Uses Node's http module to expose REST endpoints
 * - Requires environment variables: AIRTABLE_API_KEY, AIRTABLE_BASE_ID
 * - No placeholder values included. If env is missing, responds with 500 CONFIG_ERROR.
 * Security:
 * - Do not expose this server without appropriate deployment hardening (TLS, rate limiting, auth).
 * - This demo intentionally avoids dependencies per project constraints.
 */

import http from 'http'
import { URL } from 'url'

/**
 * Environment access helper, avoids injecting defaults
 */
function getEnv(name: string): string | undefined {
  return process.env[name]
}

/**
 * Send a JSON response with standard headers
 */
function sendJson(
  res: http.ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {}
) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // Enable CORS by default; if reverse-proxying on same origin, proxy should strip/override
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  })
  res.end(body)
}

/**
 * Handle preflight CORS
 */
function handleOptions(req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
  })
  res.end()
}

/**
 * Airtable REST client helper
 */
async function airtableRequest<T = any>(
  path: string,
  params?: URLSearchParams,
  init?: RequestInit
): Promise<T> {
  const apiKey = getEnv('AIRTABLE_API_KEY')
  const baseId = getEnv('AIRTABLE_BASE_ID')

  if (!apiKey || !baseId) {
    throw Object.assign(new Error('Airtable not configured'), {
      status: 500,
      code: 'CONFIG_ERROR',
    })
  }

  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${path}${params ? `?${params.toString()}` : ''}`

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  } as RequestInit)

  if (!res.ok) {
    let detail: any = null
    try {
      detail = await res.json()
    } catch {
      // ignore
    }
    const err = new Error(
      detail?.error?.message || `Airtable request failed: ${res.status}`
    ) as any
    err.status = res.status
    err.code = detail?.error?.type || 'AIRTABLE_ERROR'
    throw err
  }

  return (await res.json()) as T
}

/**
 * Defensive pick for first attachment url
 */
function firstAttachmentUrl(file: any): string | undefined {
  try {
    if (Array.isArray(file) && file.length > 0 && file[0]?.url) return String(file[0].url)
  } catch {
    // noop
  }
  return undefined
}

/**
 * Transform helpers: map Airtable records -> app models
 * Field names are aligned with the app's Airtable client and README.
 */
function mapProgram(record: any) {
  const f = record?.fields ?? {}
  return {
    slug: f.Slug || f.Code || 'program',
    name: f.Name || 'Clinical Program',
    description: f.Description || f.Summary || '',
    icon: f.Icon || 'Layers',
    resourceCount:
      Number(
        f.ResourceCount ||
          (Array.isArray(f.Resources) ? f.Resources.length : 0) ||
          0
      ),
    lastUpdatedISO: f.LastUpdatedISO || f.UpdatedISO || record?.createdTime,
    downloadCount: Number(f.DownloadCount || 0),
  }
}

function mapResource(record: any) {
  const f = record?.fields ?? {}
  return {
    id: record.id,
    name: f.DisplayName || f.Name || f.Title || 'Resource',
    program: f.Program || f.ProgramCode || 'general',
    type: f.ResourceType || f.Type || 'Additional Resources',
    category: f.Category || '',
    tags: Array.isArray(f.Tags) ? f.Tags : [],
    fileUrl: firstAttachmentUrl(f.File) || f.Url || f.Link,
    sizeMB:
      Array.isArray(f.File) && f.File[0]?.size
        ? Number((Number(f.File[0].size) / (1024 * 1024)).toFixed(2))
        : f.SizeMB || undefined,
    lastUpdatedISO: f.LastUpdatedISO || f.UpdatedISO || record?.createdTime,
    downloadCount: Number(f.DownloadCount || 0),
    bookmarked: Boolean(f.IsBookmarked),
  }
}

function mapAnnouncement(record: any) {
  const f = record?.fields ?? {}
  return {
    id: record.id,
    title: f.Title || 'Announcement',
    body: f.Body || f.Content || '',
    dateISO: f.DateISO || record?.createdTime,
    type: f.Type || undefined,
  }
}

function mapQuickAccess(record: any) {
  const f = record?.fields ?? {}
  return {
    id: record.id,
    title: f.Title || f.Name || 'Quick Access',
    subtitle: f.Subtitle || '',
    icon: f.Icon || 'File',
    cta: f.CTA || 'Download',
    resourceId: f.ResourceId || undefined,
  }
}

/**
 * Build Airtable filterByFormula from query inputs.
 * Note: Keep formula concise for Airtable limits.
 */
function buildResourceFilterFormula(q: URLSearchParams): string | undefined {
  const parts: string[] = []

  const program = q.get('program')
  if (program) parts.push(`{Program} = '${program}'`)

  const type = q.get('type')
  if (type) parts.push(`{ResourceType} = '${type}'`)

  const bookmarked = q.get('bookmarked')
  if (bookmarked === 'true') parts.push(`{IsBookmarked} = TRUE()`)

  const search = q.get('search')
  if (search) {
    const term = search.replace(/'/g, "\\'")
    // Simple case-insensitive search over common fields
    parts.push(
      `OR(` +
        `FIND(LOWER('${term}'), LOWER({DisplayName}&' '&ARRAYJOIN({Tags})&' '&{Category}))>0,` +
        `FIND(LOWER('${term}'), LOWER({Name}&' '&{Title}))>0` +
      `)`
    )
  }

  if (parts.length === 0) return undefined
  if (parts.length === 1) return parts[0]
  return `AND(${parts.join(',')})`
}

/**
 * Map sort inputs to Airtable sort descriptors
 */
function buildResourceSort(q: URLSearchParams) {
  const sortBy = q.get('sortBy') || 'name'
  const sortOrder = (q.get('sortOrder') || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'

  const mapping: Record<string, string> = {
    name: 'DisplayName',
    lastUpdated: 'LastUpdatedISO',
    downloadCount: 'DownloadCount',
    category: 'Category',
  }

  const field = mapping[sortBy] || 'DisplayName'
  return [{ field, direction: sortOrder as 'asc' | 'desc' }]
}

/**
 * Request router
 */
const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) {
      return sendJson(res, 400, { error: 'Bad Request' })
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return handleOptions(req, res)
    }

    const url = new URL(req.url, 'http://localhost')
    const pathname = url.pathname

    // Programs
    if (req.method === 'GET' && pathname === '/api/programs') {
      const params = new URLSearchParams()
      params.append('filterByFormula', '{IsActive} = TRUE()')
      params.append('sort[0][field]', 'Name')
      params.append('sort[0][direction]', 'asc')
      const data = await airtableRequest<any>('Clinical%20Programs', params)
      const items = Array.isArray(data?.records) ? data.records.map(mapProgram) : []
      return sendJson(res, 200, items)
    }

    // Resources listing with filters
    if (req.method === 'GET' && pathname === '/api/resources') {
      const params = new URLSearchParams()
      const formula = buildResourceFilterFormula(url.searchParams)
      if (formula) params.append('filterByFormula', formula)

      // Pagination
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '50'), 1), 100)
      params.append('pageSize', String(limit))

      // Sort
      const sort = buildResourceSort(url.searchParams)
      sort.forEach((s, i) => {
        params.append(`sort[${i}][field]`, s.field)
        params.append(`sort[${i}][direction]`, s.direction)
      })

      const data = await airtableRequest<any>('Clinical%20Program%20Resources', params)
      const items = Array.isArray(data?.records) ? data.records.map(mapResource) : []
      return sendJson(res, 200, items)
    }

    // Single resource by ID
    if (req.method === 'GET' && pathname.startsWith('/api/resources/')) {
      const id = pathname.split('/').pop()
      if (!id) return sendJson(res, 400, { error: 'Missing resource id' })
      const record = await airtableRequest<any>(`Clinical%20Program%20Resources/${encodeURIComponent(id)}`)
      return sendJson(res, 200, mapResource(record))
    }

    // Announcements
    if (req.method === 'GET' && pathname === '/api/announcements') {
      const params = new URLSearchParams()
      params.append('filterByFormula', '{IsPublished} = TRUE()')
      params.append('sort[0][field]', 'DateISO')
      params.append('sort[0][direction]', 'desc')
      const data = await airtableRequest<any>('Announcements', params)
      const items = Array.isArray(data?.records) ? data.records.map(mapAnnouncement) : []
      return sendJson(res, 200, items)
    }

    // Quick Access
    if (req.method === 'GET' && pathname === '/api/quick-access') {
      const params = new URLSearchParams()
      params.append('filterByFormula', '{IsActive} = TRUE()')
      params.append('sort[0][field]', 'SortOrder')
      params.append('sort[0][direction]', 'asc')
      const data = await airtableRequest<any>('Quick%20Access', params)
      const items = Array.isArray(data?.records) ? data.records.map(mapQuickAccess) : []
      return sendJson(res, 200, items)
    }

    // Health check
    if (req.method === 'GET' && pathname === '/api/health') {
      const ok = Boolean(getEnv('AIRTABLE_API_KEY') && getEnv('AIRTABLE_BASE_ID'))
      return sendJson(res, ok ? 200 : 500, {
        ok,
        airtableConfigured: ok,
      })
    }

    // Not found
    return sendJson(res, 404, { error: 'Not Found' })
  } catch (err: any) {
    const status = err?.status || 500
    const code = err?.code || 'INTERNAL_ERROR'
    return sendJson(res, status, { error: err?.message || 'Server error', code })
  }
})

/**
 * Start only when run directly: node server/index.js
 * In integrated deployments, you may mount this handler in your platform runtime.
 */
if (require.main === module) {
  const port = Number(process.env.PORT || 8787)
  server.listen(port, () => {
    console.log(`Airtable proxy listening on http://localhost:${port}`)
  })
}

// Export handler for serverless adapters if needed
export default server
