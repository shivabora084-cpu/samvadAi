import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899'];

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  auto: 'Auto'
};

export default function LanguagePieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">No language data</div>;
  }

  const chartData = data.map((d) => ({
    name: LANGUAGE_LABELS[d.language] || d.language.toUpperCase(),
    value: Number(d.count)
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '0.75rem',
              border: 'none',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
