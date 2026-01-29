'use client';

import { useState } from 'react';
import GroupMemberSelector from './filter/GroupMemberSelector';
import GraphIconTabs from './filter/GraphIconTabs';
import ViewTabs from './filter/ViewTabs';
import PeriodUnitToggle from './filter/PeriodUnitToggle';
import PeriodNavigator from './filter/PeriodNavigator';

type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';
type PeriodUnit = '月' | '週' | '日';

interface FilterBarProps {
  onViewChange?: (view: ViewType) => void;
}

export default function FilterBar({ onViewChange }: FilterBarProps = {}) {
  const [selectedView, setSelectedView] = useState<ViewType>('期間グラフ');
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('月');

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
          <GroupMemberSelector />
          <GraphIconTabs />
        </div>
      </div>

      {/* 2段目: グラフ種類選択とその他のコントロール */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ViewTabs selectedView={selectedView} onViewChange={handleViewChange} />
            <PeriodUnitToggle periodUnit={periodUnit} onPeriodUnitChange={setPeriodUnit} />
            <PeriodNavigator periodUnit={periodUnit} showPeriodSelection={showPeriodSelection} />
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
