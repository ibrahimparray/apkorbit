import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StoreLayout from '../../components/store/StoreLayout';
import FeaturedBanner from '../../components/store/FeaturedBanner';
import CategorySection from '../../components/store/CategorySection';
import AppCard from '../../components/store/AppCard';
import storeApi from '../../utils/storeApi';
import { TrendingUp, Clock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

export default function StoreHome() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectionApps, setSectionApps] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catData, appData] = await Promise.all([
          storeApi.categories.list(),
          storeApi.apps.list({ limit: 50, published: 'true' }),
        ]);
        const cats = catData.categories || catData || [];
        const apps = appData.apps || appData || [];

        setCategories(cats);
        setFeatured(apps.filter(a => a.is_featured).slice(0, 5));

        const sections = {
          trending: apps.filter(a => a.total_downloads > 0).sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0)).slice(0, 10),
          recent: [...apps].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 10),
          recommended: apps.filter(a => a.is_featured).slice(0, 10),
        };

        if (cats.length > 0) {
          for (const cat of cats.slice(0, 4)) {
            const res = await storeApi.apps.list({ category: cat.slug, limit: 10, published: 'true' }).catch(() => ({ apps: [] }));
            sections[cat.slug] = (res.apps || res || []).slice(0, 10);
          }
        }

        setSectionApps(sections);
      } catch (err) {
        console.error('Store load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <Head><title>AppStore - Discover Apps</title></Head>

      <FeaturedBanner apps={featured.length > 0 ? featured : sectionApps.trending || []} />

      <div className="mt-6 px-4">
        <Link href="/store/search" className="flex items-center gap-3 w-full p-3 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all group">
          <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:text-primary-500 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <span className="text-surface-400 dark:text-surface-500 flex-1 text-left text-sm">Search apps...</span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg bg-surface-100 dark:bg-surface-700 text-[11px] font-medium text-surface-400">⌘K</kbd>
        </Link>
      </div>

      <div className="mt-2 px-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {categories.slice(0, 4).map((cat, i) => (
          <Link key={cat.id} href={`/store/category/${cat.slug}`}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all group">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: cat.color || '#6366f1' }}>
                  {cat.name[0]}
                </div>
                <span className="text-xs font-medium truncate">{cat.name}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {sectionApps.trending?.length > 0 && (
        <CategorySection title="Trending Apps" apps={sectionApps.trending} />
      )}

      {sectionApps.recent?.length > 0 && (
        <CategorySection title="Recently Updated" apps={sectionApps.recent} />
      )}

      {sectionApps.recommended?.length > 0 && (
        <CategorySection title="Recommended" apps={sectionApps.recommended} />
      )}

      {categories.slice(0, 4).map(cat => (
        sectionApps[cat.slug]?.length > 0 && (
          <CategorySection key={cat.slug} title={cat.name} apps={sectionApps[cat.slug]} categorySlug={cat.slug} />
        )
      ))}

      <div className="h-8" />
    </StoreLayout>
  );
}
