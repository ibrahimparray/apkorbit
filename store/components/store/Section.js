import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function Section({ title, subtitle, href, children }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section className="mt-7 sm:mt-8">
      <div className="flex items-end justify-between px-4 mb-3 sm:mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-surface-50">{title}</h2>
          {subtitle && (
            <p className="text-sm text-surface-400 dark:text-surface-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {href && (
          <a
            href={href}
            className="text-sm font-semibold text-primary-500 dark:text-primary-400 hover:text-primary-600 transition-colors shrink-0"
          >
            See all
          </a>
        )}
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-elevated flex items-center justify-center text-surface-600 dark:text-surface-300 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 ml-1"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-elevated flex items-center justify-center text-surface-600 dark:text-surface-300 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 mr-1"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 sm:gap-4 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth"
        >
          {children}
        </div>
      </div>
    </section>
  )
}
