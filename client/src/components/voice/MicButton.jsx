import React, { useEffect } from 'react';
import { Mic, MicOff, Square, Loader2, Volume2 } from 'lucide-react';

export default function MicButton({
  state = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  onClick,
  disabled = false,
  handsFree = false
}) {
  // Spacebar hotkey to toggle voice when composer is not focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        if (!disabled && onClick) onClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, disabled]);

  const buttonConfigs = {
    idle: {
      bg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30 text-white',
      ring: 'border-teal-200 dark:border-teal-800',
      icon: <Mic className="w-7 h-7 sm:w-8 sm:h-8" />,
      label: handsFree ? 'Hands-Free (Tap to Pause)' : 'Tap to Speak'
    },
    listening: {
      bg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/40 text-white animate-pulse',
      ring: 'border-rose-300 dark:border-rose-700 ring-4 ring-rose-400/30',
      icon: <Square className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />,
      label: 'Listening... (Tap to Send)'
    },
    thinking: {
      bg: 'bg-indigo-600 text-white',
      ring: 'border-indigo-300 dark:border-indigo-700',
      icon: <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin" />,
      label: 'Thinking...'
    },
    speaking: {
      bg: 'bg-teal-500 text-white shadow-teal-500/40',
      ring: 'border-teal-300 dark:border-teal-700 ring-4 ring-teal-400/30',
      icon: <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />,
      label: 'Speaking (Tap to Barge-in)'
    }
  };

  const config = buttonConfigs[state] || buttonConfigs.idle;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        {/* Animated outer aura when active */}
        {(state === 'listening' || state === 'speaking') && (
          <span className="absolute -inset-2 rounded-full bg-current opacity-20 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={onClick}
          disabled={disabled || state === 'thinking'}
          aria-label={config.label}
          title={`${config.label} (Shortcut: Spacebar)`}
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl border-4 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-teal-400/40 ${config.bg} ${config.ring}`}
        >
          {config.icon}
        </button>
      </div>

      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center select-none">
        {config.label}
      </span>
    </div>
  );
}
