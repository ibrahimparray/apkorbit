import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { appsApi, categoriesApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Upload, Package, X, Image, FileText, Loader2 } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [createdAppId, setCreatedAppId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmUpload, setConfirmUpload] = useState(false);

  const [form, setForm] = useState({
    name: '',
    package_name: '',
    version_name: '',
    version_code: '',
    category_id: '',
    description: '',
    short_description: '',
    changelog: '',
    website_url: '',
  });

  const [apkFile, setApkFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.categories || []);
    } catch {}
  };

  const handleScreenshotsChange = (e) => {
    setScreenshotFiles(Array.from(e.target.files));
  };

  const removeScreenshot = (index) => {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!apkFile) { toast.error('Please select an APK file'); return; }
    if (!form.name || !form.package_name || !form.version_name || !form.version_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const appFd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) appFd.append(k, v); });
      if (iconFile) appFd.append('icon', iconFile);
      const appRes = await appsApi.create(appFd);
      const appId = appRes.app?.id || appRes.id;
      setCreatedAppId(appId);

      const versionFd = new FormData();
      versionFd.append('version_name', form.version_name);
      versionFd.append('version_code', form.version_code);
      if (form.changelog) versionFd.append('changelog', form.changelog);
      versionFd.append('apk_file', apkFile);
      await appsApi.uploadVersion(appId, versionFd);

      if (screenshotFiles.length > 0) {
        const screenshotFd = new FormData();
        screenshotFiles.forEach((f) => screenshotFd.append('screenshots', f));
        await appsApi.uploadScreenshots(appId, screenshotFd);
      }

      toast.success('App uploaded successfully!');
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-6">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
            <p className="text-surface-400 mb-8">Your APK has been uploaded and published successfully.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push(createdAppId ? `/apps/${createdAppId}` : '/apps')} className="btn-primary">
                View App
              </button>
              <button onClick={() => { setShowSuccess(false); setStep(1); setApkFile(null); setIconFile(null); setScreenshotFiles([]); setForm({ name: '', package_name: '', version_name: '', version_code: '', category_id: '', description: '', short_description: '', changelog: '', website_url: '' }); }} className="btn-secondary">
                Upload Another
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Upload APK</h1>
          <p className="text-surface-400 mt-1">Add a new app to the store</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {['App Details', 'Upload Files'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                step >= i + 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= i + 1 ? 'text-primary-500' : 'text-surface-400'}`}>
                {label}
              </span>
              {i === 0 && <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700 mx-2" />}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setConfirmUpload(true); }}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">App Name <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="glass-input"
                  placeholder="My Awesome App"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Package Name <span className="text-red-500">*</span></label>
                <input
                  value={form.package_name}
                  onChange={(e) => setForm({ ...form, package_name: e.target.value })}
                  className="glass-input font-mono"
                  placeholder="com.example.myapp"
                  required
                />
                <p className="text-xs text-surface-400 mt-1">The Android package identifier (e.g., com.example.app)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Version Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.version_name}
                    onChange={(e) => setForm({ ...form, version_name: e.target.value })}
                    className="glass-input"
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Version Code <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.version_code}
                    onChange={(e) => setForm({ ...form, version_code: e.target.value })}
                    className="glass-input"
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Short Description</label>
                <input
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className="glass-input"
                  placeholder="A brief tagline for your app"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="glass-input h-32 resize-none"
                  placeholder="Describe your app in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Changelog</label>
                <textarea
                  value={form.changelog}
                  onChange={(e) => setForm({ ...form, changelog: e.target.value })}
                  className="glass-input h-24 resize-none"
                  placeholder="What's new in this version?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Website URL</label>
                <input
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="glass-input"
                  placeholder="https://myapp.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">
                  Next Step
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">APK File <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".apk,.xapk,.aab"
                    onChange={(e) => setApkFile(e.target.files[0])}
                    className="hidden"
                    id="apk-upload"
                  />
                  <label
                    htmlFor="apk-upload"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      apkFile
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      apkFile ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                    }`}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{apkFile ? apkFile.name : 'Click to select APK file'}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {apkFile ? `${(apkFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Supports .apk, .xapk, .aab (max 500MB)'}
                      </p>
                    </div>
                    {apkFile && (
                      <button type="button" onClick={() => setApkFile(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                        <X className="w-4 h-4 text-surface-400" />
                      </button>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">App Icon</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files[0])}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      iconFile
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-surface-300 dark:border-surface-600 hover:border-emerald-400 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      iconFile ? 'bg-emerald-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                    }`}>
                      <Image className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{iconFile ? iconFile.name : 'Click to select icon'}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {iconFile ? `${(iconFile.size / 1024).toFixed(0)} KB` : 'Recommended: 512x512 PNG'}
                      </p>
                    </div>
                    {iconFile && (
                      <button type="button" onClick={() => setIconFile(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                        <X className="w-4 h-4 text-surface-400" />
                      </button>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Screenshots</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleScreenshotsChange}
                    className="hidden"
                    id="screenshots-upload"
                  />
                  <label
                    htmlFor="screenshots-upload"
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 hover:border-purple-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Click to select screenshots</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {screenshotFiles.length > 0
                          ? `${screenshotFiles.length} file(s) selected`
                          : 'Select multiple screenshots (PNG, JPG)'}
                      </p>
                    </div>
                  </label>
                </div>
                {screenshotFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {screenshotFiles.map((file, i) => (
                      <div key={i} className="relative group">
                        <div className="w-20 h-20 rounded-xl bg-surface-100 dark:bg-surface-800 overflow-hidden border border-surface-200 dark:border-surface-700">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {submitting ? 'Uploading...' : 'Upload App'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>

      <ConfirmModal
        open={confirmUpload}
        title="Upload App?"
        message="This app will be published to the store immediately."
        confirmLabel="Upload"
        onConfirm={() => { setConfirmUpload(false); handleSubmit(); }}
        onCancel={() => setConfirmUpload(false)}
      />
    </Layout>
  );
}
