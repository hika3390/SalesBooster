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
import { PeriodSelection } from '@/components/filter/PeriodNavigator';

interface TrendData {
  month: string;
  sales: number;
  displayMonth: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('期間グラフ');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesData, setSalesData] = useState<SalesPerson[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [cumulativeSalesData, setCumulativeSalesData] = useState<SalesPerson[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ groupId: string; memberId: string }>({ groupId: '', memberId: '' });
  const [period, setPeriod] = useState<PeriodSelection | null>(null);

  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef(false);

  const fetchDataImmediate = useCallback(async () => {
    if (!period) return;

    try {
      const filterParams = new URLSearchParams();
      filterParams.set('startDate', period.startDate);
      filterParams.set('endDate', period.endDate);
      if (filter.memberId) filterParams.set('memberId', filter.memberId);
      else if (filter.groupId) filterParams.set('groupId', filter.groupId);
      const query = filterParams.toString();

      const [salesRes, cumulativeRes, trendRes] = await Promise.all([
        fetch(`/api/sales?${query}`),
        fetch(`/api/sales/cumulative?${query}`),
        fetch(`/api/sales/trend?${query}`),
      ]);

      if (salesRes.ok) {
        const salesJson = await salesRes.json();
        setSalesData(salesJson.data);
        setRecordCount(salesJson.recordCount);
      }
      if (cumulativeRes.ok) setCumulativeSalesData(await cumulativeRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [period, filter]);

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

  // フィルター/期間変更時: データをクリアしてローディング表示してからfetch（アニメーション抑制のため）
  useEffect(() => {
    setSalesData([]);
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // ポーリングによるリアルタイム更新（データクリアなし → アニメーション発火可能）
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
      <FilterBar onViewChange={handleViewChange} onFilterChange={setFilter} onPeriodChange={setPeriod} />

      <main className="w-full">
        {loading ? (
          <div className="mx-6 my-4 p-12 bg-white rounded shadow-sm flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="mt-3 text-sm text-gray-500">データを読み込み中...</div>
          </div>
        ) : isDataEmpty ? (
          emptyMessage
        ) : currentView === '累計グラフ' ? (
          <CumulativeChart salesData={cumulativeSalesData} />
        ) : currentView === '期間グラフ' ? (
          <SalesPerformance salesData={salesData} recordCount={recordCount} />
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
