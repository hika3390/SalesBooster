/** データ種類で選択可能な単位の一覧 */
export const UNIT_OPTIONS = [
  { value: '万円', label: '万円' },
  { value: '千円', label: '千円' },
  { value: '円', label: '円' },
  { value: '件', label: '件' },
  { value: '時間', label: '時間' },
  { value: '分', label: '分' },
  { value: '個', label: '個' },
  { value: '回', label: '回' },
  { value: '人', label: '人' },
] as const;

/** 単位の値のみの型 */
export type UnitValue = (typeof UNIT_OPTIONS)[number]['value'];

/** デフォルト単位 */
export const DEFAULT_UNIT: UnitValue = '万円';
