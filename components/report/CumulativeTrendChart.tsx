'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CumulativeTrendChartProps {
  data: { month: string; displayMonth: string; cumulative: number }[];
}

export default function CumulativeTrendChart({ data }: CumulativeTrendChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 h-full">
      <h3 className="text-sm font-bold text-blue-600 text-center mb-2">積上げ推移</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="displayMonth" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()}万円`, '累計売上']}
            labelFormatter={(label) => label}
          />
          <Legend
            formatter={() => '累計売上'}
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            dataKey="cumulative"
            type="monotone"
            stroke="#1E40AF"
            strokeWidth={2}
            dot={{ r: 3, fill: '#1E40AF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
