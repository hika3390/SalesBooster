'use client';

import React, { useState } from 'react';

type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';

interface FilterBarProps {
  onViewChange?: (view: ViewType) => void;
}

export default function FilterBar({ onViewChange }: FilterBarProps = {}) {
  const [selectedView, setSelectedView] = useState<ViewType>('期間グラフ');
  const [selectedDate, setSelectedDate] = useState('2025年12月');
  const [periodType, setPeriodType] = useState<'単月' | '期間'>('単月');
  const [startMonth, setStartMonth] = useState('2025年07月');
  const [endMonth, setEndMonth] = useState('2025年01月');

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const viewTabs: ViewType[] = ['期間グラフ', '累計グラフ', '推移グラフ', 'レポート', 'レコード'];

  // 累計グラフまたは推移グラフの場合は期間選択を表示
  const isCumulativeView = selectedView === '累計グラフ';
  const isTrendView = selectedView === '推移グラフ';
  const showPeriodSelection = isCumulativeView || isTrendView;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      {/* 1段目: グループとメンバー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* グループ選択 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">グループ</label>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
              <option>&lt;3Aグループ&gt;支店1</option>
              <option>グループ2</option>
              <option>グループ3</option>
            </select>
          </div>

          {/* メンバー/グループ全員 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">メンバー</label>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
              <option>グループ全員</option>
              <option>メンバー1</option>
              <option>メンバー2</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2段目: グラフ種類選択とその他のコントロール */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* グラフ種類選択 */}
            <div className="flex items-center border border-gray-300 rounded bg-white">
              {viewTabs.map((view, index) => (
                <button
                  key={view}
                  className={`px-4 py-1 text-sm ${index > 0 ? 'border-l border-gray-300' : ''} ${
                    selectedView === view ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleViewChange(view)}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* 期間コントロール */}
            {showPeriodSelection ? (
              /* 累計グラフ・推移グラフ用: 期間範囲選択 */
              <div className="flex items-center space-x-2">
                {/* 期間タイプ選択 */}
                <div className="flex items-center border border-gray-300 rounded bg-white">
                  <button
                    className={`px-3 py-1 text-sm ${periodType === '単月' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setPeriodType('単月')}
                  >
                    単月
                  </button>
                  <button
                    className={`px-3 py-1 text-sm border-l border-gray-300 ${periodType === '期間' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setPeriodType('期間')}
                  >
                    期間
                  </button>
                </div>

                {periodType === '期間' ? (
                  /* 期間選択モード */
                  <>
                    <select
                      className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                    >
                      <option>2025年07月</option>
                      <option>2025年08月</option>
                      <option>2025年09月</option>
                      <option>2025年10月</option>
                      <option>2025年11月</option>
                      <option>2025年12月</option>
                      <option>2026年01月</option>
                    </select>
                    <span className="text-sm text-gray-600">〜</span>
                    <select
                      className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                    >
                      <option>2025年07月</option>
                      <option>2025年08月</option>
                      <option>2025年09月</option>
                      <option>2025年10月</option>
                      <option>2025年11月</option>
                      <option>2025年12月</option>
                      <option>2026年01月</option>
                    </select>
                  </>
                ) : (
                  /* 単月選択モード */
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
                    <option>2025年12月</option>
                    <option>2025年11月</option>
                    <option>2025年10月</option>
                  </select>
                )}
              </div>
            ) : (
              /* その他のグラフ用: 通常の月選択 */
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* 今月ボタン */}
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                  今月
                </button>

                <button className="p-1 hover:bg-gray-200 rounded">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 日付表示 */}
                <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
                  <option>2025年12月</option>
                  <option>2025年11月</option>
                  <option>2025年10月</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* チェックボックス */}
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
