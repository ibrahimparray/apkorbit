import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { store } from '../../utils/store'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [siteName, setSiteName] = useState('MarketHub')

  useEffect(() => {
    setTheme(store.getTheme())
    const stored = localStorage.getItem('store_site_name')
    if (stored) setSiteName(stored)

    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const t = store.toggleTheme()
    setTheme(t)
  }

  return (
    <div className="min-h-screen bg-[#333333] transition-colors duration-300">
      <header
        className={`fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300 ${
          scrolled
            ? 'glass shadow-soft'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-surface-900 dark:text-surface-50">
              {siteName}
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 rounded-2xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all active:scale-95"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-14 sm:pt-16 pb-20 min-h-screen">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
