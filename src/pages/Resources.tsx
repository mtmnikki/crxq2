/**
 * Resource Library Page
 * Full implementation with search, filters, pagination, and grid/list views.
 * NOTE: Per request, adjust the quick filter cards layout and compact the Download button in grid cards.
 * This version removes the lodash dependency by adding a small local debounce utility.
 */

import React, { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Checkbox } from '../components/ui/checkbox'
import {
  Search,
  FileText,
  List,
  FormInput,
  Video,
  Crosshair,
  Download,
  Star,
  Grid,
  List as ListIcon,
  Filter,
  X,
} from 'lucide-react'
import { Api } from '../services/api'
import { ResourceItem, ResourceType, ResourceFilters } from '../services/api/types'
import { useLocation } from 'react-router'

/**
 * Lightweight debounce utility to avoid external dependencies.
 * Returns a debounced function with a cancel method.
 */
type AnyFn = (...args: any[]) => void
interface Debounced<F extends AnyFn> {
  (...args: Parameters<F>): void
  cancel: () => void
}
function createDebounce<F extends AnyFn>(fn: F, wait = 300): Debounced<F> {
  let timer: number | undefined
  const debounced = ((...args: Parameters<F>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), wait)
  }) as Debounced<F>
  debounced.cancel = () => {
    if (timer) window.clearTimeout(timer)
  }
  return debounced
}

/**
 * Quick filter card
 * Re-styled to stack icon above label, both centered, with light brand accents.
 */
const QuickFilterCard: React.FC<{
  icon: React.ReactNode
  label: string
  count?: number
  onClick: () => void
  isActive?: boolean
}> = ({ icon, label, onClick, isActive }) => (
  <Card
    className={[
      'cursor-pointer transition-all duration-200',
      isActive ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md hover:border-blue-200/60',
    ].join(' ')}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#244575]/15 to-[#132B51]/15 text-[#244575]">
          {/* Icon bubble with subtle brand tint */}
          <div className="flex items-center justify-center">{icon}</div>
        </div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
      </div>
    </CardContent>
  </Card>
)

/**
 * Resource item component
 * Simplified per request: remove program/type badges and compact the download button width in grid cards.
 */
