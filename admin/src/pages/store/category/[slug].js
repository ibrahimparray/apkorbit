import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';

import StoreLayout from '../../../components/store/StoreLayout';
import AppCard from '../../../components/store/AppCard';
import storeApi from '../../../utils/storeApi';
import { Loader2, Grid, ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [apps, setApps] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        setLoading(true);
        const catData = await storeApi.categories.list();
        const cats = catData.categories || catData || [];
        const cat = slug === 'all' ? null : cats.find(c => c.slug === slug);

        setCategory(cat);

        const params = { limit: 50, published: 'true' };
        if (cat) params.category = cat.slug;
        const appData = await storeApi.apps.list(params);
        setApps(appData.apps || appData || []);
      } catch (err) {
        console.error('Category load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  return (
    <StoreLayout>
      <Head><title>{category ? category.name : 'All Categories'} - AppStore</title></Head>

      <div className="px-4 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors mb-4">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          {category && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: category.color || '#6366f1' }}>
              {category.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{category ? category.name : 'All Categories'}</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">{apps.length} app{apps.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
            <Grid size={28} className="text-surface-400" />
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm">No apps found in this category.</p>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {apps.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      )}

      <div className="h-8" />
    </StoreLayout>
  );
}
