/** 円 → 万円に変換（小数点以下切り捨て） */
export function toManyen(yen: number): number {
  return Math.floor(yen / 10000);
}

/** 単位に応じて値を変換する */
export function convertByUnit(value: number, unit: string): number {
  switch (unit) {
    case 'MAN_YEN':
      return Math.floor(value / 10000);
    case 'SEN_YEN':
      return Math.floor(value / 1000);
    default:
      return value;
  }
}

/** 数値を3桁区切り文字列に変換 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}