const ResourceItemCard: React.FC<{
  resource: ResourceItem
  isGrid: boolean
  onBookmark: (id: string, value: boolean) => void
}> = ({ resource, isGrid, onBookmark }) => {
  /** Toggle bookmark for a given resource card */
  const handleBookmark = () => {
    onBookmark(resource.id, !resource.bookmarked)
  }

  if (isGrid) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm line-clamp-2">{resource.name}</CardTitle>
              {/* Program/Type badges removed per request */}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="ml-2"
              aria-label={resource.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Star
                className={`h-4 w-4 ${
                  resource.bookmarked ? 'fill-amber-400 text-amber-400' : 'text-gray-400'
                }`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Keep the action compact — do NOT stretch across the card */}
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{resource.name}</h3>
                {/* Program/Type badges removed; optionally keep file size if present */}
                <div className="mt-1">
                  {resource.sizeMB && <span className="text-xs text-gray-500">{resource.sizeMB} MB</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              aria-label={resource.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Star
                className={`h-4 w-4 ${
                  resource.bookmarked ? 'fill-amber-400 text-amber-400' : 'text-gray-400'
                }`}
              />
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Filter sidebar component
 */
const FilterSidebar: React.FC<{
  filters: ResourceFilters
  onFiltersChange: (filters: ResourceFilters) => void
  onClearFilters: () => void
}> = ({ filters, onFiltersChange, onClearFilters }) => {
  const resourceTypes: ResourceType[] = [
    'Documentation Forms',
    'Clinical Resources',
    'Patient Handouts',
    'Protocols',
    'Training Materials',
    'Medical Billing',
    'Additional Resources',
  ]

  const medicalConditions = [
    'Diabetes',
    'Hypertension',
    'Hyperlipidemia',
    'COPD/Asthma',
    'Heart Failure',
    'Mental Health',
    'Infectious Diseases',
  ]

  const programs = ['tmm', 'mtmtft', 'tnt', 'a1c', 'oc', 'general']

  /** Toggle program filter selection, keeping single value as scalar and multi as array */
  const handleProgramToggle = (program: string) => {
    const currentPrograms =
      filters.program === 'general'
        ? ['general']
        : Array.isArray(filters.program)
          ? filters.program
          : filters.program
            ? [filters.program]
            : []

    const newPrograms = currentPrograms.includes(program)
      ? currentPrograms.filter((p) => p !== program)
      : [...currentPrograms, program]

    onFiltersChange({
      ...filters,
      program: newPrograms.length === 1 ? newPrograms[0] : newPrograms,
    })
  }

  /** Toggle type filter selection, preserving scalar vs array */
  const handleTypeToggle = (type: ResourceType) => {
    const currentTypes = Array.isArray(filters.type) ? filters.type : filters.type ? [filters.type] : []

    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    onFiltersChange({
      ...filters,
      type: newTypes.length === 1 ? newTypes[0] : newTypes,
    })
  }

  /** Toggle condition tag selection */
  const handleConditionToggle = (condition: string) => {
    const currentConditions = filters.medicalCondition || []
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter((c) => c !== condition)
      : [...currentConditions, condition]

    onFiltersChange({
      ...filters,
      medicalCondition: newConditions,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      </div>

      {/* Clinical Program Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Clinical Program</h4>
        <div className="space-y-2">
          {programs.map((program) => (
            <label key={program} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={
                  filters.program === program ||
                  (Array.isArray(filters.program) && filters.program.includes(program))
                }
                onCheckedChange={() => handleProgramToggle(program)}
              />
              <span className="text-sm capitalize">
                {program === 'general' ? 'General Resources' : program.toUpperCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Resource Type Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Resource Type</h4>
        <div className="space-y-2">
          {resourceTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.type === type || (Array.isArray(filters.type) && filters.type.includes(type))}
                onCheckedChange={() => handleTypeToggle(type)}
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medical Condition Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Medical Condition</h4>
        <div className="space-y-2">
          {medicalConditions.map((condition) => (
            <label key={condition} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.medicalCondition?.includes(condition)}
                onCheckedChange={() => handleConditionToggle(condition)}
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Page component
 */
const ResourcesPage: React.FC = () => {
  const location = useLocation()
  const [resources, setResources] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isGrid, setIsGrid] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<ResourceFilters>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Initialize filters from query string (for sidebar quick-filter links)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const qType = params.get('type') as ResourceType | null
    const qProgram = params.get('program') as any
    const q = params.get('q') || ''
    const next: ResourceFilters = { ...filters }
    let changed = false

    if (qType && qType !== filters.type) {
      next.type = qType
      changed = true
    }
    if (qProgram && qProgram !== filters.program) {
      next.program = qProgram
      changed = true
    }
    if (q && q !== (filters.search || '')) {
      next.search = q
      changed = true
    }

    if (changed) {
      setFilters(next)
      setSearchTerm(q)
      setPagination((prev) => ({ ...prev, page: 1 }))
      setShowFilters(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  /**
   * Debounced search handler using local debounce helper.
   * Memoized once to preserve stable cancel reference.
   */
  const debouncedSearch = useMemo(
    () =>
      createDebounce((term: string) => {
        setFilters((prev) => ({ ...prev, search: term, offset: 0 }))
        setPagination((prev) => ({ ...prev, page: 1 }))
      }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => debouncedSearch.cancel()
  }, [searchTerm, debouncedSearch])

  // Load resources
  useEffect(() => {
    const loadResources = async () => {
      setLoading(true)
      try {
        const response = await Api.getResources({
          ...filters,
          limit: pagination.limit,
          offset: (pagination.page - 1) * pagination.limit,
        })

        setResources(response)
        // In real implementation, you'd get pagination info from the API
        setPagination((prev) => ({
          ...prev,
          total: 189, // This would come from API
          totalPages: Math.ceil(189 / pagination.limit),
        }))
      } catch (error) {
        console.error('Error loading resources:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.limit])

  /** Toggle bookmark state for a resource */
  const handleBookmark = async (resourceId: string, value: boolean) => {
    try {
      await Api.toggleBookmark(resourceId, value)
      setResources((prev) =>
        prev.map((resource) => (resource.id === resourceId ? { ...resource, bookmarked: value } : resource))
      )
    } catch (error) {
      console.error('Error updating bookmark:', error)
    }
  }

  /** Apply new filter set and reset to page 1 */
  const handleFiltersChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  /** Clear all filters and reset search/pagination */
  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  /** Determine if any filter is currently active to show the active filters bar */
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof ResourceFilters]
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  })

  return (
    <AppShell
      header={
        <div className="mx-auto max-w-[1280px] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold">Complete Resource Library</div>
              <div className="text-sm text-slate-600">Browse all 189 clinical and general pharmacy resources</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsGrid(!isGrid)} className="bg-transparent">
                {isGrid ? <ListIcon className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-transparent"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="pl-9"
                placeholder="Search by keyword, file name, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </div>

          {/* Quick Filter Cards */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <QuickFilterCard
              icon={<FileText className="h-5 w-5 text-slate-600" />}
              label="Patient Handouts"
              onClick={() => handleFiltersChange({ ...filters, type: 'Patient Handouts' })}
              isActive={filters.type === 'Patient Handouts'}
            />
            <QuickFilterCard
              icon={<List className="h-5 w-5 text-slate-600" />}
              label="Clinical Resources"
              onClick={() => handleFiltersChange({ ...filters, type: 'Clinical Resources' })}
              isActive={filters.type === 'Clinical Resources'}
            />
            <QuickFilterCard
              icon={<FormInput className="h-5 w-5 text-slate-600" />}
              label="Documentation Forms"
              onClick={() => handleFiltersChange({ ...filters, type: 'Documentation Forms' })}
              isActive={filters.type === 'Documentation Forms'}
            />
            <QuickFilterCard
              icon={<Crosshair className="h-5 w-5 text-slate-600" />}
              label="Protocols"
              onClick={() => handleFiltersChange({ ...filters, type: 'Protocols' })}
              isActive={filters.type === 'Protocols'}
            />
            <QuickFilterCard
              icon={<Video className="h-5 w-5 text-slate-600" />}
              label="Training"
              onClick={() => handleFiltersChange({ ...filters, type: 'Training Materials' })}
              isActive={filters.type === 'Training Materials'}
            />
            <QuickFilterCard
              icon={<FileText className="h-5 w-5 text-slate-600" />}
              label="Medical Billing"
              onClick={() => handleFiltersChange({ ...filters, type: 'Medical Billing' })}
              isActive={filters.type === 'Medical Billing'}
            />
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.program && (
                <Badge variant="secondary" className="text-xs">
                  Program: {Array.isArray(filters.program) ? filters.program.join(', ') : filters.program}
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="text-xs">
                  Type: {Array.isArray(filters.type) ? filters.type.join(', ') : filters.type}
                </Badge>
              )}
              {filters.medicalCondition && filters.medicalCondition.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Conditions: {filters.medicalCondition.join(', ')}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Results Info */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} resources
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                className="text-sm border rounded px-2 py-1"
                value={`${filters.sortBy || 'name'}-${filters.sortOrder || 'asc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleFiltersChange({ ...filters, sortBy, sortOrder })
                }}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="lastUpdated-desc">Recently Updated</option>
                <option value="downloadCount-desc">Most Downloaded</option>
              </select>
            </div>
          </div>

          {/* Resource Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 ${
                  isGrid ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'
                }`}
              >
                {resources.map((resource) => (
                  <ResourceItemCard
                    key={resource.id}
                    resource={resource}
                    isGrid={isGrid}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="bg-transparent"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let page
                      if (pagination.totalPages <= 5) {
                        page = i + 1
                      } else if (pagination.page <= 3) {
                        page = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i
                      } else {
                        page = pagination.page - 2 + i
                      }

                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPagination((prev) => ({ ...prev, page }))}
                          className="bg-transparent"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(pagination.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="bg-transparent"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default ResourcesPage
