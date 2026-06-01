import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { appsApi, categoriesApi } from '../../utils/api';
import {
  Download, ArrowLeft, Globe, Package, ExternalLink,
  Edit3, Eye, EyeOff, Archive, Trash2, Upload, Clock,
  Smartphone, HardDrive, Hash, Layers, FileCode
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AppDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [versionModal, setVersionModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  const [form, setForm] = useState({ name: '', short_description: '', description: '', category_id: '', website_url: '' });
  const [versionForm, setVersionForm] = useState({ version_name: '', version_code: '', changelog: '', min_sdk: 21, target_sdk: 34 });
  const [iconFile, setIconFile] = useState(null);
  const [apkFile, setApkFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (id) { fetchApp(); fetchCategories(); }
  }, [id]);

  const fetchApp = async () => {
    try {
      const res = await appsApi.detail(id);
      setApp(res.app);
      setVersions(res.versions || []);
      setForm({
        name: res.app.name || '',
        short_description: res.app.short_description || '',
        description: res.app.description || '',
        category_id: res.app.category_id || '',
        website_url: res.app.website_url || '',
      });
    } catch {
      toast.error('App not found');
      router.push('/apps');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.categories || []);
    } catch {}
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (iconFile) fd.append('icon', iconFile);
      await appsApi.update(id, fd);
      toast.success('App updated');
      setEditModal(false);
      fetchApp();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadVersion = async () => {
    if (!apkFile) { toast.error('Select APK file'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(versionForm).forEach(([k, v]) => fd.append(k, v));
      fd.append('apk_file', apkFile);
      await appsApi.uploadVersion(id, fd);
      toast.success('Version uploaded');
      setVersionModal(false);
      setApkFile(null);
      setVersionForm({ version_name: '', version_code: '', changelog: '', min_sdk: 21, target_sdk: 34 });
      fetchApp();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadScreenshots = async (e) => {
    e.preventDefault();
    if (screenshotFiles.length === 0) { toast.error('Select screenshots'); return; }
    try {
      const fd = new FormData();
      screenshotFiles.forEach(f => fd.append('screenshots', f));
      await appsApi.uploadScreenshots(id, fd);
      toast.success('Screenshots uploaded');
      setScreenshotFiles([]);
      fetchApp();
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  };

  const handleTogglePublish = async () => {
    try {
      await appsApi.togglePublish(id);
      toast.success('Status updated');
      fetchApp();
    } catch { toast.error('Failed'); }
  };

  const handleToggleArchive = async () => {
    try {
      await appsApi.toggleArchive(id);
      toast.success('Archive status updated');
      fetchApp();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await appsApi.delete(id);
      toast.success('App deleted');
      router.push('/apps');
    } catch { toast.error('Failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api\/?$/, '');

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!app) return null;

  const screenshots = app.screenshots ? (typeof app.screenshots === 'string' ? JSON.parse(app.screenshots) : app.screenshots) : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back */}
        <Link href="/apps" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Apps
        </Link>

        {/* App Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 shadow-xl flex-shrink-0">
              {app.icon_url ? (
                <img src={`${apiUrl}${app.icon_url}`} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {app.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">{app.name}</h1>
                  <p className="text-sm text-surface-400 font-mono mt-1">{app.package_name}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAction('publish')} className="btn-secondary flex items-center gap-2 text-sm">
                    {app.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {app.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => setEditModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
              <p className="text-surface-400 mt-3 line-clamp-2">{app.short_description || app.description || 'No description'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {app.category_name && (
                  <span className="badge" style={{ backgroundColor: `${app.category_color}15`, color: app.category_color }}>
                    {app.category_name}
                  </span>
                )}
                {app.is_published ? <span className="badge-green">Published</span> : <span className="badge-yellow">Draft</span>}
                {app.is_archived && <span className="badge-red">Archived</span>}
                {app.is_featured ? <span className="badge-purple">Featured</span> : null}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
            {[
              { icon: Download, label: 'Downloads', value: app.total_downloads?.toLocaleString() || '0' },
              { icon: Package, label: 'Versions', value: versions.length },
              { icon: Clock, label: 'Created', value: new Date(app.created_at).toLocaleDateString() },
              { icon: Clock, label: 'Updated', value: new Date(app.updated_at).toLocaleDateString() },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-surface-400" />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-surface-400">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-surface-400 leading-relaxed whitespace-pre-wrap">{app.description || 'No description provided.'}</p>
            </motion.div>

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Screenshots</h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {screenshots.map((url, i) => (
                    <button key={i} onClick={() => setSelectedScreenshot(url)} className="flex-shrink-0">
                      <img src={`${apiUrl}${url}`} alt={`Screenshot ${i + 1}`} className="h-48 rounded-xl object-cover border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Changelogs */}
            {versions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Version History</h2>
                <div className="space-y-4">
                  {versions.map((v, i) => (
                    <div key={v.id} className={`p-4 rounded-xl ${v.is_current ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold">v{v.version_name}</span>
                          <span className="text-xs text-surface-400 ml-2">(code {v.version_code})</span>
                          {v.is_current && <span className="badge-green ml-2">Current</span>}
                        </div>
                        <span className="text-xs text-surface-400">{new Date(v.created_at).toLocaleDateString()}</span>
                      </div>
                      {v.changelog && <p className="text-sm text-surface-400 whitespace-pre-wrap">{v.changelog}</p>}
                      <div className="flex gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatSize(v.file_size)}</span>
                        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />API {v.min_sdk}+</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{v.downloads_count} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button onClick={() => setVersionModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Upload New Version
                </button>
                <button onClick={handleUploadScreenshots} className="btn-secondary w-full flex items-center justify-center gap-2">
                  Screenshots
                </button>
                <hr className="border-surface-200 dark:border-surface-700" />
                <button onClick={() => setConfirmAction('archive')} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <Archive className="w-4 h-4" /> {app.is_archived ? 'Restore App' : 'Archive App'}
                </button>
                <button onClick={() => setConfirmAction('delete')} className="btn-danger w-full flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete App
                </button>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-surface-400" />
                  <div><p className="font-medium">App ID</p><p className="text-surface-400 font-mono text-xs">{app.id}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-surface-400" />
                  <div><p className="font-medium">Package</p><p className="text-surface-400 font-mono text-xs break-all">{app.package_name}</p></div>
                </div>
                {app.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-surface-400" />
                    <div><p className="font-medium">Website</p><a href={app.website_url} target="_blank" rel="noopener" className="text-primary-500 hover:underline text-xs">{app.website_url}</a></div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FileCode className="w-4 h-4 text-surface-400" />
                  <div><p className="font-medium">Slug</p><p className="text-surface-400 font-mono text-xs">{app.slug}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-surface-400" />
                  <div><p className="font-medium">Category</p><p className="text-surface-400 text-xs">{app.category_name || 'Uncategorized'}</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit App" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('update'); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">App Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Short Description</label>
            <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="glass-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input h-32 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="glass-input">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website URL</label>
              <input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="glass-input" placeholder="https://" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">App Icon</label>
            <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files[0])} className="glass-input py-2" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Version Modal */}
      <Modal isOpen={versionModal} onClose={() => setVersionModal(false)} title="Upload New Version" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); setConfirmAction('uploadVersion'); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Version Name</label>
              <input value={versionForm.version_name} onChange={(e) => setVersionForm({ ...versionForm, version_name: e.target.value })} className="glass-input" placeholder="1.0.0" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Version Code</label>
              <input type="number" value={versionForm.version_code} onChange={(e) => setVersionForm({ ...versionForm, version_code: e.target.value })} className="glass-input" placeholder="1" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Changelog</label>
            <textarea value={versionForm.changelog} onChange={(e) => setVersionForm({ ...versionForm, changelog: e.target.value })} className="glass-input h-24 resize-none" placeholder="What's new in this version?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Min SDK</label>
              <input type="number" value={versionForm.min_sdk} onChange={(e) => setVersionForm({ ...versionForm, min_sdk: e.target.value })} className="glass-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Target SDK</label>
              <input type="number" value={versionForm.target_sdk} onChange={(e) => setVersionForm({ ...versionForm, target_sdk: e.target.value })} className="glass-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">APK File</label>
            <input type="file" accept=".apk,.xapk,.aab" onChange={(e) => setApkFile(e.target.files[0])} className="glass-input py-2" required />
            <p className="text-xs text-surface-400 mt-1">Maximum file size: 100MB</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Uploading...' : 'Upload Version'}</button>
            <button type="button" onClick={() => setVersionModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Screenshot Viewer */}
      <Modal isOpen={!!selectedScreenshot} onClose={() => setSelectedScreenshot(null)} title="" size="xl">
        {selectedScreenshot && <img src={`${apiUrl}${selectedScreenshot}`} alt="Screenshot" className="w-full rounded-xl" />}
      </Modal>

      {/* Confirm Modal */}
      {confirmAction === 'delete' && (
        <ConfirmModal open danger title="Delete App?" message="This will permanently delete the app and all its versions. This action cannot be undone." confirmLabel="Delete" onConfirm={() => { setConfirmAction(null); handleDelete(); }} onCancel={() => setConfirmAction(null)} />
      )}
      {confirmAction === 'publish' && (
        <ConfirmModal open title={app.is_published ? 'Unpublish App?' : 'Publish App?'} message={app.is_published ? 'The app will be hidden from the store.' : 'The app will be visible to all users in the store.'} confirmLabel={app.is_published ? 'Unpublish' : 'Publish'} onConfirm={() => { setConfirmAction(null); handleTogglePublish(); }} onCancel={() => setConfirmAction(null)} />
      )}
      {confirmAction === 'archive' && (
        <ConfirmModal open title={app.is_archived ? 'Restore App?' : 'Archive App?'} message={app.is_archived ? 'The app will be restored and visible in the store.' : 'The app will be archived and hidden from the store.'} confirmLabel={app.is_archived ? 'Restore' : 'Archive'} onConfirm={() => { setConfirmAction(null); handleToggleArchive(); }} onCancel={() => setConfirmAction(null)} />
      )}
      {confirmAction === 'update' && (
        <ConfirmModal open title="Save Changes?" message="The app details will be updated in the store." confirmLabel="Save" onConfirm={() => { setConfirmAction(null); handleUpdate(); }} onCancel={() => setConfirmAction(null)} />
      )}
      {confirmAction === 'uploadVersion' && (
        <ConfirmModal open title="Upload New Version?" message="A new APK version will be published to the store." confirmLabel="Upload" onConfirm={() => { setConfirmAction(null); handleUploadVersion(); }} onCancel={() => setConfirmAction(null)} />
      )}
    </Layout>
  );
}
