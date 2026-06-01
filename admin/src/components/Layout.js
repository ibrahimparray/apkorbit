import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import { settingsApi } from '../utils/api';
import {
  LayoutDashboard, AppWindow, Upload, FolderOpen, Download,
  RefreshCw, BarChart3, Settings, LogOut, Menu, X,
  Bell, Search, ChevronDown, Moon, Sun, Github, Package
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/apps', label: 'Apps', icon: AppWindow },
  { href: '/upload', label: 'Upload APK', icon: Upload },
  { href: '/categories', label: 'Categories', icon: FolderOpen },
  { href: '/downloads', label: 'Downloads', icon: Download },
  { href: '/updates', label: 'Updates', icon: RefreshCw },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [siteName, setSiteName] = useState('App Hub');
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : true;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    settingsApi.getAll().then(r => {
      const s = r.settings || r;
      if (s.site_name) setSiteName(s.site_name);
    }).catch(() => {});
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden"
          >
            <SidebarContent user={user} router={router} logout={logout} onClose={() => setSidebarOpen(false)} darkMode={darkMode} toggleDark={toggleDark} onLogoutClick={() => setConfirmLogout(true)} siteName={siteName} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-30">
        <SidebarContent user={user} router={router} logout={logout} darkMode={darkMode} toggleDark={toggleDark} onLogoutClick={() => setConfirmLogout(true)} siteName={siteName} />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-surface-200/50 dark:border-surface-700/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md ml-4 lg:ml-0">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className="glass-input pl-10 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Bell className="w-5 h-5 text-surface-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
              </button>

              <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-surface-500" />}
              </button>

              {user && (
                <div className="flex items-center gap-3 ml-2 pl-3 border-l border-surface-200 dark:border-surface-700">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-surface-400 capitalize">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary-500/20">
                    {user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title="Logout?"
        message="You will be signed out of the admin panel."
        confirmLabel="Logout"
        danger
        onConfirm={() => { setConfirmLogout(false); logout(); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}

function SidebarContent({ user, router, logout, onClose, darkMode, toggleDark, onLogoutClick, siteName }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-surface-200 dark:border-surface-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">{siteName}</h1>
            <p className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">Admin Panel</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-item group ${isActive ? 'active' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-200 dark:border-surface-800 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-surface-400 truncate">{user?.email || 'admin@apkstore.local'}</p>
          </div>
        </div>

        <button
          onClick={onLogoutClick}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
}
