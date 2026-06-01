import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import StoreLayout from '../../components/store/StoreLayout';
import storeApi from '../../utils/storeApi';
import { Download, CheckCircle, Clock, RefreshCw, PackageOpen, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState('downloading');
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    storeApi.apps.list({ limit: 20, sort: 'updated', published: 'true' })
      .then(d => setRecentApps(d.apps || d || []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'downloading', label: 'Downloading', icon: Download },
    { id: 'installed', label: 'Installed', icon: CheckCircle },
    { id: 'updates', label: 'Updates', icon: RefreshCw },
  ];

  return (
    <StoreLayout>
      <Head><title>Downloads - AppStore</title></Head>

      <div className="px-4 pt-2 mb-4">
        <h1 className="text-xl font-bold">Downloads</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Manage your apps</p>
      </div>

      <div className="px-4 mb-6">
        <div className="flex bg-surface-100 dark:bg-surface-800 rounded-2xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === id ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-surface-100' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'}`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'downloading' && (
          <motion.div key="downloading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <Clock size={28} className="text-surface-400" />
              </div>
              <h3 className="font-semibold mb-1">No active downloads</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center">Downloads will appear here when you install an app.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'installed' && (
          <motion.div key="installed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4">
            {recentApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                  <PackageOpen size={28} className="text-surface-400" />
                </div>
                <h3 className="font-semibold mb-1">No apps installed</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 text-center">Apps you install will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApps.slice(0, 10).map((app, i) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/store/app/${app.id}`} className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-purple-500/20 overflow-hidden flex-shrink-0">
                        {app.icon_url ? <img src={app.icon_url} alt="" className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center text-primary-500 font-bold">{app.name?.[0]}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{app.name}</p>
                        <p className="text-xs text-surface-400 truncate">{app.package_name || ''}</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                        <CheckCircle size={14} /> Installed
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'updates' && (
          <motion.div key="updates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <RefreshCw size={28} className="text-surface-400" />
              </div>
              <h3 className="font-semibold mb-1">All apps up to date</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center">No updates available. Your installed apps are current.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-8" />
    </StoreLayout>
  );
}
