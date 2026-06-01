import { useState, useEffect } from 'react'
import Head from 'next/head'
import { api } from '../utils/api'
import AppCard from '../components/store/AppCard'
import EmptyState from '../components/store/EmptyState'

export default function TopDownloadsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.apps.list({ limit: 50, published: true, sort: 'downloads' })
        const sorted = (data.apps || []).sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
        setApps(sorted)
      } catch (err) {
        console.error('Top downloads load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatDownloads = (n) => {
    if (!n) return '0'
    if (n < 1000) return `${n}`
    if (n < 1000000) return `${(n / 1000).toFixed(1)}K`
    return `${(n / 1000000).toFixed(1)}M`
  }

  return (
    <>
      <Head><title>Top Downloads - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Top Downloads</h1>
            <p className="text-sm text-surface-400 dark:text-surface-500">Most downloaded apps</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-surface-200 dark:bg-surface-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
                </div>
                <div className="w-16 h-8 rounded-full bg-surface-200 dark:bg-surface-700" />
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState title="No downloads yet" description="Apps will appear here once they get downloads." />
        ) : (
          <div className="space-y-3">
            {apps.map((app, i) => (
              <div key={app.id} className="flex items-center gap-2">
                <div className="w-7 text-center shrink-0">
                  <span className={`text-sm font-bold ${
                    i < 3 ? 'text-primary-500' : 'text-surface-300 dark:text-surface-600'
                  }`}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <AppCard app={app} variant="horizontal" />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-primary-500">{formatDownloads(app.total_downloads)}</p>
                  <p className="text-[9px] text-surface-400">downloads</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
