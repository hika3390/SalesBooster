/** 円 → 万円に変換（小数点以下切り捨て） */
export function toManyen(yen: number): number {
  return Math.floor(yen / 10000);
}
