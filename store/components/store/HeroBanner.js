import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { imageUrl } from '../../utils/api'
import { store } from '../../utils/store'

const gradientPairs = [
  ['#0d9488', '#0f766e'],
  ['#7c3aed', '#6d28d9'],
  ['#ea580c', '#c2410c'],
  ['#0284c7', '#0369a1'],
  ['#dc2626', '#b91c1c'],
  ['#0891b2', '#0e7490'],
]

export default function HeroBanner({ apps }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % apps.length)
  }, [apps.length])

  useEffect(() => {
    if (!apps?.length) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [apps?.length, next])

  if (!apps?.length) return null

  const app = apps[current]
  const gradient = gradientPairs[current % gradientPairs.length]
  const iconSrc = imageUrl(app.icon_url)
  const isInstalled = store.isInstalled(app.id)

  const formatDownloads = (n) => {
    if (!n) return '0'
    if (n < 1000) return `${n}`
    if (n < 1000000) return `${(n / 1000).toFixed(1)}K`
    return `${(n / 1000000).toFixed(1)}M`
  }

  return (
    <div className="px-4 mt-4 sm:mt-6">
      <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: '200px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={app.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-[200px] sm:h-[260px] p-5 sm:p-7 flex flex-col justify-between"
            style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">
                  Featured
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/15 text-white/90 text-[10px] font-medium">
                  {app.category_name}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/15 overflow-hidden shadow-lg ring-2 ring-white/20 shrink-0">
                {iconSrc ? (
                  <img src={iconSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 line-clamp-1">{app.name}</h2>
              <p className="text-sm text-white/80 line-clamp-1 mb-3">{app.short_description || 'Premium Android app'}</p>
              <div className="flex items-center gap-3 text-[11px] text-white/70">
                <span>{formatDownloads(app.total_downloads)} downloads</span>
                {app.version_name && <span>v{app.version_name}</span>}
              </div>
              <div className="flex items-center gap-2.5 mt-3">
                <button
                  onClick={() => router.push(`/app/${app.id}`)}
                  className="px-6 py-2 rounded-full bg-white text-surface-900 font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 shadow-lg"
                >
                  {isInstalled ? 'Open' : 'Install'}
                </button>
                <button
                  onClick={() => router.push(`/app/${app.id}`)}
                  className="px-5 py-2 rounded-full bg-white/15 text-white font-medium text-sm hover:bg-white/25 transition-all active:scale-95"
                >
                  Details
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 opacity-10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {apps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-6 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
