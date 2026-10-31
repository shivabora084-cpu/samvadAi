import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const BAR_COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#6366f1', '#818cf8', '#f59e0b', '#ec4899'];

export default function IntentBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">No intent data</div>;
  }

  const chartData = data.map((d) => ({
    intent: `#${d.intent}`,
    count: Number(d.count)
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="intent" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '0.75rem',
              border: 'none',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
