import { useState, useEffect } from 'react'
import Head from 'next/head'
import { api, imageUrl } from '../utils/api'
import HeroBanner from '../components/store/HeroBanner'
import Section from '../components/store/Section'
import AppCard from '../components/store/AppCard'
import SearchBar from '../components/store/SearchBar'

const categoryIcons = {
  'Development': '⚙️',
  'Security': '🔒',
  'Productivity': '📋',
  'AI Tools': '🤖',
  'Utilities': '🔧',
  'Business': '💼',
  'Social': '💬',
  'Personal': '👤',
  'Education': '📚',
  'Entertainment': '🎬',
  'Games': '🎮',
  'Tools': '🔧',
  'Music': '🎵',
  'Video': '🎥',
  'Health': '❤️',
  'Finance': '💰',
  'Travel': '✈️',
  'News': '📰',
  'Shopping': '🛒',
  'Communication': '📞',
}

export default function StoreHome() {
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [appsData, catsData] = await Promise.all([
          api.apps.list({ limit: 50, published: true }),
          api.categories.list(),
        ])
        setApps(appsData.apps || [])
        setCategories(catsData.categories || catsData || [])
        setFeatured((appsData.apps || []).slice(0, 5))
      } catch (err) {
        console.error('Failed to load store:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const recommended = apps.filter(a => a.is_featured).length > 0
    ? apps.filter(a => a.is_featured)
    : apps.slice(0, 8)
  const trending = [...apps].sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
  const newReleases = [...apps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const mostDownloaded = [...apps].sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
  const recentlyUpdated = [...apps].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="px-4 mt-4">
          <div className="h-[200px] sm:h-[260px] rounded-3xl bg-surface-200 dark:bg-surface-800" />
        </div>
        <div className="px-4 mt-6">
          <div className="h-11 rounded-2xl bg-surface-200 dark:bg-surface-800" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-8 px-4">
            <div className="h-5 w-32 bg-surface-200 dark:bg-surface-800 rounded-lg mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="w-[140px] sm:w-[156px] shrink-0">
                  <div className="aspect-square rounded-2xl bg-surface-200 dark:bg-surface-800" />
                  <div className="mt-2.5 space-y-2">
                    <div className="h-3 w-3/4 bg-surface-200 dark:bg-surface-800 rounded" />
                    <div className="h-2.5 w-1/2 bg-surface-200 dark:bg-surface-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>MarketHub - Discover Premium Apps</title>
      </Head>

      <HeroBanner apps={featured} />

      <div className="px-4 mt-4 sm:mt-5">
        <SearchBar />
      </div>

      {categories.length > 0 && (
        <section className="mt-5 px-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button className="shrink-0 px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-semibold">
              All
            </button>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: cat.color + '18',
                  color: cat.color,
                }}
              >
                {categoryIcons[cat.name] || '📦'} {cat.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <Section title="Recommended" subtitle="Handpicked for you" href="/trending">
        {recommended.map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      <Section title="Trending" subtitle="Most popular right now" href="/trending">
        {trending.slice(0, 10).map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      <Section title="New Releases" subtitle="Latest updates and additions" href="/latest">
        {newReleases.slice(0, 10).map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      {categories.map((cat) => {
        const catApps = apps.filter(a => a.category_slug === cat.slug).slice(0, 6)
        if (!catApps.length) return null
        return (
          <Section key={cat.id} title={cat.name} href={`/category/${cat.slug}`}>
            {catApps.map((app) => (
              <AppCard key={app.id} app={app} variant="vertical" />
            ))}
          </Section>
        )
      })}

      <Section title="Editor's Choice" subtitle="Apps we love" href="/trending">
        {trending.slice(0, 8).map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      <Section title="Most Downloaded" subtitle="Popular downloads" href="/top-downloads">
        {mostDownloaded.slice(0, 10).map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      <Section title="Recently Updated" subtitle="Fresh updates" href="/latest">
        {recentlyUpdated.slice(0, 10).map((app) => (
          <AppCard key={app.id} app={app} variant="vertical" />
        ))}
      </Section>

      {categories.length > 0 && (
        <section className="mt-8 px-4 pb-4">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-3">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-surface-900 shadow-soft card-hover"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: cat.color + '20' }}
                >
                  {categoryIcons[cat.name] || '📦'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">{cat.name}</p>
                  <p className="text-[11px] text-surface-400">
                    {apps.filter(a => a.category_slug === cat.slug).length} apps
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-8 px-4 pb-4 text-center">
        <div className="py-6 border-t border-surface-200 dark:border-surface-800">
          <p className="text-xs text-surface-400 dark:text-surface-500">
            MarketHub &mdash; Premium Android App Store
          </p>
        </div>
      </footer>
    </>
  )
}
