import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import ActionCard from '../../components/voice/ActionCard.jsx';
import SentimentChip from '../../components/voice/SentimentChip.jsx';
import IntentChip from '../../components/voice/IntentChip.jsx';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  AlertTriangle,
  Clock,
  Zap,
  Bookmark,
  Star,
  Mic
} from 'lucide-react';

export default function ConversationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/conversations/${id}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load conversation details' });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <Loader fullScreen text="Loading transcript..." />;
  }

  if (!data?.conversation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 mb-4">Conversation session not found.</p>
        <button
          onClick={() => navigate('/admin/conversations')}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm"
        >
          Back to logs
        </button>
      </div>
    );
  }

  const { conversation, messages } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/conversations')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Conversation Logs
      </button>

      {/* Session Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                conversation.status === 'resolved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : conversation.status === 'escalated'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
              }`}
            >
              {conversation.status}
            </span>

            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Language: {conversation.language}
            </span>

            {conversation.rating && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {conversation.rating}/5 Rating
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Started: {new Date(conversation.started_at).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">User / Patient:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
              {conversation.user_name || `Guest (${conversation.guest_id || 'Anonymous'})`}
            </p>
            {conversation.user_email && <p className="text-slate-500">{conversation.user_email}</p>}
          </div>

          <div>
            <span className="text-slate-400 font-medium">Post-Conversation AI Summary:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {conversation.summary || 'Summary pending completion of session.'}
            </p>
          </div>
        </div>

        {/* Escalation 3-line handoff summary banner */}
        {conversation.escalated && conversation.escalation_summary && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
              Duty Officer Handoff Intelligence Summary
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {conversation.escalation_summary}
            </div>
          </div>
        )}
      </div>

      {/* Message Transcript */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
          Full Dialogue Transcript ({messages.length} messages)
        </h2>

        <div className="space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border ${
                  isUser
                    ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900 ml-4'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 mr-4'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold capitalize ${isUser ? 'text-teal-700 dark:text-teal-300' : 'text-indigo-700 dark:text-indigo-300'}`}>
                      {m.role === 'user' ? 'User' : 'SamvadAI Assistant'}
                    </span>
                    {m.input_mode === 'voice' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-teal-600 bg-teal-100/60 dark:bg-teal-950 px-1.5 py-0.5 rounded">
                        <Mic className="w-2.5 h-2.5" /> Spoken
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {m.text}
                </p>

                {/* Tool calls rendered */}
                {m.tool_calls && m.tool_calls.length > 0 && (
                  <div className="space-y-2">
                    {m.tool_calls.map((act, i) => (
                      <ActionCard key={i} action={act} />
                    ))}
                  </div>
                )}

                {/* Metadata footer */}
                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {m.intent && <IntentChip intent={m.intent} />}
                    {m.sentiment && (
                      <SentimentChip sentiment={m.sentiment} score={m.sentiment_score} />
                    )}
                    {m.confidence !== null && m.confidence !== undefined && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Confidence: {Math.round(m.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {m.latency_ms && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {m.latency_ms}ms
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
