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
