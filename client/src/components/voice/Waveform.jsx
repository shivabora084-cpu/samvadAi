import React from 'react';

export default function Waveform({ state = 'idle', barCount = 5 }) {
  if (state === 'idle') {
    return (
      <div className="flex items-center justify-center gap-1 h-6">
        {[...Array(barCount)].map((_, i) => (
          <div key={i} className="w-1 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  const colorClass =
    state === 'listening'
      ? 'bg-rose-500'
      : state === 'speaking'
      ? 'bg-teal-500'
      : 'bg-indigo-500';

  return (
    <div className="flex items-center justify-center gap-1 h-6" aria-label={`Voice state: ${state}`}>
      {[...Array(barCount)].map((_, i) => {
        const delays = ['0ms', '150ms', '300ms', '150ms', '0ms'];
        const heights = ['h-3', 'h-5', 'h-6', 'h-4', 'h-2'];
        return (
          <span
            key={i}
            style={{ animationDelay: delays[i % delays.length] }}
            className={`w-1 rounded-full ${colorClass} animate-pulse ${heights[i % heights.length]}`}
          />
        );
      })}
    </div>
  );
}
