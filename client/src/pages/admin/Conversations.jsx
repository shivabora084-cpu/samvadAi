import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import {
  MessageSquare,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  User,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchConversations = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        ...(statusFilter && { status: statusFilter }),
        ...(langFilter && { language: langFilter }),
        ...(search && { search })
      };

      const { data } = await api.get('/conversations', { params });
      if (data.success) {
        setConversations(data.data || []);
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load conversations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(1);
  }, [statusFilter, langFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchConversations(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            Conversation Logs & Transcripts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and inspect all citizen dialogues, confidence scores, and tool invocations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by summary, patient name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            aria-label="Filter by language"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading conversations..." />
      ) : conversations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No conversations matching current filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">User / Patient</th>
                <th className="px-5 py-3.5">Language</th>
                <th className="px-5 py-3.5">Summary</th>
                <th className="px-5 py-3.5">Messages</th>
                <th className="px-5 py-3.5">Started At</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/conversations/${c.id}`)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        c.status === 'resolved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : c.status === 'escalated'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {c.user_name ? (
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{c.user_name}</p>
                        <p className="text-xs text-slate-400">{c.user_email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                        Guest ({c.guest_id ? c.guest_id.slice(0, 12) : 'Session'})
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {c.language}
                    </span>
                  </td>

                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                      {c.summary || 'Inquiry regarding hospital services, OPD, or booking.'}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {c.message_count || 0}
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(c.started_at).toLocaleDateString()} {new Date(c.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total sessions)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchConversations(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fetchConversations(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
