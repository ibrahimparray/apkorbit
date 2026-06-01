import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { categoriesApi } from '../../utils/api';
import { FolderOpen, Plus, Edit2, Trash2, Palette, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'folder',
    color: '#6366f1',
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoriesApi.list();
      setCategories(res.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', icon: 'folder', color: '#6366f1' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || 'folder',
      color: cat.color || '#6366f1',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await categoriesApi.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(form);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoriesApi.delete(id);
      toast.success('Category deleted');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
    '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#6b7280', '#1e293b',
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-surface-400 mt-1">{categories.length} categories</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Create Category
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No categories yet</h3>
            <p className="text-surface-400 text-sm mb-4">Create your first category to organize apps</p>
            <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 group hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  >
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(cat)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                {cat.slug && (
                  <p className="text-xs text-surface-400 font-mono mb-2">/{cat.slug}</p>
                )}
                <p className="text-sm text-surface-400 line-clamp-2 mb-4">
                  {cat.description || 'No description'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#6366f1' }} />
                    <span className="text-xs text-surface-400">{cat.color}</span>
                  </div>
                  <span className="text-sm font-medium">{cat.app_count || 0} apps</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Category' : 'Create Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="glass-input"
              placeholder="Games"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="glass-input h-24 resize-none"
              placeholder="Category description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Icon</label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="glass-input"
            >
              <option value="folder">Folder</option>
              <option value="gamepad">Games</option>
              <option value="music">Music</option>
              <option value="video">Video</option>
              <option value="book">Books</option>
              <option value="shopping-cart">Shopping</option>
              <option value="settings">Tools</option>
              <option value="globe">Web</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="glass-input pl-10 w-32 font-mono uppercase"
                  placeholder="#6366f1"
                />
              </div>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent cursor-pointer"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${
                    form.color === color
                      ? 'border-white dark:border-surface-900 scale-110 shadow-lg'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-400">
            Are you sure you want to delete <strong className="text-surface-900 dark:text-surface-100">{deleteConfirm?.name}</strong>?
            This action cannot be undone. Apps in this category will become uncategorized.
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger flex-1 flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
