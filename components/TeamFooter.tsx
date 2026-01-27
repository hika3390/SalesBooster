'use client';

import React from 'react';

interface TeamFooterProps {
  totalSales: number;
  achievementRate: number;
}

export default function TeamFooter({ totalSales, achievementRate }: TeamFooterProps) {
  return (
    <div className="bg-blue-600 text-white py-2 px-4 flex items-center justify-between border-t border-blue-700">
      <div className="flex items-center space-x-4">
        <span className="text-sm">
          <span className="font-bold">チーム</span>
        </span>
        <span className="text-sm">
          <span className="font-bold">計 {totalSales.toLocaleString()}</span> 万円{' '}
          <span className="text-blue-200">({achievementRate}%)</span>
        </span>
      </div>
    </div>
  );
}
