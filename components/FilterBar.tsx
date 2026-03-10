'use client';

import { useState, useEffect } from 'react';
import GroupMemberSelector from './filter/GroupMemberSelector';
import GraphIconTabs from './filter/GraphIconTabs';
import ViewTabs from './filter/ViewTabs';
import PeriodUnitToggle from './filter/PeriodUnitToggle';
import PeriodNavigator, { PeriodSelection } from './filter/PeriodNavigator';
import { ViewType, PeriodUnit } from '@/types';
import type { DataTypeInfo } from '@/types';

interface FilterBarProps {
  onViewChange?: (view: ViewType) => void;
  onFilterChange?: (filter: { groupId: string; memberId: string }) => void;
  onPeriodChange?: (period: PeriodSelection) => void;
  onDataTypeChange?: (dataTypeId: string) => void;
}

export interface DateRange {
  minDate: string;
  maxDate: string;
}

export default function FilterBar({ onViewChange, onFilterChange, onPeriodChange, onDataTypeChange }: FilterBarProps = {}) {
  const [selectedView, setSelectedView] = useState<ViewType>('PERIOD_GRAPH');
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('月');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [dataTypes, setDataTypes] = useState<DataTypeInfo[]>([]);
  const [selectedDataTypeId, setSelectedDataTypeId] = useState('');

  useEffect(() => {
    fetch('/api/sales/date-range')
      .then((res) => res.ok ? res.json() : null)
      .then(setDateRange)
      .catch(() => setDateRange(null));

    fetch('/api/data-types?active=true')
      .then((res) => res.ok ? res.json() : [])
      .then((data: DataTypeInfo[]) => {
        setDataTypes(data);
        const defaultType = data.find((dt) => dt.isDefault);
        const initialId = defaultType ? String(defaultType.id) : data.length > 0 ? String(data[0].id) : '';
        setSelectedDataTypeId(initialId);
        if (onDataTypeChange && initialId) {
          onDataTypeChange(initialId);
        }
      })
      .catch(() => setDataTypes([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleDataTypeChange = (dtId: string) => {
    setSelectedDataTypeId(dtId);
    if (onDataTypeChange) {
      onDataTypeChange(dtId);
    }
  };

  const showPeriodSelection = selectedView === 'CUMULATIVE_GRAPH' || selectedView === 'TREND_GRAPH';
  const hidePeriodControls = selectedView === 'RECORD';

  return (
    <div className="hidden md:block bg-gray-50 border-b border-gray-200">
      {/* 1段目: グループとメンバー + データ種類 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GroupMemberSelector onFilterChange={onFilterChange} />
            {/* データ種類セレクタ */}
            {dataTypes.length > 1 && (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm text-gray-600">データ種類</span>
                <div className="flex gap-1">
                  {dataTypes.map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => handleDataTypeChange(String(dt.id))}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                        selectedDataTypeId === String(dt.id)
                          ? 'text-white border-transparent'
                          : 'text-gray-600 border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                      style={
                        selectedDataTypeId === String(dt.id)
                          ? { backgroundColor: dt.color || '#3B82F6' }
                          : undefined
                      }
                    >
                      {dt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <GraphIconTabs />
        </div>
      </div>

      {/* 2段目: グラフ種類選択とその他のコントロール */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ViewTabs selectedView={selectedView} onViewChange={handleViewChange} />
            {!hidePeriodControls && (
              <>
                <PeriodUnitToggle periodUnit={periodUnit} onPeriodUnitChange={setPeriodUnit} />
                <PeriodNavigator periodUnit={periodUnit} showPeriodSelection={showPeriodSelection} dateRange={dateRange} onPeriodChange={onPeriodChange} />
              </>
            )}
          </div>

          {!hidePeriodControls && (
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
          )}
        </div>
      </div>
    </div>
  );
}
