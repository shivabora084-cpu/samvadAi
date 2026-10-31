import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#10b981', // green
  neutral: '#64748b',  // slate
  negative: '#f43f5e'  // rose
};

export default function SentimentPieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">No sentiment data</div>;
  }

  const chartData = data.map((d) => ({
    name: d.sentiment.charAt(0).toUpperCase() + d.sentiment.slice(1),
    value: Number(d.count),
    color: SENTIMENT_COLORS[d.sentiment] || '#64748b'
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
              <Cell key={`cell-${index}`} fill={entry.color} />
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
