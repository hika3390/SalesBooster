'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];

interface PieChartProps {
  data: { name: string; value: number; ratio: number }[];
  title: string;
}

export default function PieChart({ data, title }: PieChartProps) {
  const filteredData = data.filter((d) => d.value > 0);

  return (
    <div className="bg-white border border-gray-200 rounded p-4 h-full">
      <h3 className="text-sm font-bold text-blue-600 text-center mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPieChart>
          <Pie
            data={filteredData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, payload }) => `${name} ${payload?.ratio ?? 0}%`}
            labelLine={{ strokeWidth: 1 }}
            fontSize={11}
            isAnimationActive={false}
          >
            {filteredData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value).toLocaleString()}万円`, name]}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
