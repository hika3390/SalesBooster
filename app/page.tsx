'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import SalesPerformance from '@/components/SalesPerformance';
import CumulativeChart from '@/components/CumulativeChart';
import TrendChart from '@/components/TrendChart';
import SalesInputModal from '@/components/SalesInputModal';
import { SalesPerson, ViewType } from '@/types';
import { useSalesPolling } from '@/hooks/useSalesPolling';

interface TrendData {
  month: string;
  sales: number;
  displayMonth: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('期間グラフ');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesData, setSalesData] = useState<SalesPerson[]>([]);
  const [cumulativeSalesData, setCumulativeSalesData] = useState<SalesPerson[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState<{ groupId: string; memberId: string }>({ groupId: '', memberId: '' });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);

  const fetchDataImmediate = useCallback(async () => {
    try {
      const filterParams = new URLSearchParams();
      if (filter.memberId) filterParams.set('memberId', filter.memberId);
      else if (filter.groupId) filterParams.set('groupId', filter.groupId);
      const filterQuery = filterParams.toString() ? `&${filterParams.toString()}` : '';

      const [salesRes, cumulativeRes, trendRes] = await Promise.all([
        fetch(`/api/sales?year=${year}&month=${month}${filterQuery}`),
        fetch(`/api/sales/cumulative?year=${year}&startMonth=1&endMonth=${month}${filterQuery}`),
        fetch(`/api/sales/trend?year=${year}&months=12${filterQuery}`),
      ]);

      if (salesRes.ok) setSalesData(await salesRes.json());
      if (cumulativeRes.ok) setCumulativeSalesData(await cumulativeRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setInitialLoading(false);
    }
  }, [year, month, filter]);

  // デバウンス付きfetchData: 短時間の連続呼び出しを1回にまとめる
  const fetchData = useCallback(() => {
    if (fetchingRef.current) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

    fetchTimerRef.current = setTimeout(async () => {
      fetchingRef.current = true;
      try {
        await fetchDataImmediate();
      } finally {
        fetchingRef.current = false;
      }
    }, 100);
  }, [fetchDataImmediate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ポーリングによるリアルタイム更新
  useSalesPolling({ onUpdate: fetchData });

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleAddSalesClick = () => {
    setIsSalesModalOpen(true);
  };

  const handleSalesModalClose = () => {
    setIsSalesModalOpen(false);
  };

  const handleSalesSubmit = async () => {
    // 送信元は即時反映
    fetchData();
  };

  const isDataEmpty =
    (currentView === '期間グラフ' && salesData.length === 0) ||
    (currentView === '累計グラフ' && cumulativeSalesData.length === 0) ||
    (currentView === '推移グラフ' && trendData.every((d) => d.sales === 0));

  const emptyMessage = (
    <div className="mx-6 my-4 p-12 bg-white rounded shadow-sm text-center">
      <div className="text-gray-400 text-lg mb-2">該当する売上データがありません</div>
      <div className="text-gray-400 text-sm">フィルター条件を変更してください</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onAddSalesClick={handleAddSalesClick} />
      <FilterBar onViewChange={handleViewChange} onFilterChange={setFilter} />

      <main className="w-full">
        {initialLoading ? (
          <div className="mx-6 my-4 p-8 bg-white rounded shadow-sm text-center text-gray-500">
            データを読み込み中...
          </div>
        ) : isDataEmpty ? (
          emptyMessage
        ) : currentView === '累計グラフ' ? (
          <CumulativeChart salesData={cumulativeSalesData} />
        ) : currentView === '期間グラフ' ? (
          <SalesPerformance salesData={salesData} />
        ) : currentView === '推移グラフ' ? (
          <TrendChart monthlyData={trendData} />
        ) : (
          <div className="mx-6 my-4 p-8 bg-white rounded shadow-sm text-center text-gray-500">
            {currentView}の表示は準備中です
          </div>
        )}
      </main>

      {/* 売上入力モーダル */}
      <SalesInputModal
        isOpen={isSalesModalOpen}
        onClose={handleSalesModalClose}
        onSubmit={handleSalesSubmit}
      />
    </div>
  );
}
