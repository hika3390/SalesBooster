'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DisplayConfig, DEFAULT_DISPLAY_CONFIG, TransitionType } from '@/types/display';
import { ViewType, VIEW_TYPE_LABELS } from '@/types';
import { useDisplayMode } from '@/hooks/useDisplayMode';
import { useDisplayData } from '@/hooks/useDisplayData';
import { useAutoHideCursor } from '@/hooks/useAutoHideCursor';
import SalesPerformance from '@/components/SalesPerformance';
import CumulativeChart from '@/components/CumulativeChart';
import TrendChart from '@/components/TrendChart';
import ReportView from '@/components/report/ReportView';
import RankingBoard from '@/components/record/RankingBoard';

export default function DisplayPage() {
  const router = useRouter();
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    fetch('/api/settings/display')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (!data.views || !Array.isArray(data.views)) {
          setConfig(DEFAULT_DISPLAY_CONFIG);
        } else {
          setConfig({ ...DEFAULT_DISPLAY_CONFIG, ...data });
        }
      })
      .catch(() => setConfig(DEFAULT_DISPLAY_CONFIG));
  }, []);

  if (!config) {
    return (
      <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <DisplayContent config={config} showHeader={showHeader} setShowHeader={setShowHeader} onExit={() => router.push('/')} />;
}

function getTransitionClass(transition: TransitionType, phase: 'idle' | 'exiting' | 'entering'): string {
  if (transition === 'NONE' || phase === 'idle') return '';
  const prefix = transition === 'FADE' ? 'view-fade' : transition === 'SLIDE_LEFT' ? 'view-slide-left' : 'view-slide-right';
  if (phase === 'exiting') return `${prefix}-exit`;
  if (phase === 'entering') return `${prefix}-enter`;
  return '';
}

function DisplayContent({
  config,
  showHeader,
  setShowHeader,
  onExit,
}: {
  config: DisplayConfig;
  showHeader: boolean;
  setShowHeader: (v: boolean) => void;
  onExit: () => void;
}) {
  const { currentView, currentViewIndex, enabledViews, progress, goToNext, goToPrev } = useDisplayMode(config);
  const { salesData, recordCount, cumulativeSalesData, trendData, reportData, rankingData, loading } = useDisplayData(config);

  // マウスカーソル自動非表示
  useAutoHideCursor(true, 3000);

  // トランジション状態管理
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [displayedView, setDisplayedView] = useState<ViewType>(currentView);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (config.transition === 'NONE') {
      setDisplayedView(currentView);
      setTransitionPhase('idle');
      return;
    }

    // 退出フェーズ開始
    setTransitionPhase('exiting');
    transitionTimerRef.current = setTimeout(() => {
      setDisplayedView(currentView);
      // 1フレーム待ってから enter クラスを適用
      requestAnimationFrame(() => {
        setTransitionPhase('entering');
        transitionTimerRef.current = setTimeout(() => {
          setTransitionPhase('idle');
        }, 500);
      });
    }, 300);

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [currentView, config.transition]);

  const handleExit = () => {
    if (window.opener) {
      window.close();
    } else {
      onExit();
    }
  };

  const isDark = config.darkMode;

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden relative ${isDark ? 'display-dark' : 'display-light'}`}
      style={{ backgroundColor: 'var(--display-bg)' }}
      onMouseMove={(e) => {
        setShowHeader(e.clientY < 60);
      }}
    >
      {/* ミニヘッダー（ホバーで表示） */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 h-10 backdrop-blur flex items-center px-4 transition-all duration-300 ${
          showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
        style={{
          backgroundColor: 'var(--display-header-bg)',
          borderBottom: '1px solid var(--display-border)',
        }}
      >
        <span className="text-sm font-medium shrink-0" style={{ color: 'var(--display-text-secondary)' }}>
          {VIEW_TYPE_LABELS[displayedView]} ({currentViewIndex + 1}/{enabledViews.length})
        </span>

        <div className="flex items-center mx-4 space-x-2">
          <button onClick={goToPrev} className="p-1 hover:bg-gray-100/20 rounded">
            <svg className="w-4 h-4" style={{ color: 'var(--display-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={goToNext} className="p-1 hover:bg-gray-100/20 rounded">
            <svg className="w-4 h-4" style={{ color: 'var(--display-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 mx-2">
          <div className="h-1 rounded" style={{ backgroundColor: 'var(--display-border)' }}>
            <div
              className="h-1 bg-blue-600 rounded transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleExit}
          className="ml-2 px-3 py-1 text-xs rounded hover:bg-gray-100/20 shrink-0"
          style={{ color: 'var(--display-text-secondary)', border: '1px solid var(--display-border)' }}
        >
          終了
        </button>
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className={`view-transition-container ${getTransitionClass(config.transition, transitionPhase)}`}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="mt-3 text-sm" style={{ color: 'var(--display-text-secondary)' }}>データを読み込み中...</div>
            </div>
          ) : displayedView === 'PERIOD_GRAPH' ? (
            <SalesPerformance salesData={salesData} recordCount={recordCount} darkMode={isDark} />
          ) : displayedView === 'CUMULATIVE_GRAPH' ? (
            <CumulativeChart salesData={cumulativeSalesData} darkMode={isDark} />
          ) : displayedView === 'TREND_GRAPH' ? (
            <TrendChart monthlyData={trendData} darkMode={isDark} />
          ) : displayedView === 'REPORT' && reportData ? (
            <ReportView reportData={reportData} darkMode={isDark} />
          ) : displayedView === 'RECORD' && rankingData ? (
            <RankingBoard data={rankingData} darkMode={isDark} />
          ) : (
            <div className="h-full flex items-center justify-center" style={{ color: 'var(--display-text-secondary)' }}>
              データがありません
            </div>
          )}
        </div>
      </main>

      {/* ロゴ & チーム名オーバーレイ（右下） */}
      {(config.companyLogoUrl || config.teamName) && (
        <div className="absolute bottom-4 right-4 z-40 flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
          {config.companyLogoUrl && (
            <img
              src={config.companyLogoUrl}
              alt="Company Logo"
              className="h-8 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          {config.teamName && (
            <span className="text-sm font-semibold text-white drop-shadow-sm">
              {config.teamName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
