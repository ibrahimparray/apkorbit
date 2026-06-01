import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { api } from '../utils/api'
import AppCard from '../components/store/AppCard'
import SearchBar from '../components/store/SearchBar'
import EmptyState from '../components/store/EmptyState'

const trendingSearches = ['Games', 'Security', 'VPN', 'Social', 'Music', 'Player']
const categoryIcons = {
  'Development': '⚙️',
  'Security': '🔒',
  'Productivity': '📋',
  'AI Tools': '🤖',
  'Utilities': '🔧',
  'Business': '💼',
  'Social': '💬',
  'Personal': '👤',
  'Education': '📚',
  'Entertainment': '🎬',
  'Games': '🎮',
  'Tools': '🔧',
  'Music': '🎵',
  'Video': '🎥',
  'Health': '❤️',
  'Finance': '💰',
  'Travel': '✈️',
  'News': '📰',
  'Shopping': '🛒',
  'Communication': '📞',
}

export default function SearchPage() {
  const router = useRouter()
  const { q } = router.query

  const [query, setQuery] = useState(q || '')
  const [results, setResults] = useState([])
  const [categories, setCategories] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.categories.list()
      .then(data => setCategories(data.categories || data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [q])

  const performSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await api.apps.list({ search: searchTerm, limit: 50, published: true })
      setResults(data.apps || [])
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, undefined, { shallow: true })
      performSearch(query.trim())
    }
  }

  return (
    <>
      <Head>
        <title>{q ? `Search: ${q} - MarketHub` : 'Search Apps - MarketHub'}</title>
      </Head>

      <div className="px-4 pt-4">
        <SearchBar initialValue={query} autoFocus />
      </div>

      {!searched && !loading && (
        <div>
          <div className="px-4 mt-6">
            <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3">Trending Searches</h2>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term)
                    router.push(`/search?q=${encodeURIComponent(term)}`, undefined, { shallow: true })
                    performSearch(term)
                  }}
                  className="px-4 py-2 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="px-4 mt-6 pb-4">
              <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3">Browse Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-surface-900 shadow-soft card-hover"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      {categoryIcons[cat.name] || '📦'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">{cat.name}</p>
                      <p className="text-[11px] text-surface-400">View apps</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="px-4 mt-6 pb-4">
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 text-primary-500 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      )}

      {searched && !loading && (
        <div className="px-4 mt-4 pb-4">
          {results.length > 0 ? (
            <div>
              <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"
              </p>
              <div className="space-y-3">
                {results.map((app) => (
                  <AppCard key={app.id} app={app} variant="horizontal" />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No results found"
              description={`No apps matching "${q}" were found. Try a different search term.`}
            />
          )}
        </div>
      )}
    </>
  )
}
