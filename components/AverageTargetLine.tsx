'use client';

import React from 'react';

interface AverageTargetLineProps {
  averageTarget: number;
  maxSales: number;
}

export default function AverageTargetLine({ averageTarget, maxSales }: AverageTargetLineProps) {
  return (
    <div
      className="absolute left-0 right-0 border-t-2 border-orange-500 z-10"
      style={{ top: `${55 + (1 - averageTarget / maxSales) * 35}%` }}
    >
      <div className="absolute left-2 -top-3 text-xs text-orange-600 bg-white px-1">
        前目平均
      </div>
      <div className="absolute left-2 top-1 text-xs font-bold text-orange-600 bg-white px-1">
        {averageTarget}
      </div>
    </div>
  );
}
