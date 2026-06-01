import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import StoreLayout from '../../../components/store/StoreLayout';
import ScreenshotCarousel from '../../../components/store/ScreenshotCarousel';
import storeApi from '../../../utils/storeApi';
import { Download, Shield, Clock, HardDrive, ChevronDown, ChevronUp, Star, Share2, ExternalLink, Check, RefreshCw, Loader2, FileText } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDownloads(n) {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function AppDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [appData, verData] = await Promise.all([
          storeApi.apps.detail(id),
          storeApi.apps.latestVersion(id).catch(() => null),
        ]);
        setApp(appData.app || appData);
        setVersion(verData?.version || verData);
      } catch (err) {
        console.error('App load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleInstall = () => {
    if (!app) return;
    setDownloading(true);
    setDownloadProgress(0);

    const url = storeApi.apps.download(app.id, version?.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.package_name || app.name}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 2000);
    }, 5000);
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      </StoreLayout>
    );
  }

  if (!app) {
    return (
      <StoreLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <FileText size={32} className="text-surface-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">App not found</h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">This app might have been removed or is unavailable.</p>
          <button onClick={() => router.push('/store')} className="btn-primary">Back to Store</button>
        </div>
      </StoreLayout>
    );
  }

  const screenshots = app.screenshots ? (typeof app.screenshots === 'string' ? JSON.parse(app.screenshots) : app.screenshots) : [];

  return (
    <StoreLayout>
      <Head><title>{app.name} - AppStore</title></Head>

      <div className="px-4 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
      </div>

      <div className="px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-purple-500/20 overflow-hidden ring-2 ring-surface-200 dark:ring-surface-700 flex-shrink-0">
            {app.icon_url ? (
              <img src={app.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-500 dark:text-primary-400 font-bold text-3xl">
                {app.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{app.name}</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 truncate">{app.package_name || ''}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm text-surface-600 dark:text-surface-300">
                <Star size={14} className="text-amber-400 fill-amber-400" /> {app.rating || '4.5'}
              </span>
              <span className="text-sm text-surface-400">·</span>
              <span className="text-sm text-surface-500 dark:text-surface-400">{formatDownloads(app.total_downloads)} downloads</span>
            </div>
          </div>
        </motion.div>

        {screenshots.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <h3 className="text-sm font-semibold mb-3 px-1">Screenshots</h3>
            <ScreenshotCarousel screenshots={screenshots} />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-surface-400" />
            <h3 className="text-sm font-semibold">Description</h3>
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{app.description || 'No description available.'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {version && (
              <>
                <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2 text-surface-400 mb-1">
                    <Shield size={14} />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Version</span>
                  </div>
                  <span className="font-semibold text-sm">{version.version_name || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2 text-surface-400 mb-1">
                    <HardDrive size={14} />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Size</span>
                  </div>
                  <span className="font-semibold text-sm">{formatSize(version.file_size)}</span>
                </div>
              </>
            )}
            <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <RefreshCw size={14} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Updated</span>
              </div>
              <span className="font-semibold text-sm">{formatDate(app.updated_at || app.created_at)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <Download size={14} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Downloads</span>
              </div>
              <span className="font-semibold text-sm">{formatDownloads(app.total_downloads)}</span>
            </div>
          </div>
        </motion.div>

        {version?.changelog && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
            <button onClick={() => setShowChangelog(!showChangelog)} className="flex items-center justify-between w-full p-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 transition-colors">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-surface-400" />
                <span className="text-sm font-semibold">What's New</span>
              </div>
              {showChangelog ? <ChevronUp size={18} className="text-surface-400" /> : <ChevronDown size={18} className="text-surface-400" />}
            </button>
            <AnimatePresence>
              {showChangelog && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 mt-1 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
                    <p className="text-sm text-surface-600 dark:text-surface-300 whitespace-pre-wrap">{version.changelog}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="h-24" />
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 px-4 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{app.name}</p>
            {version && <p className="text-xs text-surface-400 truncate">v{version.version_name} · {formatSize(version.file_size)}</p>}
          </div>
          <button
            onClick={handleInstall}
            disabled={downloading}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.97] ${downloading ? 'bg-surface-200 dark:bg-surface-700 text-surface-500' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'}`}
          >
            {downloading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                {downloadProgress < 100 ? `Downloading ${Math.round(downloadProgress)}%` : 'Installing...'}
              </>
            ) : (
              <><Download size={18} /> Install</>
            )}
          </button>
        </div>
        {downloading && downloadProgress > 0 && downloadProgress < 100 && (
          <div className="max-w-7xl mx-auto mt-2">
            <div className="h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${downloadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </StoreLayout>
  );
}
