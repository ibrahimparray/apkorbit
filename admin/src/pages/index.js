import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../utils/api';
import {
  AppWindow, Download, Package, FolderOpen, HardDrive,
  ArrowUpRight, Clock, TrendingUp, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetchDashboard();
  }, [authLoading]);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsApi.dashboard();
      setData(res);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const { stats, recentUploads, recentUpdates, topDownloads, downloadsByDay, categoryDistribution } = data || {};
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-surface-400 mt-1">Welcome back, {user?.name}</p>
            </div>
            <Link href="/upload" className="btn-primary flex items-center gap-2">
              <Package className="w-4 h-4" />
              Upload APK
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={AppWindow} label="Total Apps" value={stats?.totalApps || 0} color="primary" trend={12} />
          <StatCard icon={Download} label="Total Downloads" value={stats?.totalDownloads?.toLocaleString() || 0} color="emerald" trend={8} />
          <StatCard icon={Package} label="Versions" value={stats?.totalVersions || 0} color="amber" />
          <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(stats?.storageUsed)} color="blue" sub={`${stats?.totalCategories} Categories`} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Downloads Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Downloads (30 Days)
              </h2>
            </div>
            {downloadsByDay?.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {downloadsByDay.map((d, i) => {
                  const max = Math.max(...downloadsByDay.map(x => x.count), 1);
                  const height = (d.count / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 transition-all duration-200 cursor-pointer"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${d.date}: ${d.count} downloads`}
                      />
                      <span className="text-[9px] text-surface-400 truncate w-full text-center">
                        {d.date?.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-surface-400 text-sm">
                No download data yet
              </div>
            )}
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-500" />
                Categories
              </h2>
            </div>
            <div className="space-y-3">
              {categoryDistribution?.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <span className="text-sm font-medium">{cat.count}</span>
                  <div className="w-24 h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((cat.count / Math.max(...categoryDistribution.map(c => c.count), 1)) * 100, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Uploads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Latest Uploads
              </h2>
              <Link href="/apps" className="text-sm text-primary-500 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentUploads?.length > 0 ? recentUploads.map((app, i) => (
                <Link key={i} href={`/apps/${app.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {app.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{app.name}</p>
                    <p className="text-xs text-surface-400">{app.version_name ? `v${app.version_name}` : 'No version'} &middot; {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-surface-400" />
                </Link>
              )) : (
                <p className="text-sm text-surface-400 text-center py-4">No uploads yet</p>
              )}
            </div>
          </motion.div>

          {/* Top Downloaded */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Most Downloaded
              </h2>
              <Link href="/analytics" className="text-sm text-primary-500 hover:underline">Analytics</Link>
            </div>
            <div className="space-y-3">
              {topDownloads?.length > 0 ? topDownloads.map((app, i) => (
                <Link key={i} href={`/apps/${app.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <span className="w-6 text-sm font-bold text-surface-300">{i + 1}</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {app.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{app.name}</p>
                    <p className="text-xs text-surface-400">{app.total_downloads?.toLocaleString()} downloads</p>
                  </div>
                  <Download className="w-4 h-4 text-surface-400" />
                </Link>
              )) : (
                <p className="text-sm text-surface-400 text-center py-4">No downloads yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
