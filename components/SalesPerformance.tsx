'use client';

import React, { useRef, useState, useEffect } from 'react';
import PerformanceLabels from './PerformanceLabels';
import AverageTargetLine from './AverageTargetLine';
import SalesBar from './SalesBar';
import SalesPersonCard from './SalesPersonCard';
import TeamFooter from './TeamFooter';
import ContractBanner from './ContractBanner';
import { COLUMN_WIDTH } from '../constants/chart';
import { SalesPerson } from '@/types';

interface SalesPerformanceProps {
  salesData: SalesPerson[];
}

export default function SalesPerformance({ salesData }: SalesPerformanceProps) {
  const prevDataRef = useRef<SalesPerson[]>([]);
  const [changedNames, setChangedNames] = useState<Set<string>>(new Set());
  const [bannerNames, setBannerNames] = useState<string[]>([]);

  useEffect(() => {
    const prev = prevDataRef.current;
    prevDataRef.current = salesData;

    if (prev.length > 0) {
      const changed = new Set<string>();
      for (const person of salesData) {
        const prevPerson = prev.find((p) => p.name === person.name);
        if (prevPerson && prevPerson.sales !== person.sales) {
          changed.add(person.name);
        }
      }
      if (changed.size > 0) {
        setChangedNames(changed);
        setBannerNames(Array.from(changed));
        const timer = setTimeout(() => {
          setChangedNames(new Set());
          setBannerNames([]);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [salesData]);
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
    <div className="bg-white mx-6 my-4 shadow-sm overflow-x-auto relative">
      {/* 契約速報バナー */}
      <ContractBanner names={bannerNames} />

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
                  key={person.name}
                  person={person}
                  index={index}
                  maxSales={maxSales}
                  top20Index={top20Index}
                  columnWidth={columnWidth}
                  changed={changedNames.has(person.name)}
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
                key={person.name}
                person={person}
                index={index}
                top20Index={top20Index}
                low20Index={low20Index}
                columnWidth={columnWidth}
                changed={changedNames.has(person.name)}
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
