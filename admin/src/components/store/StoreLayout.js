import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Download, Grid, Moon, Sun, ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/store', label: 'Home', icon: Home },
  { href: '/store/search', label: 'Search', icon: Search },
  { href: '/store/downloads', label: 'Downloads', icon: Download },
  { href: '/store/category/all', label: 'Categories', icon: Grid },
];

export default function StoreLayout({ children }) {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('store-theme') === 'dark' ||
      (!localStorage.getItem('store-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('store-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/store" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">AppStore</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/store/search" className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors sm:hidden">
              <Search size={20} />
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20 pt-16">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href || (href !== '/store' && router.pathname.startsWith(href));
            return (
              <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-16 h-full group">
                {isActive && (
                  <motion.div layoutId="nav-indicator" className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary-500" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
                <Icon size={22} className={`transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'}`} />
                <span className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-surface-400 dark:text-surface-500'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
