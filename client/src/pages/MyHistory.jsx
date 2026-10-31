import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import Toast from '../components/Toast.jsx';
import {
  History,
  MessageSquare,
  Calendar,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Star,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function MyHistory() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/chat/mine');
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load conversation history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation and its transcript?')) {
      return;
    }

    try {
      await api.delete(`/chat/${id}`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setToast({ type: 'success', message: 'Conversation deleted permanently' });
    } catch {
      setToast({ type: 'error', message: 'Failed to delete conversation' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-teal-600" />
            My Voice & Chat History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your past interactions, transcripts, and status updates
          </p>
        </div>

        <button
          onClick={() => navigate('/chat')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
        >
          <MessageSquare className="w-4 h-4" />
          Start New Conversation
        </button>
      </div>

      {loading ? (
        <Loader text="Loading your history..." />
      ) : conversations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No conversations yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Speak or type to ask about hospital OPD timings, doctors, or book an appointment.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700"
          >
            Start First Chat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/chat?session=${c.id}`)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.language === 'hi' ? 'हिन्दी' : c.language === 'ta' ? 'தமிழ்' : 'English'}
                  </span>

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

                  {c.rating && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {c.rating}/5
                    </span>
                  )}

                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto md:ml-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(c.started_at).toLocaleDateString()} {new Date(c.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {c.summary || 'General inquiry regarding hospital services and doctor appointments.'}
                </p>

                {c.intents && c.intents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {c.intents.map((intent, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{intent}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={(e) => handleDelete(c.id, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
