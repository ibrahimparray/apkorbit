import { useState, useEffect } from 'react'
import Head from 'next/head'
import { api } from '../utils/api'
import AppCard from '../components/store/AppCard'
import EmptyState from '../components/store/EmptyState'

export default function LatestPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.apps.list({ limit: 50, published: true, sort: 'newest' })
        setApps(data.apps || [])
      } catch (err) {
        console.error('Latest load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    const now = new Date()
    const diff = now - date
    if (diff < 86400000) return 'Today'
    if (diff < 172800000) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const groupByDate = (apps) => {
    const groups = {}
    apps.forEach(app => {
      const key = formatDate(app.created_at)
      if (!groups[key]) groups[key] = []
      groups[key].push(app)
    })
    return groups
  }

  const grouped = groupByDate(apps)

  return (
    <>
      <Head><title>Latest Apps - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">New Releases</h1>
            <p className="text-sm text-surface-400 dark:text-surface-500">Latest apps and updates</p>
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
          <EmptyState title="No new releases" description="Check back later for new apps." />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, dateApps]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">{dateLabel}</h3>
                <div className="space-y-3">
                  {dateApps.map(app => (
                    <AppCard key={app.id} app={app} variant="horizontal" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
