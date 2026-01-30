'use client';

import { useState, useEffect } from 'react';
import GroupMemberSelector from './filter/GroupMemberSelector';
import GraphIconTabs from './filter/GraphIconTabs';
import ViewTabs from './filter/ViewTabs';
import PeriodUnitToggle from './filter/PeriodUnitToggle';
import PeriodNavigator, { PeriodSelection } from './filter/PeriodNavigator';
import { ViewType, PeriodUnit } from '@/types';

interface FilterBarProps {
  onViewChange?: (view: ViewType) => void;
  onFilterChange?: (filter: { groupId: string; memberId: string }) => void;
  onPeriodChange?: (period: PeriodSelection) => void;
}

export interface DateRange {
  minDate: string;
  maxDate: string;
}

export default function FilterBar({ onViewChange, onFilterChange, onPeriodChange }: FilterBarProps = {}) {
  const [selectedView, setSelectedView] = useState<ViewType>('期間グラフ');
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('月');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    fetch('/api/sales/date-range')
      .then((res) => res.ok ? res.json() : null)
      .then(setDateRange)
      .catch(() => setDateRange(null));
  }, []);

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const showPeriodSelection = selectedView === '累計グラフ' || selectedView === '推移グラフ';

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      {/* 1段目: グループとメンバー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <GroupMemberSelector onFilterChange={onFilterChange} />
          <GraphIconTabs />
        </div>
      </div>

      {/* 2段目: グラフ種類選択とその他のコントロール */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ViewTabs selectedView={selectedView} onViewChange={handleViewChange} />
            <PeriodUnitToggle periodUnit={periodUnit} onPeriodUnitChange={setPeriodUnit} />
            <PeriodNavigator periodUnit={periodUnit} showPeriodSelection={showPeriodSelection} dateRange={dateRange} onPeriodChange={onPeriodChange} />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>前1年同期と表示</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input type="checkbox" className="rounded" />
              <span>日別内訳グラフを表示</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
