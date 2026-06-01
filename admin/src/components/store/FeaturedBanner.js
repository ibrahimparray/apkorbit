import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Download } from 'lucide-react';

export default function FeaturedBanner({ apps = [] }) {
  const [current, setCurrent] = useState(0);
  const featured = apps.filter(a => a.is_featured);
  const items = featured.length > 0 ? featured : apps.slice(0, 5);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (items.length === 0) return null;

  const app = items[current];

  return (
    <div className="relative px-4 mt-2">
      <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
            {app.banner_url && (
              <img src={app.banner_url} alt="" className="w-full h-full object-cover opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <Link href={`/store/app/${app.id}`} className="absolute inset-0 z-10 p-6 sm:p-8 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                {app.icon_url ? (
                  <img src={app.icon_url} alt="" className="w-12 h-12 rounded-2xl shadow-lg ring-2 ring-white/30" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/30">
                    {app.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-bold text-xl sm:text-2xl drop-shadow-sm">{app.name}</h2>
                  <p className="text-white/70 text-sm mt-0.5 line-clamp-1">{app.short_description || app.description?.slice(0, 80) || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {app.rating || '4.5'}</span>
                {app.total_downloads > 0 && (
                  <span className="flex items-center gap-1"><Download size={14} /> {app.total_downloads >= 1000 ? `${(app.total_downloads / 1000).toFixed(1)}K` : app.total_downloads}</span>
                )}
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-surface-900 font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg">
                  <Download size={16} /> Install
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </Link>

        {items.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-primary-500' : 'w-1.5 bg-surface-300 dark:bg-surface-600'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
