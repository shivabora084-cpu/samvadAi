import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import { Ticket, Search, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      };
      const { data } = await api.get('/tickets', { params });
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load tickets' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const { data } = await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        setToast({ type: 'success', message: `Ticket updated to ${newStatus}` });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to update ticket status' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Ticket className="w-6 h-6 text-amber-500" />
          Patient Support Tickets
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tickets generated automatically by SamvadAI tool calls or patient escalation
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTickets();
          }}
          className="flex-1 min-w-[240px] relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket code (e.g. SV-1001), subject, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading tickets..." />
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No support tickets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Ticket Code</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Created At</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                    {t.ticket_code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{t.subject}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{t.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        t.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : t.priority === 'high'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs capitalize text-slate-600 dark:text-slate-400">
                    {t.category}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      aria-label="Change ticket status"
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer border ${
                        t.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : t.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
