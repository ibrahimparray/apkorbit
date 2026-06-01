import { motion } from 'framer-motion';
import Link from 'next/link';
import { Download, Star, Shield } from 'lucide-react';

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDownloads(n) {
  if (!n) return '';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function AppCard({ app, index = 0, featured = false }) {
  const latestVersion = app.versions?.[0];
  const downloadUrl = app.id ? `/store/app/${app.id}` : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={downloadUrl} className={`block group ${featured ? '' : ''}`}>
        <div className={`relative overflow-hidden transition-all duration-300 bg-white dark:bg-surface-800 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 ${featured ? 'rounded-2xl' : 'rounded-xl'}`}>
          {featured ? (
            <>
              <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {app.icon_url && (
                  <img src={app.icon_url} alt="" className="absolute bottom-4 left-4 w-16 h-16 rounded-2xl shadow-lg ring-2 ring-white/30" />
                )}
                <div className="absolute bottom-4 left-4 right-4" style={app.icon_url ? { left: '5rem' } : {}}>
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">{app.name}</h3>
                  <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{app.short_description || app.description?.slice(0, 60)}</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-medium">{app.rating || '4.5'}</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
                  {latestVersion && <span className="flex items-center gap-1"><Shield size={12} />v{latestVersion.version_name}</span>}
                  {latestVersion?.file_size && <span>{formatSize(latestVersion.file_size)}</span>}
                  <span>{formatDownloads(app.total_downloads)} downloads</span>
                </div>
                <span className="px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold group-hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25">
                  Install
                </span>
              </div>
            </>
          ) : (
            <div className="p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-purple-500/20 flex-shrink-0 overflow-hidden ring-1 ring-surface-200 dark:ring-surface-700">
                {app.icon_url ? (
                  <img src={app.icon_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-500 dark:text-primary-400 font-bold text-xl">
                    {app.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5">{app.short_description || app.description?.slice(0, 50) || ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  {latestVersion && <span className="text-[10px] text-surface-400 dark:text-surface-500">v{latestVersion.version_name}</span>}
                  {latestVersion?.file_size && <span className="text-[10px] text-surface-400 dark:text-surface-500">· {formatSize(latestVersion.file_size)}</span>}
                  {app.total_downloads > 0 && <span className="text-[10px] text-surface-400 dark:text-surface-500">· {formatDownloads(app.total_downloads)}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all duration-200 text-primary-500 dark:text-primary-400">
                  <Download size={16} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
