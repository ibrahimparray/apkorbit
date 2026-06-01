import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import StoreLayout from '../../components/store/StoreLayout';
import AppCard from '../../components/store/AppCard';
import storeApi from '../../utils/storeApi';
import { Search, X, Loader2, TrendingUp, Clock, Grid } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    storeApi.categories.list().then(d => {
      const cats = d.categories || d || [];
      setCategories(cats.slice(0, 6));
    }).catch(() => {});
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await storeApi.apps.list({ search: q, limit: 30, published: 'true' });
      setResults(data.apps || data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <StoreLayout>
      <Head><title>Search - AppStore</title></Head>

      <div className="px-4 pt-2">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
            <Search size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search apps..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 focus:border-primary-500 dark:focus:border-primary-400 outline-none text-sm font-medium transition-all shadow-sm"
          />
          {query && (
            <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        ) : searched ? (
          results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <Search size={28} className="text-surface-400" />
              </div>
              <h3 className="font-semibold mb-1">No results found</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Try different keywords</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
              <div className="space-y-2">
                {results.map((app, i) => (
                  <AppCard key={app.id} app={app} index={i} />
                ))}
              </div>
            </div>
          )
        ) : (
          <div>
            {categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Grid size={16} className="text-surface-400" /> Browse Categories
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {categories.map(cat => (
                    <Link key={cat.id} href={`/store/category/${cat.slug}`} className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: cat.color || '#6366f1' }}>
                        {cat.name[0]}
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-surface-400 px-1">
              <TrendingUp size={16} />
              <span>Type above to search apps</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-8" />
    </StoreLayout>
  );
}
