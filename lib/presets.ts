/**
 * 単位に応じた入力プリセット値を返す
 */
export function getValuePresets(unit: string): number[] {
  switch (unit) {
    case '万円': return [1, 5, 10, 50, 100];
    case '千円': return [1, 5, 10, 50, 100];
    case '円': return [100, 500, 1000, 5000, 10000];
    case '件': return [1, 2, 3, 5, 10];
    default: return [1, 5, 10, 50, 100];
  }
}
