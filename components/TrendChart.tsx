'use client';

import React from 'react';

interface MonthlyData {
  month: string;
  sales: number;
  displayMonth: string; // 表示用の月（例: "10月"）
}

interface TrendChartProps {
  monthlyData: MonthlyData[];
  title?: string;
}

export default function TrendChart({ monthlyData, title = 'チーム売上推移' }: TrendChartProps) {
  // 最大値と最小値を取得
  const maxSales = Math.max(...monthlyData.map(d => d.sales));
  const minSales = Math.min(...monthlyData.map(d => d.sales));

  // グラフの高さ範囲（パディング含む）
  const graphHeight = 400;
  const graphPadding = 40;
  const effectiveHeight = graphHeight - graphPadding * 2;

  // Y軸のスケール計算
  const yScale = (value: number) => {
    const normalized = (value - minSales) / (maxSales - minSales);
    return graphPadding + effectiveHeight * (1 - normalized);
  };

  // X軸の位置計算
  const xScale = (index: number) => {
    const graphWidth = monthlyData.length > 1 ? (monthlyData.length - 1) * 100 : 100;
    return 60 + (index / (monthlyData.length - 1 || 1)) * graphWidth;
  };

  // 折れ線のパスを生成
  const linePath = monthlyData.map((data, index) => {
    const x = xScale(index);
    const y = yScale(data.sales);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // SVGの全体幅を計算
  const svgWidth = Math.max(800, monthlyData.length * 100 + 120);

  return (
    <div className="bg-white mx-6 my-4 shadow-sm overflow-x-auto">
      <div className="p-6">
        {/* タイトル */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>

        {/* グラフエリア */}
        <div className="relative" style={{ minWidth: `${svgWidth}px` }}>
          <svg width={svgWidth} height={graphHeight + 100} className="overflow-visible">
            {/* グリッドライン */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = minSales + (maxSales - minSales) * ratio;
              const y = yScale(value);
              return (
                <g key={ratio}>
                  <line
                    x1={50}
                    y1={y}
                    x2={svgWidth - 40}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={30}
                    y={y + 4}
                    fontSize={11}
                    fill="#6b7280"
                    textAnchor="end"
                  >
                    {Math.round(value).toLocaleString()}万円
                  </text>
                </g>
              );
            })}

            {/* 折れ線グラフ */}
            <path
              d={linePath}
              fill="none"
              stroke="#1E40AF"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* データポイント */}
            {monthlyData.map((data, index) => {
              const x = xScale(index);
              const y = yScale(data.sales);

              return (
                <g key={index}>
                  {/* ポイントの円 */}
                  <circle
                    cx={x}
                    cy={y}
                    r={5}
                    fill="#1E40AF"
                    stroke="white"
                    strokeWidth={2}
                  />

                  {/* 値のラベル */}
                  <text
                    x={x}
                    y={y - 12}
                    fontSize={11}
                    fill="#1E40AF"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {data.sales.toLocaleString()}万円
                  </text>

                  {/* 月のラベル */}
                  <text
                    x={x}
                    y={graphHeight + 20}
                    fontSize={11}
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    {data.displayMonth}
                  </text>

                  {/* 日付のラベル */}
                  <text
                    x={x}
                    y={graphHeight + 35}
                    fontSize={10}
                    fill="#9ca3af"
                    textAnchor="middle"
                  >
                    {data.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 凡例 */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-blue-900"></div>
            <span className="text-gray-600">月間 （日次）</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-gray-400"></div>
            <span className="text-gray-600">月間 （累計）</span>
            <span className="text-xs text-gray-400">(0万円)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
