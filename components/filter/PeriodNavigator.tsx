'use client';

import { useState, useEffect, useMemo } from 'react';
import { PeriodUnit } from '@/types';
import { DateRange } from '../FilterBar';

export interface PeriodSelection {
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

interface PeriodNavigatorProps {
  periodUnit: PeriodUnit;
  showPeriodSelection: boolean;
  dateRange: DateRange | null;
  onPeriodChange?: (period: PeriodSelection) => void;
}

export default function PeriodNavigator({ periodUnit, showPeriodSelection, dateRange, onPeriodChange }: PeriodNavigatorProps) {
  const [periodType, setPeriodType] = useState<'単月' | '期間'>('単月');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // dateRangeをDateオブジェクトに変換
  const minDate = useMemo(() => dateRange ? new Date(dateRange.minDate) : null, [dateRange]);
  const maxDate = useMemo(() => dateRange ? new Date(dateRange.maxDate) : null, [dateRange]);

  // dateRangeが読み込まれたら、初期選択を最大日の月に設定
  useEffect(() => {
    if (maxDate) {
      setSelectedDate(new Date(maxDate));
      const label = formatMonthLabel(maxDate.getFullYear(), maxDate.getMonth() + 1);
      setStartMonth(label);
      setEndMonth(label);
    }
  }, [dateRange]);

  // 選択期間が変わったら親に通知
  useEffect(() => {
    if (!onPeriodChange) return;

    if (showPeriodSelection && periodType === '期間') {
      // 期間選択モード: startMonth〜endMonthを解決
      const startMatch = startMonth.match(/(\d+)年(\d+)月/);
      const endMatch = endMonth.match(/(\d+)年(\d+)月/);
      if (startMatch && endMatch) {
        const s = new Date(parseInt(startMatch[1]), parseInt(startMatch[2]) - 1, 1);
        const e = new Date(parseInt(endMatch[1]), parseInt(endMatch[2]), 0, 23, 59, 59);
        onPeriodChange({ startDate: s.toISOString(), endDate: e.toISOString() });
      }
      return;
    }

    // 通常モード: selectedDate + periodUnit で範囲を算出
    let start: Date;
    let end: Date;
    switch (periodUnit) {
      case '月':
        start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
        break;
      case '週': {
        const dayOfWeek = selectedDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() + mondayOffset);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case '日':
        start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        break;
    }
    onPeriodChange({ startDate: start.toISOString(), endDate: end.toISOString() });
  }, [selectedDate, periodUnit, showPeriodSelection, periodType, startMonth, endMonth]);

  const formatMonthLabel = (year: number, month: number) => {
    return `${year}年${String(month).padStart(2, '0')}月`;
  };

  // 前へ移動可能か判定
  const canGoPrevious = (): boolean => {
    if (!minDate) return true;
    switch (periodUnit) {
      case '月': {
        // 前月の末日がminDate以降であれば移動可
        const prevMonthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0);
        return prevMonthEnd >= minDate;
      }
      case '週': {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 7);
        return prevDate >= minDate;
      }
      case '日': {
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        return prevDate >= minDate;
      }
    }
  };

  // 次へ移動可能か判定
  const canGoNext = (): boolean => {
    if (!maxDate) return true;
    switch (periodUnit) {
      case '月': {
        // 次月の1日がmaxDate以前であれば移動可
        const nextMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        return nextMonthStart <= maxDate;
      }
      case '週': {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 7);
        return nextDate <= maxDate;
      }
      case '日': {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        return nextDate <= maxDate;
      }
    }
  };

  const goToPrevious = () => {
    if (!canGoPrevious()) return;
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
    if (!canGoNext()) return;
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
    const today = new Date();
    // dateRangeの範囲内にクランプ
    if (maxDate && today > maxDate) {
      setSelectedDate(new Date(maxDate));
    } else if (minDate && today < minDate) {
      setSelectedDate(new Date(minDate));
    } else {
      setSelectedDate(today);
    }
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
        return formatMonthLabel(year, month);
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

  // 月選択用のオプションを生成
  const generateMonthOptions = (): string[] => {
    if (!minDate || !maxDate) return [];
    const options: string[] = [];
    const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    while (cursor <= end) {
      options.push(formatMonthLabel(cursor.getFullYear(), cursor.getMonth() + 1));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return options;
  };

  const generateDateOptions = () => {
    const options: string[] = [];
    if (!minDate || !maxDate) return options;

    switch (periodUnit) {
      case '月': {
        return generateMonthOptions();
      }
      case '週': {
        const startDate = new Date(minDate);
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + mondayOffset);

        const cursor = new Date(startDate);
        while (cursor <= maxDate) {
          const monday = new Date(cursor);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);

          const year = monday.getFullYear();
          const startStr = `${monday.getMonth() + 1}/${monday.getDate()}`;
          const endStr = `${sunday.getMonth() + 1}/${sunday.getDate()}`;
          options.push(`${year}年 ${startStr}〜${endStr}`);
          cursor.setDate(cursor.getDate() + 7);
        }
        break;
      }
      case '日': {
        const cursor = new Date(minDate);
        while (cursor <= maxDate) {
          const year = cursor.getFullYear();
          const month = cursor.getMonth() + 1;
          const day = cursor.getDate();
          options.push(`${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`);
          cursor.setDate(cursor.getDate() + 1);
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
  const monthOptions = generateMonthOptions();

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
              {monthOptions.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">〜</span>
            <select
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
            >
              {monthOptions.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </>
        ) : (
          <select
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            value={formatMonthLabel(selectedDate.getFullYear(), selectedDate.getMonth() + 1)}
            onChange={(e) => handleDateChange(e.target.value)}
          >
            {monthOptions.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 前へボタン */}
      <button
        className={`p-1 rounded border border-gray-300 ${canGoPrevious() ? 'hover:bg-gray-200 bg-white' : 'bg-gray-100 cursor-not-allowed opacity-50'}`}
        onClick={goToPrevious}
        disabled={!canGoPrevious()}
      >
        <svg className={`w-5 h-5 ${canGoPrevious() ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className={`p-1 rounded border border-gray-300 ${canGoNext() ? 'hover:bg-gray-200 bg-white' : 'bg-gray-100 cursor-not-allowed opacity-50'}`}
        onClick={goToNext}
        disabled={!canGoNext()}
      >
        <svg className={`w-5 h-5 ${canGoNext() ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
