import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { settingsApi } from '../../utils/api';
import { authApi } from '../../utils/api';
import {
  Settings, Save, Sun, Moon, HardDrive, Trash2,
  Lock, Shield, Globe, Loader2, RefreshCw, Eye, EyeOff, Check
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [generalForm, setGeneralForm] = useState({
    site_name: '',
    site_description: '',
  });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClearCache, setShowClearCache] = useState(false);
  const [confirmSettings, setConfirmSettings] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem('theme');
    setDarkMode(stored ? stored === 'dark' : true);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, storageRes] = await Promise.all([
        settingsApi.getAll(),
        settingsApi.storage(),
      ]);
      const s = settingsRes.settings || settingsRes;
      setSettings(s);
      setGeneralForm({
        site_name: s.site_name || s.siteName || '',
        site_description: s.site_description || s.siteDescription || '',
      });
      setStorage(storageRes.storage || storageRes);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const handleGeneralSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.all(
        Object.entries(generalForm).map(([key, value]) =>
          settingsApi.update({ key, value })
        )
      );
      toast.success('Settings saved');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error('Fill in all password fields');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      await settingsApi.update({ two_factor_enabled: !twoFAEnabled });
      setTwoFAEnabled(!twoFAEnabled);
      toast.success(`2FA ${twoFAEnabled ? 'disabled' : 'enabled'}`);
    } catch (err) {
      toast.error('Failed to update 2FA');
    }
  };

  const handleClearCache = async () => {
    try {
      await settingsApi.update({ clear_cache: true });
      toast.success('Cache cleared');
      setShowClearCache(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to clear cache');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Layout>
    );
  }

  const storageData = storage || {};
  const usedBytes = storageData.used || storageData.usedBytes || 0;
  const totalBytes = storageData.max || storageData.total || storageData.totalBytes || 100 * 1024 * 1024 * 1024;
  const usagePercent = totalBytes > 0 ? Math.min((usedBytes / totalBytes) * 100, 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-surface-400 mt-1">Manage your app store configuration</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-card w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
              <form onSubmit={(e) => { e.preventDefault(); setConfirmSettings(true); }} className="space-y-5">
              <h2 className="text-lg font-semibold mb-1">General Settings</h2>
              <p className="text-sm text-surface-400 mb-4">Configure your app store name and branding</p>

              <div>
                <label className="block text-sm font-medium mb-1.5">Site Name</label>
                <input
                  value={generalForm.site_name}
                  onChange={(e) => setGeneralForm({ ...generalForm, site_name: e.target.value })}
                  className="glass-input"
                  placeholder="My App Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Site Description</label>
                <textarea
                  value={generalForm.site_description}
                  onChange={(e) => setGeneralForm({ ...generalForm, site_description: e.target.value })}
                  className="glass-input h-24 resize-none"
                  placeholder="A short description of your app store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Theme</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      darkMode
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                        : 'border-surface-200 dark:border-surface-700 text-surface-400'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm font-medium">Dark Mode</span>
                    {darkMode && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      !darkMode
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                        : 'border-surface-200 dark:border-surface-700 text-surface-400'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm font-medium">Light Mode</span>
                    {!darkMode && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={() => setConfirmSettings(true)} disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {submitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'storage' && (
          <motion.div
            key="storage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-1">Storage</h2>
            <p className="text-sm text-surface-400 mb-6">Monitor and manage your storage usage</p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-surface-400">{formatBytes(usedBytes)} / {formatBytes(totalBytes)}</span>
                </div>
                <div className="h-4 rounded-xl bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-xl transition-all ${
                      usagePercent > 90
                        ? 'bg-red-500'
                        : usagePercent > 70
                        ? 'bg-amber-500'
                        : 'bg-primary-500'
                    }`}
                  />
                </div>
                <p className="text-xs text-surface-400 mt-1">{usagePercent < 0.05 ? '< 0.1' : usagePercent.toFixed(1)}% used</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-2xl font-bold">{storageData.apkCount ?? storageData.fileCount ?? storageData.file_count ?? 0}</p>
                  <p className="text-xs text-surface-400 mt-1">APKs</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-2xl font-bold">{storageData.appCount ?? storageData.app_count ?? 0}</p>
                  <p className="text-xs text-surface-400 mt-1">Apps</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                  <p className="text-2xl font-bold">{storageData.screenshotCount ?? storageData.versionCount ?? storageData.version_count ?? 0}</p>
                  <p className="text-xs text-surface-400 mt-1">Screenshots</p>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
                <h3 className="text-sm font-medium mb-3">Maintenance</h3>
                <button
                  onClick={() => setShowClearCache(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cache
                </button>
                <p className="text-xs text-surface-400 mt-2">Remove temporary files and cached data to free up space</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-1">Change Password</h2>
              <p className="text-sm text-surface-400 mb-4">Update your account password</p>

              <form onSubmit={(e) => { e.preventDefault(); setConfirmPassword(true); }} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="glass-input pl-11 pr-11"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="glass-input pl-11 pr-11"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="glass-input pl-11 pr-11"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="button" onClick={() => setConfirmPassword(true)} disabled={submitting} className="btn-primary flex items-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {submitting ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
        )}
      </div>

      {/* Confirm Modals */}
      <ConfirmModal key="settings" open={confirmSettings} title="Save Settings?" message="Your configuration changes will be applied." confirmLabel="Save" onConfirm={() => { setConfirmSettings(false); handleGeneralSubmit(); }} onCancel={() => setConfirmSettings(false)} />
      <ConfirmModal key="password" open={confirmPassword} title="Change Password?" message="Your account password will be updated." confirmLabel="Change" onConfirm={() => { setConfirmPassword(false); handlePasswordChange(); }} onCancel={() => setConfirmPassword(false)} />
      <ConfirmModal key="cache" open={showClearCache} title="Clear Cache?" message="Remove all temporary files and cached data to free up space." confirmLabel="Clear" danger onConfirm={() => { handleClearCache(); }} onCancel={() => setShowClearCache(false)} />
    </Layout>
  );
}
