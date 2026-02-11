'use client';

import React from 'react';
import SalesBar from './SalesBar';
import SalesPersonCard from './SalesPersonCard';
import { COLUMN_WIDTH } from '../constants/chart';
import { SalesPerson } from '@/types';

interface CumulativeChartProps {
  salesData: SalesPerson[];
  darkMode?: boolean;
}

export default function CumulativeChart({ salesData, darkMode = false }: CumulativeChartProps) {
  // 最大売上の取得（グラフの高さ調整用）
  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(person => person.sales)) : 0;

  // TOP 20%, CENTER, LOW 20%の境界を計算
  const top20Index = Math.ceil(salesData.length * 0.2);
  const low20Index = Math.floor(salesData.length * 0.8);

  // 各カラムの固定幅
  const columnWidth = COLUMN_WIDTH;

  return (
    <div className={`mx-6 my-4 shadow-sm overflow-x-auto h-[calc(100%-2rem)] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex-1 min-h-0 flex flex-col" style={{ minWidth: 'fit-content' }}>
        {/* グラフエリア */}
        <div className="relative py-6 flex-1 min-h-0">
          {/* ラベル表示 */}
          <div className="absolute top-4 left-0 right-0 flex justify-between px-12">
            <div className="text-xs text-blue-600 bg-blue-50 border border-blue-400 px-3 py-1">
              TOP 20%
            </div>
            <div className="text-xs text-gray-600 bg-gray-100 border border-gray-400 px-3 py-1">
              CENTER
            </div>
            <div className="text-xs text-orange-600 bg-orange-50 border border-orange-400 px-3 py-1">
              LOW 20%
            </div>
          </div>

          {/* グラフバー */}
          <div className="absolute bottom-0 left-0 right-0 top-20 px-1">
            <div className="relative h-full flex gap-1">
              {salesData.map((person, index) => (
                <SalesBar
                  key={person.name}
                  person={person}
                  index={index}
                  maxSales={maxSales}
                  top20Index={top20Index}
                  low20Index={low20Index}
                  columnWidth={columnWidth}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 営業マンリスト */}
        <div className={`border-t shrink-0 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex px-1 gap-1">
            {salesData.map((person, index) => (
              <SalesPersonCard
                key={index}
                person={person}
                index={index}
                top20Index={top20Index}
                low20Index={low20Index}
                columnWidth={columnWidth}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
