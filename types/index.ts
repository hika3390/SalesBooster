export interface SalesPerson {
  rank: number;
  name: string;
  sales: number;
  target: number;
  achievement: number;
  imageUrl?: string;
  department?: string;
}

export type ViewType = '期間グラフ' | '累計グラフ' | '推移グラフ' | 'レポート' | 'レコード';
export type PeriodUnit = '月' | '週' | '日';

export interface RankingMember {
  rank: number;
  name: string;
  imageUrl?: string;
  amount: number; // 円単位
}

export interface RankingColumn {
  label: string;       // "TOTAL" or "2026/02" etc
  subLabel?: string;   // "2025/02〜2026/02" etc
  isTotal: boolean;
  members: RankingMember[];
}

export interface RankingBoardData {
  columns: RankingColumn[];
}

export interface ReportData {
  monthlyTrend: { month: string; displayMonth: string; sales: number; movingAvg: number | null }[];
  cumulativeTrend: { month: string; displayMonth: string; cumulative: number }[];
  dayOfWeekRatio: { day: string; amount: number; ratio: number }[];
  periodRatio: { period: string; amount: number; ratio: number }[];
  stats: {
    monthlyAvg: number;
    dailyAvg: number;
    targetDays: number;
    targetMonths: number;
    landingPrediction: number;
    landingMonth: string;
  };
}
