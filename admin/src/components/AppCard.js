import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, MoreVertical, Edit, Archive, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { imageUrl } from '../utils/storeApi';

export default function AppCard({ app, onTogglePublish, onToggleArchive, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-5 relative group hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* App Icon */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-100 dark:bg-surface-800 shadow-inner">
          {app.icon_url ? (
            <img src={imageUrl(app.icon_url)} alt={app.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {app.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/apps/${app.id}`} className="text-lg font-semibold hover:text-primary-500 transition-colors truncate block">
                {app.name}
              </Link>
              <p className="text-xs text-surface-400 font-mono truncate">{app.package_name}</p>
            </div>

            {/* Menu */}
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 py-1.5 rounded-xl glass-card shadow-xl z-20 border border-surface-200 dark:border-surface-700 animate-scale-in">
                    <Link href={`/apps/${app.id}`} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                      <Edit className="w-4 h-4" /> Edit
                    </Link>
                    <button onClick={() => { onTogglePublish?.(app.id); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                      {app.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {app.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => { onToggleArchive?.(app.id); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                      <Archive className="w-4 h-4" /> {app.is_archived ? 'Restore' : 'Archive'}
                    </button>
                    <hr className="my-1 border-surface-200 dark:border-surface-700" />
                    <button onClick={() => { onDelete?.(app.id); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {app.category_name && (
              <span className="badge" style={{ backgroundColor: `${app.category_color}15`, color: app.category_color }}>
                {app.category_name}
              </span>
            )}
            {app.version_name && (
              <span className="badge-blue">v{app.version_name}</span>
            )}
            {app.is_published ? (
              <span className="badge-green">Published</span>
            ) : (
              <span className="badge-yellow">Draft</span>
            )}
            {app.is_archived && (
              <span className="badge-red">Archived</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> {app.total_downloads || 0} downloads
            </span>
            {app.file_size && (
              <span>{formatSize(app.file_size)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
