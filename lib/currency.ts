/** 円 → 万円に変換（小数点以下切り捨て） */
export function toManyen(yen: number): number {
  return Math.floor(yen / 10000);
}

/** 数値を3桁区切り文字列に変換 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}
