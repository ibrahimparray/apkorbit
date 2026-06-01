import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScreenshotCarousel({ screenshots = [] }) {
  const scrollRef = useRef(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);

  if (!screenshots || screenshots.length === 0) return null;

  const urls = typeof screenshots === 'string' ? JSON.parse(screenshots) : screenshots;

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollL(el.scrollLeft > 0);
      setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  return (
    <div className="relative group">
      <div ref={scrollRef} onScroll={checkScroll} className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 px-4 -mx-4">
        {urls.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="snap-start flex-shrink-0"
          >
            <div className="w-48 h-80 sm:w-52 sm:h-84 rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 shadow-lg ring-1 ring-surface-200 dark:ring-surface-700">
              <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>
        ))}
      </div>
      {canScrollL && (
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollR && (
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
