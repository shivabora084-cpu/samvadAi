import React from 'react';
import { Volume2, VolumeX, Mic, MessageSquare, Bot, User, Bookmark } from 'lucide-react';
import SentimentChip from './SentimentChip.jsx';
import IntentChip from './IntentChip.jsx';
import ActionCard from './ActionCard.jsx';

export default function TranscriptBubble({ message, onReplay, isSpeakingThis = false }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-md flex flex-col items-end">
          <div className="p-4 rounded-2xl rounded-tr-sm bg-teal-600 text-white shadow-md text-sm leading-relaxed">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>

          <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-400">
            {message.input_mode === 'voice' ? (
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-teal-600" /> Voice
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Text
              </span>
            )}
            <span>•</span>
            <span>
              {new Date(message.created_at || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div className="flex justify-start mb-5 animate-fade-in">
      <div className="max-w-[90%] sm:max-w-lg flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <Bot className="w-4 h-4" />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
            <p className="whitespace-pre-wrap">{message.text}</p>

            {/* Action cards if any tool was executed */}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="space-y-2">
                {message.tool_calls.map((action, i) => (
                  <ActionCard key={i} action={action} />
                ))}
              </div>
            )}

            {/* Knowledge Source Badges (RAG Grounding attribution) */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-teal-600" /> Grounded in:
                </span>
                {message.sources.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Intelligence footer chips & TTS replay */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {message.intent && <IntentChip intent={message.intent} />}
              {message.sentiment && (
                <SentimentChip sentiment={message.sentiment} score={message.sentiment_score} />
              )}
            </div>

            <div className="flex items-center gap-2">
              {message.latency_ms && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {message.latency_ms}ms
                </span>
              )}
              {onReplay && (
                <button
                  type="button"
                  onClick={() => onReplay(message.text, message.language)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSpeakingThis
                      ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Replay Voice Speech"
                  aria-label="Replay message audio"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingThis ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
