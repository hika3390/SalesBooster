'use client';

import React, { useState } from 'react';

type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';
type PeriodUnit = '月' | '週' | '日';

interface FilterBarProps {
  onViewChange?: (view: ViewType) => void;
}

export default function FilterBar({ onViewChange }: FilterBarProps = {}) {
  const [selectedView, setSelectedView] = useState<ViewType>('期間グラフ');
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('月');
  const [periodType, setPeriodType] = useState<'単月' | '期間'>('単月');
  const [startMonth, setStartMonth] = useState('2025年07月');
  const [endMonth, setEndMonth] = useState('2025年01月');

  // 日付を統一管理
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 1)); // 2025年12月

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // 前へ移動（単位に応じて）
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    switch (periodUnit) {
      case '月':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case '週':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case '日':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    setSelectedDate(newDate);
  };

  // 次へ移動（単位に応じて）
  const goToNext = () => {
    const newDate = new Date(selectedDate);
    switch (periodUnit) {
      case '月':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case '週':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case '日':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    setSelectedDate(newDate);
  };

  // 今日/今週/今月に戻る
  const goToCurrent = () => {
    setSelectedDate(new Date());
  };

  // 現在のボタンラベル取得
  const getCurrentLabel = (): string => {
    switch (periodUnit) {
      case '月':
        return '今月';
      case '週':
        return '今週';
      case '日':
        return '今日';
    }
  };

  // 日付表示フォーマット
  const formatDate = (): string => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    switch (periodUnit) {
      case '月':
        return `${year}年${String(month).padStart(2, '0')}月`;
      case '週': {
        // 週の開始日（月曜日）を計算
        const dayOfWeek = selectedDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(selectedDate);
        monday.setDate(selectedDate.getDate() + mondayOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const startStr = `${monday.getMonth() + 1}/${monday.getDate()}`;
        const endStr = `${sunday.getMonth() + 1}/${sunday.getDate()}`;
        return `${year}年 ${startStr}〜${endStr}`;
      }
      case '日':
        return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
    }
  };

  // ドロップダウン用の選択肢を生成
  const generateDateOptions = () => {
    const options: string[] = [];

    switch (periodUnit) {
      case '月': {
        // 2024年1月から2026年12月まで
        for (let year = 2024; year <= 2026; year++) {
          for (let month = 1; month <= 12; month++) {
            options.push(`${year}年${String(month).padStart(2, '0')}月`);
          }
        }
        break;
      }
      case '週': {
        // 現在の前後6ヶ月の週を生成
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        // 月曜日に調整
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + mondayOffset);

        for (let i = 0; i < 52; i++) {
          const monday = new Date(startDate);
          monday.setDate(startDate.getDate() + (i * 7));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          const year = monday.getFullYear();
          const startStr = `${monday.getMonth() + 1}/${monday.getDate()}`;
          const endStr = `${sunday.getMonth() + 1}/${sunday.getDate()}`;
          options.push(`${year}年 ${startStr}〜${endStr}`);
        }
        break;
      }
      case '日': {
        // 現在の前後3ヶ月の日を生成
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);

        for (let i = 0; i < 90; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          options.push(`${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`);
        }
        break;
      }
    }

    return options;
  };

  // ドロップダウンの値が変更された時
  const handleDateChange = (value: string) => {
    switch (periodUnit) {
      case '月': {
        const match = value.match(/(\d+)年(\d+)月/);
        if (match) {
          setSelectedDate(new Date(parseInt(match[1]), parseInt(match[2]) - 1, 1));
        }
        break;
      }
      case '週': {
        const match = value.match(/(\d+)年\s*(\d+)\/(\d+)/);
        if (match) {
          setSelectedDate(new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])));
        }
        break;
      }
      case '日': {
        const match = value.match(/(\d+)年(\d+)月(\d+)日/);
        if (match) {
          setSelectedDate(new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])));
        }
        break;
      }
    }
  };

  const viewTabs: ViewType[] = ['期間グラフ', '累計グラフ', '推移グラフ', 'レポート', 'レコード'];
  const periodUnits: PeriodUnit[] = ['月', '週', '日'];

  // 累計グラフまたは推移グラフの場合は期間選択を表示
  const isCumulativeView = selectedView === '累計グラフ';
  const isTrendView = selectedView === '推移グラフ';
  const showPeriodSelection = isCumulativeView || isTrendView;

  const dateOptions = generateDateOptions();
  const currentDateStr = formatDate();

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      {/* 1段目: グループとメンバー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
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

          {/* グラフアイコンタブ */}
          <div className="flex items-center space-x-1">
            {/* 棒グラフアイコン */}
            <button className="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 20h4V10H4v10zm6 0h4V4h-4v16zm6 0h4v-8h-4v8z"/>
              </svg>
            </button>
            {/* 折れ線グラフアイコン */}
            <button className="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
              </svg>
            </button>
            {/* テーブルアイコン */}
            <button className="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v18H3V3zm2 2v4h6V5H5zm8 0v4h6V5h-6zM5 11v4h6v-4H5zm8 0v4h6v-4h-6zM5 17v2h6v-2H5zm8 0v2h6v-2h-6z"/>
              </svg>
            </button>
            {/* 複合グラフアイコン */}
            <button className="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 20h4v-6H4v6zm6 0h4V8h-4v12zm6 0h4v-4h-4v4z"/>
                <path fill="none" stroke="currentColor" strokeWidth={2} d="M2 16l5-5 4 4 6-6 5 5"/>
              </svg>
            </button>
            {/* ダッシュボードアイコン */}
            <button className="p-2 hover:bg-gray-200 rounded border border-gray-300 bg-white">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v10H3V3zm10 0h8v6h-8V3zM3 15h8v6H3v-6zm10-4h8v10h-8V11z"/>
              </svg>
            </button>
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

            {/* 月/週/日 切り替えボタン */}
            <div className="flex items-center border border-gray-300 rounded bg-white">
              {periodUnits.map((unit, index) => (
                <button
                  key={unit}
                  className={`px-3 py-1 text-sm ${index > 0 ? 'border-l border-gray-300' : ''} ${
                    periodUnit === unit ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setPeriodUnit(unit)}
                >
                  {unit}
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
              /* その他のグラフ用: 前/今/次ナビゲーション */
              <div className="flex items-center space-x-2">
                {/* 前へボタン */}
                <button
                  className="p-1 hover:bg-gray-200 rounded border border-gray-300 bg-white"
                  onClick={goToPrevious}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* 今月/今週/今日ボタン */}
                <button
                  className="px-3 py-1 text-sm border border-gray-300 rounded bg-white hover:bg-gray-100"
                  onClick={goToCurrent}
                >
                  {getCurrentLabel()}
                </button>

                {/* 次へボタン */}
                <button
                  className="p-1 hover:bg-gray-200 rounded border border-gray-300 bg-white"
                  onClick={goToNext}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 日付選択ドロップダウン */}
                <select
                  className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
                  value={currentDateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                >
                  {dateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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
