import { useState, useMemo } from 'react'
import { ShieldWarning, X, MagnifyingGlass, CheckCircle, Warning, XCircle, ArrowSquareOut } from '@phosphor-icons/react'
import { loadIslandsContent } from '@/islands/content/loader'
import type { IslandDefinition, ContentProvenance } from '@/islands/types'

// ---------------------------------------------------------------------------
// Banned terms — competitor game names and trademarks we must never reference
// in shipped content. Keep this list alphabetised.
// ---------------------------------------------------------------------------
const BANNED_TERMS: string[] = [
  'Acquire',
  'AdVenture Capitalist',
  'Axie Infinity',
  'Binance',
  'Cashflow',
  'Cash Flow',
  'Coinbase',
  'Credit Karma',
  'CryptoKitties',
  'Dragons Den',
  'Game of Life',
  'Landlord',
  'Lemonade Stand',
  'Life (board game)',
  'Monopoly',
  'Payday',
  'Pay Day',
  'Property Tycoon',
  'Rich Dad',
  'Robinhood',
  'Shark Tank',
  'SimCity',
  'Stock Market Game',
  'Tycoon',
  'Wall Street Survivor',
]

// ---------------------------------------------------------------------------
// Types for lint findings
// ---------------------------------------------------------------------------
type Severity = 'error' | 'warning' | 'info'

interface LintFinding {
  severity: Severity
  islandId: string
  islandName: string
  jsonPath: string
  message: string
  matchedText?: string
}

// ---------------------------------------------------------------------------
// Fuzzy / Levenshtein helpers
// ---------------------------------------------------------------------------
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[m][n]
}

