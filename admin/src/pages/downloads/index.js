import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import { analyticsApi } from '../../utils/api';
import { Download, Smartphone, Globe, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState('all');

  useEffect(() => { fetchDownloads(); }, [page, period]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.downloads({ page, limit: 20, period: period === 'all' ? undefined : period });
      setDownloads(res.downloads || res.data || []);
      setTotalPages(res.totalPages || res.total_pages || 1);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const formatUA = (ua) => {
    if (!ua) return 'Unknown';
    if (ua.length > 40) return `${ua.slice(0, 40)}...`;
    return ua;
  };

  const getDeviceIcon = (ua) => {
    if (!ua) return Smartphone;
    const lower = ua.toLowerCase();
    if (lower.includes('android')) return Smartphone;
    if (lower.includes('iphone') || lower.includes('ipad')) return Smartphone;
    return Globe;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Downloads</h1>
            <p className="text-surface-400 mt-1">{total.toLocaleString()} total downloads</p>
          </div>
          <select
            value={period}
            onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
            className="glass-input w-36 py-2"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : downloads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <Download className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No downloads yet</h3>
            <p className="text-surface-400 text-sm">Downloads will appear here when users install your apps</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3">App</th>
                      <th className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3">Version</th>
                      <th className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3">Device</th>
                      <th className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">IP Address</th>
                      <th className="text-left text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">User Agent</th>
                      <th className="text-right text-xs font-medium text-surface-400 uppercase tracking-wider px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                    {downloads.map((dl, i) => {
                      const DeviceIcon = getDeviceIcon(dl.user_agent);
                      return (
                        <motion.tr
                          key={dl.id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {dl.app_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm font-medium">{dl.app_name || 'Unknown App'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-surface-400">{dl.version_name || dl.version || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DeviceIcon className="w-4 h-4 text-surface-400" />
                              <span className="text-sm text-surface-400">{dl.device_model || dl.device || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-surface-400 font-mono">{dl.ip_address || dl.ip || '—'}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-surface-400 font-mono" title={dl.user_agent}>
                              {formatUA(dl.user_agent)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-surface-400 whitespace-nowrap">
                              {new Date(dl.created_at || dl.date).toLocaleDateString()}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-surface-400 px-1">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            p === page
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                              : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
