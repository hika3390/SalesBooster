'use client';

import React from 'react';

type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';

interface ViewTabsProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewTabs: ViewType[] = ['期間グラフ', '累計グラフ', '推移グラフ', 'レポート', 'レコード'];

export default function ViewTabs({ selectedView, onViewChange }: ViewTabsProps) {
  return (
    <div className="flex items-center border border-gray-300 rounded bg-white">
      {viewTabs.map((view, index) => (
        <button
          key={view}
          className={`px-4 py-1 text-sm ${index > 0 ? 'border-l border-gray-300' : ''} ${
            selectedView === view ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onViewChange(view)}
        >
          {view}
        </button>
      ))}
    </div>
  );
}
