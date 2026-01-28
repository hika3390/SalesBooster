'use client';

import React from 'react';

interface SalesPerson {
  rank: number;
  name: string;
  sales: number;
  target: number;
  achievement: number;
  imageUrl?: string;
  department?: string;
}

interface SalesBarProps {
  person: SalesPerson;
  index: number;
  maxSales: number;
  top20Index: number;
  columnWidth: number;
}

export default function SalesBar({ person, index, maxSales, top20Index, columnWidth }: SalesBarProps) {
  const barHeight = maxSales > 0 ? (person.sales / maxSales) * 100 : 0;

  // 色分け関数
  const getBarColor = (index: number): string => {
    const low20Index = Math.floor(20 * 0.8); // salesData.lengthの代わりに固定値を使用
    if (index < top20Index) return '#DC2626'; // 赤 (TOP 20%)
    if (index < low20Index) return '#1E40AF'; // 濃い青 (CENTER)
    return '#3B82F6'; // 薄い青 (LOW 20%)
  };

  const barColor = getBarColor(index);

  return (
    <div
      className="flex-1 h-full flex flex-col justify-end items-center"
      style={{ minWidth: `${columnWidth}px` }}
    >
      {/* 売上金額表示 */}
      {person.sales > 0 && (
        <div className="text-[10px] font-semibold mb-1 text-gray-700 whitespace-nowrap">
          {person.sales}万円
        </div>
      )}

      {/* バー */}
      <div
        className="w-full relative transition-all hover:opacity-80 border-r border-white"
        style={{
          height: `${barHeight}%`,
          backgroundColor: barColor,
          minHeight: person.sales > 0 ? '20px' : '0px'
        }}
      >
        {/* サムアップアイコン（TOP 20%のみ）*/}
        {index < top20Index && person.sales > 0 && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
