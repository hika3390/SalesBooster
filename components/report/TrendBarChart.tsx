'use client';

import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface TrendBarChartProps {
  data: { month: string; displayMonth: string; sales: number; movingAvg: number | null }[];
}

export default function TrendBarChart({ data }: TrendBarChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 h-full">
      <h3 className="text-sm font-bold text-blue-600 text-center mb-2">トレンド</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="displayMonth" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toLocaleString()}万円`,
              name === 'sales' ? '売上' : '3ヶ月移動平均',
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            formatter={(value) => (value === 'sales' ? '推移' : '3ヶ月移動平均')}
            iconSize={10}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Bar dataKey="sales" fill="#4F6DB5" radius={[2, 2, 0, 0]} />
          <Line
            dataKey="movingAvg"
            type="monotone"
            stroke="#94A3B8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
