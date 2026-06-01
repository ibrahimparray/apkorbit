import { useState, useEffect } from 'react'
import Head from 'next/head'
import { api } from '../utils/api'
import AppCard from '../components/store/AppCard'
import EmptyState from '../components/store/EmptyState'

export default function TrendingPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('downloads')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.apps.list({ limit: 50, published: true, sort })
        const sorted = (data.apps || []).sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
        setApps(sorted)
      } catch (err) {
        console.error('Trending load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sort])

  return (
    <>
      <Head><title>Trending Apps - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Trending</h1>
            <p className="text-sm text-surface-400 dark:text-surface-500">Most popular apps right now</p>
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
          <EmptyState title="No trending apps" description="Check back later for popular apps." />
        ) : (
          <div className="space-y-2">
            {apps.map((app, i) => (
              <div key={app.id} className="flex items-start sm:items-center gap-2 sm:gap-2">
                <span className={`w-6 sm:w-6 text-center text-sm font-bold shrink-0 mt-5 sm:mt-0 ${
                  i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-surface-400 dark:text-surface-500'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <AppCard app={app} variant="horizontal" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
