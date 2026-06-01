import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import AppCard from '../../components/AppCard';
import Modal from '../../components/Modal';
import { appsApi, categoriesApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Filter, SlidersHorizontal, Plus, Loader2,
  Grid3X3, List, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AppsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchCategories(); fetchApps(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchApps(), 300);
    return () => clearTimeout(timer);
  }, [search, category, sort, page]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.categories || []);
    } catch {}
  };

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await appsApi.list({ search, category, sort, page, limit: 20, include_archived: true });
      setApps(res.apps || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await appsApi.togglePublish(id);
      toast.success('App status updated');
      fetchApps();
    } catch { toast.error('Failed to update'); }
  };

  const handleToggleArchive = async (id) => {
    try {
      await appsApi.toggleArchive(id);
      toast.success('Archive status updated');
      fetchApps();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) return;
    try {
      await appsApi.delete(id);
      toast.success('App deleted');
      fetchApps();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Apps</h1>
            <p className="text-surface-400 mt-1">{apps.length} apps in store</p>
          </div>
          <Link href="/upload" className="btn-primary flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Upload APK
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search apps by name or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="glass-input pl-10 py-2.5"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="glass-input py-2.5 w-40"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="glass-input py-2.5 w-40"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="downloads">Most Downloaded</option>
                <option value="updated">Recently Updated</option>
              </select>
              <div className="flex rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Apps Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No apps found</h3>
            <p className="text-surface-400 text-sm mb-4">Try a different search or upload your first app</p>
            <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload First App
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
              {apps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onTogglePublish={handleTogglePublish}
                  onToggleArchive={handleToggleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
