import { useState, useEffect } from 'react'
import Head from 'next/head'
import { api, imageUrl } from '../utils/api'
import { store } from '../utils/store'
import AppCard from '../components/store/AppCard'
import EmptyState from '../components/store/EmptyState'

export default function ProfilePage() {
  const [favoriteApps, setFavoriteApps] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [allApps, setAllApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('favorites')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.apps.list({ limit: 100, published: true })
        const appsList = data.apps || []
        setAllApps(appsList)

        const favIds = store.getFavorites()
        setFavoriteApps(appsList.filter(a => favIds.includes(a.id)))

        const recent = store.getRecentlyViewed()
        setRecentApps(recent.map(r => appsList.find(a => a.id === r.id)).filter(Boolean))
      } catch (err) {
        console.error('Profile load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <Head><title>My Profile - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">My Profile</h1>
            <p className="text-sm text-surface-400">{favoriteApps.length} favorites • {recentApps.length} recent</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('favorites')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'favorites'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setTab('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'recent'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
            }`}
          >
            Recently Viewed
          </button>
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
        ) : tab === 'favorites' ? (
          favoriteApps.length === 0 ? (
            <EmptyState
              title="No favorites yet"
              description="Tap the heart icon on apps to add them here."
            />
          ) : (
            <div className="space-y-3">
              {favoriteApps.map((app) => (
                <AppCard key={app.id} app={app} variant="horizontal" />
              ))}
            </div>
          )
        ) : (
          recentApps.length === 0 ? (
            <EmptyState
              title="No recently viewed"
              description="Apps you view will appear here."
            />
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <AppCard key={app.id} app={app} variant="horizontal" />
              ))}
            </div>
          )
        )}
      </div>
    </>
  )
}
