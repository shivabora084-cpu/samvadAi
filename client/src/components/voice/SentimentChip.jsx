import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

export default function SentimentChip({ sentiment = 'neutral', score = null }) {
  const configs = {
    positive: {
      label: 'Positive',
      icon: <Smile className="w-3 h-3 text-emerald-500" />,
      classes: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    negative: {
      label: 'Negative',
      icon: <Frown className="w-3 h-3 text-rose-500" />,
      classes: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
    neutral: {
      label: 'Neutral',
      icon: <Meh className="w-3 h-3 text-slate-500" />,
      classes: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  };

  const config = configs[sentiment] || configs.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${config.classes}`}
      title={score !== null ? `Sentiment score: ${score}` : undefined}
    >
      {config.icon}
      <span>{config.label}</span>
      {score !== null && <span className="opacity-60 text-[10px]">({Number(score).toFixed(1)})</span>}
    </span>
  );
}