/** Returns true when `word` is a suspicious near-match for any banned term. */
function isFuzzyMatch(word: string, bannedLower: string[]): string | null {
  const w = word.toLowerCase()
  if (w.length < 4) return null // skip short words
  for (const term of bannedLower) {
    // Exact substring
    if (w.includes(term) || term.includes(w)) return term
    // Levenshtein within threshold (scale threshold with term length)
    const threshold = term.length <= 6 ? 1 : 2
    if (Math.abs(w.length - term.length) <= threshold && levenshtein(w, term) <= threshold) {
      return term
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Core scanning logic
// ---------------------------------------------------------------------------
function scanIslands(islands: IslandDefinition[]): LintFinding[] {
  const findings: LintFinding[] = []
  const bannedLower = BANNED_TERMS.map((t) => t.toLowerCase())

  for (const island of islands) {
    const ctx = { islandId: island.id, islandName: island.name }

    // ---- 1. Missing provenance fields ----
    if (!island.provenance) {
      findings.push({
        severity: 'error',
        ...ctx,
        jsonPath: `islands[${island.id}].provenance`,
        message: 'Missing provenance object entirely.',
      })
    } else {
      const p: ContentProvenance = island.provenance
      if (!p.learning_objectives || p.learning_objectives.length === 0) {
        findings.push({
          severity: 'error',
          ...ctx,
          jsonPath: `islands[${island.id}].provenance.learning_objectives`,
          message: 'learning_objectives is empty or missing.',
        })
      }
      if (!p.mechanics_used || p.mechanics_used.length === 0) {
        findings.push({
          severity: 'warning',
          ...ctx,
          jsonPath: `islands[${island.id}].provenance.mechanics_used`,
          message: 'mechanics_used is empty or missing.',
        })
      }
      if (!p.originality_notes || p.originality_notes.trim().length === 0) {
        findings.push({
          severity: 'error',
          ...ctx,
          jsonPath: `islands[${island.id}].provenance.originality_notes`,
          message: 'originality_notes is empty or missing.',
        })
      }
      if (!p.forbidden_references || p.forbidden_references.length === 0) {
        findings.push({
          severity: 'warning',
          ...ctx,
          jsonPath: `islands[${island.id}].provenance.forbidden_references`,
          message: 'forbidden_references is empty — consider listing known competitor names.',
        })
      }
    }

    // ---- 2. Scan all text fields for banned terms ----
    const textFields = collectTextFields(island)
    for (const { path, value } of textFields) {
      const lower = value.toLowerCase()

      // Exact banned term match
      for (const term of bannedLower) {
        if (lower.includes(term)) {
          findings.push({
            severity: 'error',
            ...ctx,
            jsonPath: `islands[${island.id}].${path}`,
            message: `Banned term "${term}" found in content.`,
            matchedText: value,
          })
        }
      }

      // Fuzzy near-match scan (word-by-word)
      const words = value.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
      for (const word of words) {
        // Skip if already caught by exact match
        if (bannedLower.some((b) => value.toLowerCase().includes(b))) continue
        const match = isFuzzyMatch(word, bannedLower)
        if (match) {
          findings.push({
            severity: 'warning',
            ...ctx,
            jsonPath: `islands[${island.id}].${path}`,
            message: `Suspicious near-match: "${word}" is close to banned term "${match}".`,
            matchedText: value,
          })
        }
      }
    }
  }

  return findings
}

/** Recursively collect all string values from an island, tracking their JSON path. */
function collectTextFields(
  obj: unknown,
  prefix = '',
  results: { path: string; value: string }[] = [],
): { path: string; value: string }[] {
  if (typeof obj === 'string') {
    results.push({ path: prefix, value: obj })
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => collectTextFields(item, `${prefix}[${i}]`, results))
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      // Skip scanning provenance.forbidden_references — those ARE supposed to have banned terms
      if (key === 'forbidden_references') continue
      // Skip scanning provenance.originality_notes — internal documentation
      if (key === 'originality_notes') continue
      collectTextFields(val, prefix ? `${prefix}.${key}` : key, results)
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------
const severityConfig: Record<Severity, { bg: string; border: string; icon: typeof XCircle; label: string }> = {
  error: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Error' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: Warning, label: 'Warning' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle, label: 'Info' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function IPLintScreen({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<Severity | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { islands, findings } = useMemo(() => {
    const content = loadIslandsContent()
    return { islands: content.islands, findings: scanIslands(content.islands) }
  }, [])

  const filteredFindings = useMemo(() => {
    let results = findings
    if (filter !== 'all') results = results.filter((f) => f.severity === filter)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      results = results.filter(
        (f) =>
          f.message.toLowerCase().includes(q) ||
          f.jsonPath.toLowerCase().includes(q) ||
          f.islandName.toLowerCase().includes(q) ||
          (f.matchedText && f.matchedText.toLowerCase().includes(q)),
      )
    }
    return results
  }, [findings, filter, searchTerm])

  const counts = useMemo(() => {
    const c = { error: 0, warning: 0, info: 0 }
    for (const f of findings) c[f.severity]++
    return c
  }, [findings])

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-950/80 backdrop-blur-sm flex items-start justify-center overflow-auto p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShieldWarning size={28} className="text-purple-600" weight="duotone" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">IP Lint Scanner</h1>
              <p className="text-sm text-gray-500">
                Scanned {islands.length} island{islands.length !== 1 ? 's' : ''} &middot;{' '}
                {findings.length} issue{findings.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close IP Lint"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary badges */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({findings.length})
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'error' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
            onClick={() => setFilter('error')}
          >
            <XCircle size={14} /> Errors ({counts.error})
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              filter === 'warning' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
            onClick={() => setFilter('warning')}
          >
            <Warning size={14} /> Warnings ({counts.warning})
          </span>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 w-52"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-auto divide-y divide-gray-100">
          {filteredFindings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-3" weight="duotone" />
              <p className="text-lg font-semibold text-gray-800">
                {findings.length === 0 ? 'All clear!' : 'No matching issues'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {findings.length === 0
                  ? 'No IP issues detected in any island content.'
                  : 'Try adjusting your filter or search term.'}
              </p>
            </div>
          ) : (
            filteredFindings.map((finding, idx) => {
              const cfg = severityConfig[finding.severity]
              const Icon = cfg.icon
              return (
                <div key={idx} className={`px-6 py-4 ${cfg.bg} hover:brightness-[0.98] transition-all`}>
                  <div className="flex items-start gap-3">
                    <Icon
                      size={20}
                      weight="fill"
                      className={
                        finding.severity === 'error'
                          ? 'text-red-500 mt-0.5 flex-shrink-0'
                          : finding.severity === 'warning'
                            ? 'text-amber-500 mt-0.5 flex-shrink-0'
                            : 'text-blue-500 mt-0.5 flex-shrink-0'
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            finding.severity === 'error'
                              ? 'bg-red-200 text-red-800'
                              : finding.severity === 'warning'
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{finding.islandName}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{finding.message}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                        <ArrowSquareOut size={12} />
                        <span className="break-all">{finding.jsonPath}</span>
                      </div>
                      {finding.matchedText && (
                        <p className="mt-1.5 text-xs text-gray-400 truncate max-w-full">
                          &ldquo;{finding.matchedText}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
          <span>Banned terms list: {BANNED_TERMS.length} entries</span>
          <span>
            See <code className="bg-gray-100 px-1 rounded">docs/ip-safe-design.md</code> for the full workflow
          </span>
        </div>
      </div>
    </div>
  )
}
