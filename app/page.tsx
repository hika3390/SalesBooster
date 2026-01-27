'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import SalesPerformance from '@/components/SalesPerformance';
import CumulativeChart from '@/components/CumulativeChart';
import TrendChart from '@/components/TrendChart';

type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';

// モックデータ - 期間グラフ用
const mockSalesData = [
  { rank: 1, name: '田中太郎', sales: 246, target: 100, achievement: 246, department: '本社' },
  { rank: 2, name: '佐藤花子', sales: 160, target: 100, achievement: 160, department: '本社' },
  { rank: 3, name: '鈴木一郎', sales: 136, target: 100, achievement: 136, department: '本社' },
  { rank: 4, name: '高橋美咲', sales: 135, target: 100, achievement: 135, department: '営業部' },
  { rank: 5, name: '渡辺健太', sales: 126, target: 100, achievement: 126, department: '営業部' },
  { rank: 6, name: '伊藤達也', sales: 95, target: 100, achievement: 95, department: '本社' },
  { rank: 7, name: '山本大輔', sales: 89, target: 100, achievement: 89, department: '本社' },
  { rank: 8, name: '中村悠介', sales: 86, target: 100, achievement: 86, department: '営業部' },
  { rank: 9, name: '小林誠', sales: 78, target: 100, achievement: 78, department: '本社' },
  { rank: 10, name: '加藤結衣', sales: 67, target: 100, achievement: 67, department: '本社' },
  { rank: 11, name: '吉田雄介', sales: 64, target: 100, achievement: 64, department: '営業部' },
  { rank: 12, name: '山田麻衣', sales: 59, target: 100, achievement: 59, department: '本社' },
  { rank: 13, name: '佐々木翔', sales: 54, target: 100, achievement: 54, department: '本社' },
  { rank: 14, name: '松本美穂', sales: 29, target: 100, achievement: 29, department: '本社' },
  { rank: 15, name: '井上拓海', sales: 0, target: 100, achievement: 0, department: '本社' },
  { rank: 16, name: '木村陽子', sales: 0, target: 100, achievement: 0, department: '本社' },
  { rank: 17, name: '林智也', sales: 0, target: 100, achievement: 0, department: '本社' },
  { rank: 18, name: '清水咲良', sales: 0, target: 100, achievement: 0, department: '本社' },
  { rank: 19, name: '山口健', sales: 0, target: 100, achievement: 0, department: '本社' },
  { rank: 20, name: '森田愛', sales: 0, target: 100, achievement: 0, department: '本社' },
];

// モックデータ - 累計グラフ用（2025年7月〜2026年1月の累計）
const mockCumulativeSalesData = [
  { rank: 1, name: '田中太郎', sales: 650, target: 300, achievement: 217, department: '本社' },
  { rank: 2, name: '佐藤花子', sales: 618, target: 300, achievement: 206, department: '本社' },
  { rank: 3, name: '鈴木一郎', sales: 612, target: 300, achievement: 204, department: '本社' },
  { rank: 4, name: '高橋美咲', sales: 559, target: 300, achievement: 186, department: '営業部' },
  { rank: 5, name: '渡辺健太', sales: 541, target: 300, achievement: 180, department: '営業部' },
  { rank: 6, name: '伊藤達也', sales: 525, target: 300, achievement: 175, department: '本社' },
  { rank: 7, name: '山本大輔', sales: 516, target: 300, achievement: 172, department: '本社' },
  { rank: 8, name: '中村悠介', sales: 510, target: 300, achievement: 170, department: '営業部' },
  { rank: 9, name: '小林誠', sales: 495, target: 300, achievement: 165, department: '本社' },
  { rank: 10, name: '加藤結衣', sales: 465, target: 300, achievement: 155, department: '本社' },
  { rank: 11, name: '吉田雄介', sales: 444, target: 300, achievement: 148, department: '営業部' },
  { rank: 12, name: '山田麻衣', sales: 433, target: 300, achievement: 144, department: '本社' },
  { rank: 13, name: '佐々木翔', sales: 425, target: 300, achievement: 142, department: '本社' },
  { rank: 14, name: '松本美穂', sales: 261, target: 300, achievement: 87, department: '本社' },
  { rank: 15, name: '井上拓海', sales: 253, target: 300, achievement: 84, department: '本社' },
  { rank: 16, name: '木村陽子', sales: 0, target: 300, achievement: 0, department: '本社' },
  { rank: 17, name: '林智也', sales: 0, target: 300, achievement: 0, department: '本社' },
  { rank: 18, name: '清水咲良', sales: 0, target: 300, achievement: 0, department: '本社' },
  { rank: 19, name: '山口健', sales: 0, target: 300, achievement: 0, department: '本社' },
  { rank: 20, name: '森田愛', sales: 0, target: 300, achievement: 0, department: '本社' },
];

// モックデータ - 推移グラフ用（月別推移）
const mockTrendData = [
  { month: '2025-01', sales: 1319, displayMonth: '10月' },
  { month: '2025-02', sales: 1663, displayMonth: '1月' },
  { month: '2025-03', sales: 1409, displayMonth: '6月' },
  { month: '2025-04', sales: 1593, displayMonth: '3月' },
  { month: '2025-05', sales: 1240, displayMonth: '12月' },
  { month: '2025-06', sales: 1532, displayMonth: '4月' },
  { month: '2025-07', sales: 1513, displayMonth: '5月' },
  { month: '2025-08', sales: 1394, displayMonth: '9月' },
  { month: '2025-09', sales: 1657, displayMonth: '2月' },
  { month: '2025-10', sales: 1242, displayMonth: '11月' },
  { month: '2025-11', sales: 1461, displayMonth: '6月' },
  { month: '2025-12', sales: 1430, displayMonth: '7月' },
  { month: '2026-01', sales: 0, displayMonth: '13月' },
];

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('期間グラフ');

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <FilterBar onViewChange={handleViewChange} />

      <main className="w-full">
        {currentView === '累計グラフ' ? (
          <CumulativeChart salesData={mockCumulativeSalesData} />
        ) : currentView === '期間グラフ' ? (
          <SalesPerformance salesData={mockSalesData} />
        ) : currentView === '推移グラフ' ? (
          <TrendChart monthlyData={mockTrendData} />
        ) : (
          <div className="mx-6 my-4 p-8 bg-white rounded shadow-sm text-center text-gray-500">
            {currentView}の表示は準備中です
          </div>
        )}
      </main>
    </div>
  );
}
