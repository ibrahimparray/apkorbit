import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { api, imageUrl } from '../../utils/api'
import { store } from '../../utils/store'
import ScreenshotCarousel from '../../components/store/ScreenshotCarousel'
import AppCard from '../../components/store/AppCard'
import Section from '../../components/store/Section'
import RatingStars from '../../components/store/RatingStars'

export default function AppDetail() {
  const router = useRouter()
  const { id } = router.query

  const [app, setApp] = useState(null)
  const [versions, setVersions] = useState([])
  const [relatedApps, setRelatedApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showAllVersions, setShowAllVersions] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsFav(store.isFavorite(Number(id)))
    setIsInstalled(store.isInstalled(Number(id)))
    async function load() {
      try {
        const data = await api.apps.detail(id)
        setApp(data.app)
        setVersions(data.versions || [])
        store.addRecentlyViewed(data.app)

        const related = await api.apps.list({ category: data.app.category_slug, limit: 6, published: true })
        setRelatedApps((related.apps || []).filter(a => a.id !== data.app.id))

        const stored = localStorage.getItem('store_site_name')
        if (!stored) {
          try {
            const settings = await api.settings.all()
            if (settings?.site_name) {
              localStorage.setItem('store_site_name', settings.site_name)
            }
          } catch {}
        }
      } catch (err) {
        setError(err.message || 'Failed to load app')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const currentVersion = versions.find(v => v.id === app?.latest_version_id) || versions[0]

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDownloads = (n) => {
    if (!n) return '0'
    if (n < 1000) return `${n}`
    if (n < 1000000) return `${(n / 1000).toFixed(1)}K`
    return `${(n / 1000000).toFixed(1)}M`
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleDownload = useCallback(async () => {
    if (!app || !currentVersion) return
    setDownloading(true)
    setDownloadProgress(0)

    try {
      const downloadUrl = api.apps.downloadUrl(app.id, currentVersion.id)

      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Download failed')

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength) : 0
      const reader = response.body.getReader()
      const chunks = []

      let received = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (total) {
          setDownloadProgress(Math.round((received / total) * 100))
        } else {
          setDownloadProgress(Math.min(Math.round((received / (1024 * 1024)) * 10), 95))
        }
      }

      const blob = new Blob(chunks)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${app.name}-${currentVersion.version_name}.apk`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      store.addDownload(app, currentVersion)
      store.addInstalled(app, currentVersion)
      setIsInstalled(true)
      setDownloadProgress(100)
      setTimeout(() => {
        setDownloading(false)
        setDownloadProgress(0)
      }, 1000)
    } catch (err) {
      console.error('Download error:', err)
      setDownloading(false)
      setDownloadProgress(0)
    }
  }, [app, currentVersion])

  const toggleFav = () => {
    if (isFav) {
      store.removeFavorite(app.id)
      setIsFav(false)
    } else {
      store.addFavorite(app.id)
      setIsFav(true)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse px-4 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-surface-200 dark:bg-surface-800" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 bg-surface-200 dark:bg-surface-800 rounded" />
            <div className="h-4 w-24 bg-surface-200 dark:bg-surface-800 rounded" />
            <div className="h-3 w-32 bg-surface-200 dark:bg-surface-800 rounded" />
          </div>
        </div>
        <div className="mt-6 h-[320px] rounded-2xl bg-surface-200 dark:bg-surface-800" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded" />
          <div className="h-4 w-3/4 bg-surface-200 dark:bg-surface-800 rounded" />
          <div className="h-4 w-1/2 bg-surface-200 dark:bg-surface-800 rounded" />
        </div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-1">App not found</h3>
        <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">{error || 'This app could not be found.'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 rounded-full bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-all"
        >
          Go back
        </button>
      </div>
    )
  }

  const screenshots = app.screenshots
    ? (typeof app.screenshots === 'string' ? JSON.parse(app.screenshots) : app.screenshots)
    : []

  return (
    <>
      <Head>
        <title>{app.name} - MarketHub</title>
      </Head>

      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shadow-soft shrink-0">
            {app.icon_url ? (
              <img src={imageUrl(app.icon_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-50">{app.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full">
                {app.category_name}
              </span>
              {currentVersion && (
                <span className="text-xs text-surface-400">v{currentVersion.version_name}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <RatingStars rating={4.5} size="sm" />
              <span className="text-xs text-surface-400">{formatDownloads(app.total_downloads)} downloads</span>
            </div>
          </div>
          <button
            onClick={toggleFav}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isFav
                ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-2.5">Screenshots</h3>
            <ScreenshotCarousel screenshots={screenshots} />
          </div>
        )}
      </div>

      <div className="px-4 mt-6">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-2">About</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            {app.description || app.short_description || 'No description available.'}
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3">Details</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <DetailItem label="Version" value={currentVersion?.version_name || '—'} />
            <DetailItem label="Size" value={formatSize(currentVersion?.file_size)} />
            <DetailItem label="Updated" value={formatDate(app.updated_at)} />
            <DetailItem label="Downloads" value={formatDownloads(app.total_downloads)} />
            <DetailItem label="Package" value={app.package_name} />
            <DetailItem label="Category" value={app.category_name} />
          </div>
        </div>
      </div>

      {currentVersion?.changelog && (
        <div className="px-4 mt-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-soft">
            <button
              onClick={() => setShowChangelog(!showChangelog)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                What&apos;s New
              </h3>
              <svg
                className={`w-4 h-4 text-surface-400 transition-transform ${showChangelog ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showChangelog && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 overflow-hidden"
              >
                <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap leading-relaxed">
                  {currentVersion.changelog}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {versions.length > 1 && (
        <div className="px-4 mt-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-soft">
            <button
              onClick={() => setShowAllVersions(!showAllVersions)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                Version History ({versions.length})
              </h3>
              <svg
                className={`w-4 h-4 text-surface-400 transition-transform ${showAllVersions ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showAllVersions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-surface-900 dark:text-surface-50">v{v.version_name}</span>
                      <span className="text-xs text-surface-400 ml-2">{formatDate(v.created_at)}</span>
                    </div>
                    <span className="text-xs text-surface-400">{v.downloads_count || 0} downloads</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {relatedApps.length > 0 && (
        <Section title="Related Apps" subtitle="You might also like">
          {relatedApps.slice(0, 6).map((related) => (
            <AppCard key={related.id} app={related} variant="vertical" />
          ))}
        </Section>
      )}

      <div className="h-24" />

      <div className="fixed bottom-16 sm:bottom-16 left-0 right-0 z-40 glass border-t border-surface-200/70 dark:border-surface-800/70 px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-surface-900 dark:text-surface-50 truncate">{app.name}</p>
            <p className="text-xs text-surface-400">
              {currentVersion ? `v${currentVersion.version_name} • ${formatSize(currentVersion.file_size)}` : 'No version available'}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || !currentVersion || isInstalled}
            className="relative px-8 py-2.5 rounded-full bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 overflow-hidden"
          >
            {downloading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {downloadProgress}%
              </span>
            ) : isInstalled ? (
              'Installed'
            ) : (
              'Install'
            )}
            {downloading && downloadProgress > 0 && downloadProgress < 100 && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-surface-900 dark:text-surface-50 mt-0.5 truncate">{value}</p>
    </div>
  )
}
