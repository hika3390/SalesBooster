'use client';

import { ReportData } from '@/types';
import TrendBarChart from './TrendBarChart';
import CumulativeTrendChart from './CumulativeTrendChart';
import PieChart from './PieChart';
import StatsPanel from './StatsPanel';

interface ReportViewProps {
  reportData: ReportData;
}

export default function ReportView({ reportData }: ReportViewProps) {
  const dayOfWeekPieData = reportData.dayOfWeekRatio.map((d) => ({
    name: d.day,
    value: d.amount,
    ratio: d.ratio,
  }));

  const periodPieData = reportData.periodRatio.map((d) => ({
    name: d.period,
    value: d.amount,
    ratio: d.ratio,
  }));

  return (
    <div className="mx-6 my-4">
      <div className="grid grid-cols-3 gap-4">
        {/* 上段 */}
        <TrendBarChart data={reportData.monthlyTrend} />
        <CumulativeTrendChart data={reportData.cumulativeTrend} />
        <StatsPanel stats={reportData.stats} />
        {/* 下段 */}
        <PieChart data={dayOfWeekPieData} title="曜日 比率" />
        <PieChart data={periodPieData} title="前中後 比率" />
      </div>
    </div>
  );
}
