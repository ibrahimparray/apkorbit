import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { api, imageUrl } from '../../utils/api'
import AppCard from '../../components/store/AppCard'
import EmptyState from '../../components/store/EmptyState'

export default function DeveloperPage() {
  const router = useRouter()
  const { id } = router.query
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      try {
        const data = await api.apps.list({ limit: 50, published: true })
        const developerApps = (data.apps || []).filter(a => a.user_id === Number(id))
        setApps(developerApps)
      } catch (err) {
        console.error('Developer load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const developerName = apps[0]?.name ? `${apps[0].name.split(' ')[0] || 'Developer'}` : `Developer #${id}`

  return (
    <>
      <Head><title>{developerName} - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {developerName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">{developerName}</h1>
              <p className="text-sm text-surface-400 dark:text-surface-500">{apps.length} app{apps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-surface-200 dark:bg-surface-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState title="No apps" description="This developer hasn't published any apps yet." />
        ) : (
          <div className="space-y-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} variant="horizontal" />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
