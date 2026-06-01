import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { imageUrl } from '../../utils/api'
import { store } from '../../utils/store'

export default function AppCard({ app, variant = 'vertical' }) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const isInstalled = store.isInstalled(app.id)
  const isFav = store.isFavorite(app.id)

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

  const toggleFav = (e) => {
    e.stopPropagation()
    if (isFav) store.removeFavorite(app.id)
    else store.addFavorite(app.id)
  }

  const iconSrc = imageUrl(app.icon_url)

  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => router.push(`/app/${app.id}`)}
        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-white dark:bg-surface-900 rounded-2xl shadow-soft card-hover cursor-pointer active:scale-[0.98]"
      >
        <div className="flex items-start gap-3 sm:gap-3 sm:items-center sm:flex-1 sm:min-w-0">
          <div className="w-[64px] h-[64px] sm:w-14 sm:h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0 shadow-sm">
            {iconSrc && !imgError ? (
              <img src={iconSrc} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 sm:block">
            <h3 className="font-semibold text-sm sm:text-sm text-surface-900 dark:text-surface-50 line-clamp-1">{app.name}</h3>
            <p className="text-xs text-surface-400 dark:text-surface-500 line-clamp-2 sm:truncate sm:line-clamp-1 mt-1">{app.short_description || app.category_name}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-surface-400 dark:text-surface-500">
                {formatDownloads(app.total_downloads)} downloads
              </span>
              <span className="text-[11px] text-surface-300 dark:text-surface-600">•</span>
              <span className="text-[11px] font-medium text-surface-400 dark:text-surface-500">
                {app.version_name || '—'}
              </span>
              <span className="text-[11px] text-surface-300 dark:text-surface-600">•</span>
              <span className="text-[11px] font-medium text-surface-400 dark:text-surface-500">
                {app.category_name || formatSize(app.file_size)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end sm:flex-col sm:items-center sm:gap-1 sm:shrink-0 mt-1 sm:mt-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/app/${app.id}`)
            }}
            className="min-h-[44px] px-6 sm:px-4 sm:py-1.5 rounded-full bg-primary-500 text-white text-sm sm:text-xs font-semibold hover:bg-primary-600 transition-all active:scale-95"
          >
            {isInstalled ? 'Open' : 'Get'}
          </button>
          <span className="hidden sm:block text-[9px] text-surface-400">{formatDownloads(app.total_downloads)}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      onClick={() => router.push(`/app/${app.id}`)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-[140px] sm:w-[156px] shrink-0 cursor-pointer group"
    >
      <div className="relative aspect-square rounded-2xl bg-surface-100 dark:bg-surface-800 overflow-hidden shadow-soft">
        {iconSrc && !imgError ? (
          <img src={iconSrc} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
        )}
        <button
          onClick={toggleFav}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFav
              ? 'bg-white/90 text-red-500 shadow-sm'
              : 'bg-black/20 text-white/80 opacity-0 group-hover:opacity-100'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50 line-clamp-1">{app.name}</h3>
        <p className="text-[11px] text-surface-400 dark:text-surface-500 line-clamp-1 mt-0.5">{app.short_description || app.category_name}</p>
        <div className="flex items-center justify-between mt-1.5">
          {isInstalled ? (
            <span className="text-[10px] font-medium text-primary-500 dark:text-primary-400 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Installed
            </span>
          ) : (
            <span className="text-[10px] font-medium text-primary-500 dark:text-primary-400">{formatDownloads(app.total_downloads)}</span>
          )}
          <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500">{formatSize(app.file_size)}</span>
        </div>
      </div>
    </motion.div>
  )
}
