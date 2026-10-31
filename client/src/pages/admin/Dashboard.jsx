import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import StatCard from '../../components/admin/StatCard.jsx';
import TimeSeriesChart from '../../components/admin/charts/TimeSeriesChart.jsx';
import LanguagePieChart from '../../components/admin/charts/LanguagePieChart.jsx';
import SentimentPieChart from '../../components/admin/charts/SentimentPieChart.jsx';
import IntentBarChart from '../../components/admin/charts/IntentBarChart.jsx';
import Loader from '../../components/Loader.jsx';
import Toast from '../../components/Toast.jsx';
import {
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Smile,
  Ticket,
  Calendar,
  Zap,
  PlusCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [intents, setIntents] = useState([]);
  const [sentiment, setSentiment] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [
          overviewRes,
          timeseriesRes,
          languagesRes,
          intentsRes,
          sentimentRes,
          unansweredRes
        ] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/timeseries'),
          api.get('/analytics/languages'),
          api.get('/analytics/intents'),
          api.get('/analytics/sentiment'),
          api.get('/analytics/top-unanswered')
        ]);

        if (overviewRes.data.success) setOverview(overviewRes.data.data);
        if (timeseriesRes.data.success) setTimeseries(timeseriesRes.data.data);
        if (languagesRes.data.success) setLanguages(languagesRes.data.data);
        if (intentsRes.data.success) setIntents(intentsRes.data.data);
        if (sentimentRes.data.success) setSentiment(sentimentRes.data.data);
        if (unansweredRes.data.success) setUnanswered(unansweredRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics dashboard:', err);
        setToast({ type: 'error', message: 'Failed to load intelligence metrics' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading agent intelligence metrics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Conversational Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics for City Care Hospital voice & text interactions
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/knowledge')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Knowledge Entry
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Conversations"
          value={overview?.totalConversations || 0}
          subtitle={`${overview?.totalMessages || 0} spoken & text messages`}
          icon={MessageSquare}
          color="teal"
        />

        <StatCard
          title="Resolution Rate"
          value={`${overview?.resolutionRate || 0}%`}
          subtitle="Resolved without human escalation"
          icon={CheckCircle}
          color="emerald"
        />

        <StatCard
          title="Escalation Rate"
          value={`${overview?.escalationRate || 0}%`}
          subtitle="Transferred to senior duty officer"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Average Latency"
          value={`${overview?.avgLatencyMs || 0}ms`}
          subtitle="Typical voice & AI turnaround"
          icon={Zap}
          color="indigo"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Open Support Tickets"
          value={overview?.openTickets || 0}
          subtitle={`Total tickets: ${overview?.totalTickets || 0}`}
          icon={Ticket}
          color="amber"
        />

        <StatCard
          title="Booked Appointments"
          value={overview?.bookedAppointments || 0}
          subtitle={`Total booked: ${overview?.totalAppointments || 0}`}
          icon={Calendar}
          color="teal"
        />

        <StatCard
          title="Customer Sentiment"
          value={overview?.avgSentiment ? `${overview.avgSentiment}` : '0.0'}
          subtitle="Average sentiment score (-1 to +1)"
          icon={Smile}
          color="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Volume Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Conversation Volume (Last 14 Days)
          </h2>
          <TimeSeriesChart data={timeseries} />
        </div>

        {/* Language Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Language Distribution
          </h2>
          <LanguagePieChart data={languages} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Intents Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Top Inquired Intents
          </h2>
          <IntentBarChart data={intents} />
        </div>

        {/* Sentiment Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Turn Sentiment Breakdown
          </h2>
          <SentimentPieChart data={sentiment} />
        </div>
      </div>

      {/* Top Unanswered Questions -> Knowledge Gap Action Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              Top Unanswered Questions (Knowledge Gap Radar)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identified low-confidence citizen inquiries. Click "Add to knowledge base" to teach SamvadAI how to answer them.
            </p>
          </div>
        </div>

        {unanswered.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No unanswered queries detected. All recent inquiries were answered with high confidence!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {unanswered.map((item, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    "{item.question}"
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="uppercase font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {item.language}
                    </span>
                    <span>
                      Confidence: <strong className="text-rose-500">{item.confidence ? `${Math.round(item.confidence * 100)}%` : '<35%'}</strong>
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/knowledge?title=${encodeURIComponent(item.question)}&lang=${item.language}`
                    )
                  }
                  className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add to Knowledge Base
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
