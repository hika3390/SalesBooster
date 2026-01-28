'use client';

import React from 'react';
import PerformanceLabels from './PerformanceLabels';
import AverageTargetLine from './AverageTargetLine';
import SalesBar from './SalesBar';
import SalesPersonCard from './SalesPersonCard';
import TeamFooter from './TeamFooter';
import { COLUMN_WIDTH } from '../constants/chart';

interface SalesPerson {
  rank: number;
  name: string;
  sales: number;
  target: number;
  achievement: number;
  imageUrl?: string;
  department?: string;
}

interface SalesPerformanceProps {
  salesData: SalesPerson[];
}

export default function SalesPerformance({ salesData }: SalesPerformanceProps) {
  // 目標平均の計算
  const averageTarget = 52;

  // 最大売上の取得（グラフの高さ調整用）
  const maxSales = Math.max(...salesData.map(person => person.sales));

  // TOP 20%, CENTER, LOW 20%の境界を計算
  const top20Index = Math.ceil(salesData.length * 0.2);
  const low20Index = Math.floor(salesData.length * 0.8);

  // 各カラムの固定幅
  const columnWidth = COLUMN_WIDTH;

  // チーム合計の計算
  const totalSales = salesData.reduce((sum, person) => sum + person.sales, 0);
  const achievementRate = 51; // 固定値（実際には計算する）

  return (
    <div className="bg-white mx-6 my-4 shadow-sm overflow-x-auto">
      <div style={{ minWidth: 'fit-content' }}>
        {/* グラフエリア */}
        <div className="relative py-6" style={{ height: '500px' }}>
          {/* ラベル表示 */}
          <PerformanceLabels />

          {/* 目標平均ライン */}
          <AverageTargetLine averageTarget={averageTarget} maxSales={maxSales} />

          {/* グラフバー */}
          <div className="absolute bottom-0 left-0 right-0 h-[400px] px-1">
            <div className="relative h-full flex gap-1">
              {salesData.map((person, index) => (
                <SalesBar
                  key={index}
                  person={person}
                  index={index}
                  maxSales={maxSales}
                  top20Index={top20Index}
                  columnWidth={columnWidth}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 営業マンリスト */}
        <div className="border-t border-gray-200">
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

        {/* フッター */}
        <TeamFooter totalSales={totalSales} achievementRate={achievementRate} />
      </div>
    </div>
  );
}
