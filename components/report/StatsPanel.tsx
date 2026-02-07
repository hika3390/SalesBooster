'use client';

interface StatsPanelProps {
  stats: {
    monthlyAvg: number;
    dailyAvg: number;
    targetDays: number;
    targetMonths: number;
    landingPrediction: number;
    landingMonth: string;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 h-full">
      <h3 className="text-sm font-bold text-blue-600 text-center mb-4">その他情報</h3>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-xs text-gray-500">月平均（直近3ヶ月）</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.monthlyAvg.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">万円</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-500">一日平均（直近3ヶ月）</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.dailyAvg}
            <span className="text-sm font-normal text-gray-500">万円</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-500">目標達成必要日数/月数（直近3ヶ月）</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.targetDays}
            <span className="text-sm font-normal text-gray-500">日</span>
            {' / '}
            {stats.targetMonths}
            <span className="text-sm font-normal text-gray-500">ヶ月</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-500">今月 着地予測（{stats.landingMonth}）</div>
          <div className="text-2xl font-bold text-gray-800">
            {stats.landingPrediction.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">万円</span>
          </div>
        </div>
      </div>
    </div>
  );
}
