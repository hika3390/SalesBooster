'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { DisplayConfig } from '@/types/display';
import { SalesPerson, ReportData, RankingBoardData, TrendData } from '@/types';
import { useSalesPolling } from './useSalesPolling';

interface UseDisplayDataReturn {
  salesData: SalesPerson[];
  recordCount: number;
  cumulativeSalesData: SalesPerson[];
  trendData: TrendData[];
  reportData: ReportData | null;
  rankingData: RankingBoardData | null;
  loading: boolean;
}

function getCurrentMonthPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function useDisplayData(config: DisplayConfig): UseDisplayDataReturn {
  const [salesData, setSalesData] = useState<SalesPerson[]>([]);
  const [recordCount, setRecordCount] = useState(0);
  const [cumulativeSalesData, setCumulativeSalesData] = useState<SalesPerson[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [rankingData, setRankingData] = useState<RankingBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const periodRef = useRef(getCurrentMonthPeriod());

  const fetchAllData = useCallback(async () => {
    try {
      const period = getCurrentMonthPeriod();
      periodRef.current = period;

      const filterParams = new URLSearchParams();
      filterParams.set('startDate', period.startDate);
      filterParams.set('endDate', period.endDate);
      if (config.filter.memberId) filterParams.set('memberId', config.filter.memberId);
      else if (config.filter.groupId) filterParams.set('groupId', config.filter.groupId);
      const query = filterParams.toString();

      const rankingParams = new URLSearchParams();
      if (config.filter.memberId) rankingParams.set('memberId', config.filter.memberId);
      else if (config.filter.groupId) rankingParams.set('groupId', config.filter.groupId);

      const [salesRes, cumulativeRes, trendRes, reportRes, rankingRes] = await Promise.all([
        fetch(`/api/sales?${query}`),
        fetch(`/api/sales/cumulative?${query}`),
        fetch(`/api/sales/trend?${query}`),
        fetch(`/api/sales/report?${query}`),
        fetch(`/api/sales/ranking?${rankingParams.toString()}`),
      ]);

      if (salesRes.ok) {
        const salesJson = await salesRes.json();
        setSalesData(salesJson.data);
        setRecordCount(salesJson.recordCount);
      }
      if (cumulativeRes.ok) setCumulativeSalesData(await cumulativeRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
      if (reportRes.ok) setReportData(await reportRes.json());
      if (rankingRes.ok) setRankingData(await rankingRes.json());
    } catch (error) {
      console.error('Failed to fetch display data:', error);
    } finally {
      setLoading(false);
    }
  }, [config.filter]);

  // 初回データ取得
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ポーリング更新
  useSalesPolling({ onUpdate: fetchAllData, intervalMs: config.dataRefreshInterval });

  return {
    salesData,
    recordCount,
    cumulativeSalesData,
    trendData,
    reportData,
    rankingData,
    loading,
  };
}
