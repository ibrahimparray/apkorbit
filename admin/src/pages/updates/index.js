import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { appsApi } from '../../utils/api';
import { RefreshCw, Package, Clock, FileText, Smartphone, Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const res = await appsApi.list({ sort: 'updated', limit: 50, page: 1 });
      setUpdates(res.apps || []);
    } catch (err) {
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  const getAllVersions = (app) => {
    if (!app.versions || !Array.isArray(app.versions)) return [];
    return app.versions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const formatRelative = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Updates</h1>
            <p className="text-surface-400 mt-1">Recent app activity and version history</p>
          </div>
          <button onClick={fetchUpdates} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </motion.div>

        {updates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No updates yet</h3>
            <p className="text-surface-400 text-sm">Upload your first app to see version updates here</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {updates.map((app, i) => {
              const versions = getAllVersions(app);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link href={`/apps/${app.id}`} className="block glass-card p-5 group hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                        {app.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary-500 transition-colors">{app.name}</h3>
                          {app.package_name && (
                            <span className="text-xs text-surface-400 font-mono">{app.package_name}</span>
                          )}
                        </div>

                        {versions.length > 0 ? (
                          <div className="space-y-3 mt-3">
                            {versions.slice(0, 3).map((v, vi) => (
                              <div key={v.id} className={`p-3 rounded-xl ${
                                vi === 0
                                  ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20'
                                  : 'bg-surface-50 dark:bg-surface-800/50'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Package className={`w-4 h-4 ${vi === 0 ? 'text-primary-500' : 'text-surface-400'}`} />
                                    <span className="text-sm font-semibold">v{v.version_name}</span>
                                    {v.version_code && (
                                      <span className="text-xs text-surface-400">(code {v.version_code})</span>
                                    )}
                                    {vi === 0 && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500 text-white font-medium">Latest</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-surface-400 whitespace-nowrap">
                                    {formatRelative(v.created_at)}
                                  </span>
                                </div>
                                {v.changelog && (
                                  <p className="text-sm text-surface-400 mt-1 flex items-start gap-2">
                                    <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{v.changelog}</span>
                                  </p>
                                )}
                                <div className="flex gap-3 mt-2 text-xs text-surface-400">
                                  {v.file_size && (
                                    <span className="flex items-center gap-1">
                                      <Smartphone className="w-3 h-3" />
                                      {v.file_size >= 1048576
                                        ? `${(v.file_size / 1048576).toFixed(1)} MB`
                                        : `${(v.file_size / 1024).toFixed(0)} KB`}
                                    </span>
                                  )}
                                  {v.downloads_count !== undefined && (
                                    <span>{v.downloads_count} downloads</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {versions.length > 3 && (
                              <p className="text-xs text-primary-500">+{versions.length - 3} more versions</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-surface-400 mt-2">No versions uploaded yet</p>
                        )}
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-100 dark:border-surface-800 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Created {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Updated {formatRelative(app.updated_at)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
