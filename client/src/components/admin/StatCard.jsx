import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'teal', trend = null }) {
  const colorMap = {
    teal: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 border-teal-200 dark:border-teal-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-200 dark:border-indigo-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-200 dark:border-rose-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-800'
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.teal}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
