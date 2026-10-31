import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function Knowledge() {
  const [searchParams] = useSearchParams();
  const prefillTitle = searchParams.get('title') || '';
  const prefillLang = searchParams.get('lang') || 'en';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(Boolean(prefillTitle));
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: prefillTitle,
    content: '',
    category: 'general',
    tags: '',
    language: prefillLang,
    active: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter })
      };
      const { data } = await api.get('/knowledge', { params });
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load knowledge articles' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [categoryFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      category: 'general',
      tags: '',
      language: 'en',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      language: item.language || 'en',
      active: item.active !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      };

      if (editingId) {
        await api.put(`/knowledge/${editingId}`, payload);
        setToast({ type: 'success', message: 'Knowledge article updated' });
      } else {
        await api.post('/knowledge', payload);
        setToast({ type: 'success', message: 'New knowledge article published' });
      }

      setIsModalOpen(false);
      fetchKnowledge();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save knowledge article'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this knowledge article from search index?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setToast({ type: 'success', message: 'Article deleted successfully' });
    } catch {
      setToast({ type: 'error', message: 'Failed to delete article' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Knowledge Base Manager (RAG Grounding)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organization policies, timings, and fees. SamvadAI answers strictly from these articles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchKnowledge();
          }}
          className="flex-1 min-w-[240px] relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge title, content, or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="timings">Timings</option>
          <option value="services">Services</option>
          <option value="billing">Billing & Fees</option>
          <option value="emergency">Emergency</option>
          <option value="admission">Admission</option>
          <option value="insurance">Insurance</option>
          <option value="guidelines">Guidelines</option>
          <option value="vaccination">Vaccination</option>
          <option value="support">Support</option>
        </select>
      </div>

      {/* Articles Grid / List */}
      {loading ? (
        <Loader text="Loading knowledge base..." />
      ) : articles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No knowledge entries found. Add your first article!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-teal-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    {item.language}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {item.content}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit article"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                {editingId ? 'Edit Knowledge Article' : 'Add Grounded Knowledge Article'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cardiology OPD Schedule and Consultation Fee"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  >
                    <option value="timings">Timings</option>
                    <option value="services">Services</option>
                    <option value="billing">Billing & Fees</option>
                    <option value="emergency">Emergency</option>
                    <option value="admission">Admission</option>
                    <option value="insurance">Insurance</option>
                    <option value="guidelines">Guidelines</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="support">Support</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Search Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="doctor, heart, consultation, timings, fee"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Content (Exact ground truth facts for AI assistant)
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="State the exact facts, timings, rules, or phone numbers. The assistant will answer using only this factual context."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/30 disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
