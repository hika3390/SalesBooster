'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import SalesPerformance from '@/components/SalesPerformance';
import CumulativeChart from '@/components/CumulativeChart';
import TrendChart from '@/components/TrendChart';
import SalesInputModal from '@/components/SalesInputModal';
import { SalesPerson, ViewType } from '@/types';

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
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, cumulativeRes, trendRes] = await Promise.all([
        fetch(`/api/sales?year=${year}&month=${month}`),
        fetch(`/api/sales/cumulative?year=${year}&startMonth=1&endMonth=${month}`),
        fetch(`/api/sales/trend?year=${year}&months=12`),
      ]);

      if (salesRes.ok) setSalesData(await salesRes.json());
      if (cumulativeRes.ok) setCumulativeSalesData(await cumulativeRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    // 売上登録後にダッシュボードデータを再取得
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onAddSalesClick={handleAddSalesClick} />
      <FilterBar onViewChange={handleViewChange} />

      <main className="w-full">
        {loading ? (
          <div className="mx-6 my-4 p-8 bg-white rounded shadow-sm text-center text-gray-500">
            データを読み込み中...
          </div>
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
