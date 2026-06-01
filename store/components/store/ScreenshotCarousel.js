import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { imageUrl } from '../../utils/api'

export default function ScreenshotCarousel({ screenshots }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [current, setCurrent] = useState(0)

  const images = screenshots ? (typeof screenshots === 'string' ? JSON.parse(screenshots) : screenshots) : []

  if (!images.length) return null

  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setFullscreen(true) }}
            className="shrink-0 w-[180px] sm:w-[220px] h-[320px] sm:h-[380px] rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 shadow-soft hover:shadow-card transition-all"
          >
            <img
              src={imageUrl(src)}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 w-full max-w-2xl mx-auto px-4">
              {current > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent(c => c - 1) }}
                  className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              <img
                src={imageUrl(images[current])}
                alt={`Screenshot ${current + 1}`}
                className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-hero"
                onClick={(e) => e.stopPropagation()}
              />

              {current < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent(c => c + 1) }}
                  className="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === current ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            <div className="absolute top-4 left-4 text-white text-sm font-medium">
              {current + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
