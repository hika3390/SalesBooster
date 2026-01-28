'use client';

import React, { useState } from 'react';

type PeriodUnit = '月' | '週' | '日';

interface PeriodNavigatorProps {
  periodUnit: PeriodUnit;
  showPeriodSelection: boolean;
}

export default function PeriodNavigator({ periodUnit, showPeriodSelection }: PeriodNavigatorProps) {
  const [periodType, setPeriodType] = useState<'単月' | '期間'>('単月');
  const [startMonth, setStartMonth] = useState('2025年07月');
  const [endMonth, setEndMonth] = useState('2025年01月');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 1));

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

  const goToCurrent = () => {
    setSelectedDate(new Date());
  };

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

  const formatDate = (): string => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    switch (periodUnit) {
      case '月':
        return `${year}年${String(month).padStart(2, '0')}月`;
      case '週': {
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

  const generateDateOptions = () => {
    const options: string[] = [];

    switch (periodUnit) {
      case '月': {
        for (let year = 2024; year <= 2026; year++) {
          for (let month = 1; month <= 12; month++) {
            options.push(`${year}年${String(month).padStart(2, '0')}月`);
          }
        }
        break;
      }
      case '週': {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
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

  const dateOptions = generateDateOptions();
  const currentDateStr = formatDate();

  if (showPeriodSelection) {
    return (
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
          <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
            <option>2025年12月</option>
            <option>2025年11月</option>
            <option>2025年10月</option>
          </select>
        )}
      </div>
    );
  }

  return (
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
  );
}
