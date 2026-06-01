import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { api, imageUrl } from '../utils/api'
import { store } from '../utils/store'
import EmptyState from '../components/store/EmptyState'

export default function DownloadsPage() {
  const [tab, setTab] = useState('installed')
  const [installedApps, setInstalledApps] = useState([])
  const [history, setHistory] = useState([])
  const [allApps, setAllApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [uninstallTarget, setUninstallTarget] = useState(null)
  const [updateInfo, setUpdateInfo] = useState({})

  useEffect(() => {
    async function load() {
      try {
        const data = await api.apps.list({ limit: 100, published: true })
        const appsList = data.apps || []
        setAllApps(appsList)
        setInstalledApps(store.getInstalledApps())
        setHistory(store.getDownloadHistory())

        const updates = {}
        for (const installed of store.getInstalledApps()) {
          const match = appsList.find(a => a.package_name === installed.package_name)
          if (match && match.latest_version_id) {
            try {
              const versionData = await api.apps.latestVersion(match.id)
              if (versionData?.version?.version_code > installed.version_code) {
                updates[installed.id] = versionData.version
              }
            } catch {}
          }
        }
        setUpdateInfo(updates)
      } catch (err) {
        console.error('Downloads load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUninstall = (appId) => {
    store.removeInstalled(appId)
    setInstalledApps(store.getInstalledApps())
    setUninstallTarget(null)
  }

  const handleDownload = (app) => {
    window.location.href = `/app/${app.id}`
  }

  const hasUpdates = Object.keys(updateInfo).length > 0

  const installedWithDetails = installedApps.map(inst => {
    const appDetail = allApps.find(a => a.id === inst.id)
    return { ...inst, details: appDetail }
  })

  return (
    <>
      <Head><title>My Library - MarketHub</title></Head>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-1">My Library</h1>
        <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">
          {installedApps.length} installed • {hasUpdates ? `${Object.keys(updateInfo).length} updates` : 'up to date'}
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('installed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'installed'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
            }`}
          >
            Installed {installedApps.length > 0 && `(${installedApps.length})`}
          </button>
          <button
            onClick={() => setTab('updates')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
              tab === 'updates'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
            }`}
          >
            Updates {hasUpdates && (
              <span className="ml-1 w-5 h-5 bg-accent-500 text-white text-[10px] rounded-full inline-flex items-center justify-center">
                {Object.keys(updateInfo).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'history'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
            }`}
          >
            History
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
        ) : tab === 'installed' ? (
          installedApps.length === 0 ? (
            <EmptyState
              title="No installed apps"
              description="Apps you install will appear here."
              icon={
                <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {installedWithDetails.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl shadow-soft"
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0 shadow-sm">
                    {inst.icon_url ? (
                      <img src={imageUrl(inst.icon_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50 truncate">{inst.name}</h3>
                    <p className="text-xs text-surface-400">v{inst.version_name}</p>
                    {updateInfo[inst.id] && (
                      <p className="text-[11px] text-accent-500 font-medium mt-0.5">Update available: v{updateInfo[inst.id].version_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownload(inst)}
                      className="px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all active:scale-95"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setUninstallTarget(inst.id)}
                      className="p-1.5 rounded-full text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'updates' ? (
          !hasUpdates ? (
            <EmptyState
              title="All apps up to date"
              description="Your installed apps are all on the latest version."
              icon={
                <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {installedWithDetails.filter(inst => updateInfo[inst.id]).map((inst) => (
                <div key={inst.id} className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl shadow-soft border border-accent-200 dark:border-accent-500/20">
                  <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0 shadow-sm">
                    {inst.icon_url ? (
                      <img src={imageUrl(inst.icon_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50 truncate">{inst.name}</h3>
                    <p className="text-xs text-surface-400">v{inst.version_name} → v{updateInfo[inst.id]?.version_name}</p>
                    <p className="text-[11px] text-accent-500 font-medium mt-0.5">Update available</p>
                  </div>
                  <button
                    onClick={() => handleDownload(inst)}
                    className="px-4 py-1.5 rounded-full bg-accent-500 text-white text-xs font-semibold hover:bg-accent-600 transition-all active:scale-95"
                  >
                    Update
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          history.length === 0 ? (
            <EmptyState
              title="No download history"
              description="Your download history will appear here."
            />
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl shadow-soft">
                  <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0 shadow-sm">
                    {item.icon_url ? (
                      <img src={imageUrl(item.icon_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50 truncate">{item.name}</h3>
                    <p className="text-xs text-surface-400">v{item.version_name}</p>
                    <p className="text-[11px] text-surface-400 mt-0.5">
                      {item.downloaded_at ? new Date(item.downloaded_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {uninstallTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
            onClick={() => setUninstallTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 text-center mb-2">Uninstall App?</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center mb-6">
                This will remove the app from your library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUninstallTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-semibold text-sm hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUninstall(uninstallTarget)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-all"
                >
                  Uninstall
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
