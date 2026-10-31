import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import { Calendar, Search, Clock, CheckCircle2, XCircle, Phone } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search })
      };
      const { data } = await api.get('/appointments', { params });
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to load appointments' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;
    try {
      const { data } = await api.patch(`/appointments/${id}/cancel`);
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
        );
        setToast({ type: 'success', message: 'Appointment cancelled' });
      }
    } catch {
      setToast({ type: 'error', message: 'Failed to cancel appointment' });
    }
  };

  // Mask phone numbers to preserve patient privacy (NFR Privacy requirement)
  const maskPhone = (phone) => {
    if (!phone) return 'N/A';
    const clean = phone.trim();
    if (clean.length >= 6) {
      return `${clean.slice(0, 4)}****${clean.slice(-2)}`;
    }
    return clean;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Outpatient Appointments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Appointments booked via voice and conversational tool actions
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAppointments();
          }}
          className="flex-1 min-w-[240px] relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, masked phone, or department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by appointment status"
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No scheduled appointments found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Patient Name</th>
                <th className="px-5 py-3.5">Contact (Masked)</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Scheduled Date & Time</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 text-xs">
                    {a.name}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {maskPhone(a.phone)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-teal-700 dark:text-teal-300">
                    {a.department}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(a.scheduled_at).toLocaleDateString()} at {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        a.status === 'booked'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {a.status === 'booked' ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(a.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Cancel Slot
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Cancelled</span>
                    )}
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
