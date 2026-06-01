import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { api } from '../../utils/api'
import AppCard from '../../components/store/AppCard'
import EmptyState from '../../components/store/EmptyState'

const sorts = [
  { value: 'newest', label: 'Newest' },
  { value: 'downloads', label: 'Popular' },
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Updated' },
]

export default function CategoryPage() {
  const router = useRouter()
  const { slug } = router.query

  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [selectedCat, setSelectedCat] = useState(slug)

  useEffect(() => {
    if (!slug) return
    setSelectedCat(slug)

    async function load() {
      setLoading(true)
      try {
        const catData = await api.categories.list()
        setCategories(catData.categories || catData || [])

        const params = { limit: 50, published: true, sort }
        if (slug !== 'all') params.category = slug
        const data = await api.apps.list(params)
        setApps(data.apps || [])
      } catch (err) {
        console.error('Category load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, sort])

  useEffect(() => {
    setSelectedCat(slug)
  }, [slug])

  const currentCategory = categories.find(c => c.slug === slug)

  return (
    <>
      <Head>
        <title>{currentCategory?.name || 'Category'} - MarketHub</title>
      </Head>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">
              {currentCategory?.name || (slug === 'all' ? 'All Apps' : 'Category')}
            </h1>
            <p className="text-sm text-surface-400 dark:text-surface-500">{apps.length} apps</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          <button
            onClick={() => router.push('/category/all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCat === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCat === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => router.push(`/category/${cat.slug}`)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isSelected ? cat.color : cat.color + '18',
                  color: isSelected ? '#fff' : cat.color,
                }}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-surface-400 dark:text-surface-500">Sort by:</span>
          <div className="flex gap-1.5">
            {sorts.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sort === s.value
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-surface-200 dark:bg-surface-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
                  <div className="h-3 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
                </div>
                <div className="w-16 h-8 rounded-full bg-surface-200 dark:bg-surface-700" />
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <EmptyState
            title="No apps found"
            description="There are no apps in this category yet."
            action={
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 rounded-full bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-all"
              >
                Browse Home
              </button>
            }
          />
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
