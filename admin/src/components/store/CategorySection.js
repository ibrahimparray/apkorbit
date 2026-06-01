import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import AppCard from './AppCard';

export default function CategorySection({ title, apps = [], categorySlug, viewAll = true }) {
  const scrollRef = useRef(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);

  if (!apps || apps.length === 0) return null;

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = dir * 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollL(el.scrollLeft > 5);
      setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {viewAll && categorySlug && (
          <Link href={`/store/category/${categorySlug}`} className="flex items-center gap-1 text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors">
            View all <ChevronRight size={16} />
          </Link>
        )}
      </div>
      <div className="relative group">
        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-3 overflow-x-auto scrollbar-hide px-4 -mx-4 pb-2">
          {apps.map((app, i) => (
            <div key={app.id} className="flex-shrink-0 w-72">
              <AppCard app={app} index={i} />
            </div>
          ))}
        </div>
        {canScrollL && (
          <button onClick={() => scroll(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors z-10">
            <ChevronLeft size={20} />
          </button>
        )}
        {canScrollR && (
          <button onClick={() => scroll(1)} className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors z-10">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
