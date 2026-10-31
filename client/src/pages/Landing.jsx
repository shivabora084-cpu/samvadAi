import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Mic,
  Languages,
  ShieldCheck,
  CalendarCheck,
  LifeBuoy,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function Landing() {
  const { guestLogin } = useAuth();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestStart = async (lang) => {
    try {
      setGuestLoading(true);
      await guestLogin(lang);
      navigate('/chat');
    } catch (err) {
      console.error('Failed to start guest session:', err);
      navigate('/chat');
    } finally {
      setGuestLoading(false);
    }
  };

  const sampleVoices = [
    { code: 'en', label: 'English', text: '"What are the OPD timings and doctor fees?"' },
    { code: 'hi', label: 'हिन्दी (Hindi)', text: '"मुझे कल हृदय रोग विशेषज्ञ से मिलना है, अपॉइंटमेंट बुक कर दीजिए।"' },
    { code: 'ta', label: 'தமிழ் (Tamil)', text: '"என் ரத்தப் பரிசோதனை அறிக்கை எப்போது கிடைக்கும்?"' }
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-400/20 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 text-center">
        {/* Multilingual Pills */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-medium mb-6 animate-pulse-slow">
          <Languages className="w-4 h-4 text-teal-600" />
          <span>English • हिन्दी • தமிழ் • Code-mixed Tanglish</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Talk to us in your <br />
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
            natural spoken language
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SamvadAI powers small hospitals, health clinics, and citizen help desks with intelligent voice dialogue, instant multilingual transcription, grounded answers, and smart escalation.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleGuestStart(selectedLang)}
            disabled={guestLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Mic className="w-5 h-5 animate-bounce" />
            {guestLoading ? 'Connecting...' : 'Try Voice Assistant as Guest'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
          >
            Admin & Staff Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Samples Showcase */}
        <div className="mt-14 max-w-3xl mx-auto p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center justify-center gap-2">
            <Headphones className="w-4 h-4" />
            Sample Spoken Queries Supported
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            {sampleVoices.map((item) => (
              <div
                key={item.code}
                onClick={() => setSelectedLang(item.code)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedLang === item.code
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                  {selectedLang === item.code && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hands-Free & Push-To-Talk</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Speak naturally via Web Speech API or multimodal audio fallback. Spoken replies in your selected voice.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zero-Hallucination RAG</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Grounded exclusively in verified organization FAQs. Cites exact sources and admits when data is unavailable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Autonomous Tool Actions</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Book doctor appointments, register support tickets, and check live status directly through speech.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Human Escalation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Detects frustration and repeated confusion. Transfers to human duty officers with a 3-line AI summary.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>SamvadAI — Voice & Conversational Intelligence Platform. Built with React, Vite, Node, Express, Supabase & Gemini API.</p>
      </footer>
    </div>
  );
}
