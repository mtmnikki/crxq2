/**
 * AirtableConfigBanner
 * A small top-of-app banner to configure Airtable credentials (PAT and Base ID) at runtime.
 * Shows when Airtable is not configured; allows saving and testing the connection.
 */

import React, { useEffect, useState } from 'react'
import { Api } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { CheckCircle, AlertTriangle } from 'lucide-react'

/**
 * Props for AirtableConfigBanner
 */
interface AirtableConfigBannerProps {
  /** Optionally force showing even if configured (debug) */
  forceShow?: boolean
}

/**
 * Airtable configuration banner component
 */
const AirtableConfigBanner: React.FC<AirtableConfigBannerProps> = ({ forceShow }) => {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [baseId, setBaseId] = useState<string>('applrV1CPpt6GuK2d')
  const [testing, setTesting] = useState(false)
  const [testOk, setTestOk] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load initial state (detect if configured already)
   */
  useEffect(() => {
    const isConfigured = Api.isAirtableConfigured()
    setConfigured(isConfigured)
    setOpen(!isConfigured || !!forceShow)
    try {
      const lsKey = localStorage.getItem('AIRTABLE_PAT') || localStorage.getItem('AIRTABLE_API_KEY') || ''
      const lsBase = localStorage.getItem('AIRTABLE_BASE_ID') || 'applrV1CPpt6GuK2d'
      setApiKey(lsKey)
      setBaseId(lsBase)
    } catch {}
  }, [forceShow])

  /**
   * Save credentials and test connection
   */
  const handleSaveAndTest = async () => {
    setError(null)
    setTesting(true)
    setTestOk(null)
    try {
      Api.configureAirtable({ apiKey, baseId })
      const res = await Api.testAirtableConnection()
      setTestOk(res.ok)
      setConfigured(res.ok)
      if (res.ok) {
        setTimeout(() => setOpen(false), 800)
      } else {
        setError(res.error || 'Failed to connect.')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect.')
      setTestOk(false)
    } finally {
      setTesting(false)
    }
  }

  if (configured && !forceShow) return null

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Airtable is not configured. Paste your Personal Access Token to load live content.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="bg-transparent">
            {open ? 'Hide' : 'Configure'}
          </Button>
        </div>
        {open && (
          <div className="mt-3 rounded-md bg-white p-3 text-slate-800">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <Label htmlFor="airtable_pat">Airtable Personal Access Token</Label>
                <Input
                  id="airtable_pat"
                  placeholder="pat_****************"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <div className="mt-1 text-xs text-slate-500">
                  Your token is stored in your browser’s localStorage for development only. For production, use a backend proxy.
                </div>
              </div>
              <div>
                <Label htmlFor="airtable_base">Base ID</Label>
                <Input
                  id="airtable_base"
                  placeholder="applrV1CPpt6GuK2d"
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                />
                <div className="mt-1 text-xs text-slate-500">Default set to your provided base ID.</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button onClick={handleSaveAndTest} disabled={!apiKey || testing}>
                {testing ? 'Testing…' : 'Save & Test'}
              </Button>
              {testOk && (
                <div className="flex items-center gap-1 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Connected. Loading live content…
                </div>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AirtableConfigBanner