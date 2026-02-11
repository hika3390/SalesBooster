import { ViewType } from './index';

export const VALID_TRANSITIONS = ['NONE', 'FADE', 'SLIDE_LEFT', 'SLIDE_RIGHT'] as const;
export type TransitionType = (typeof VALID_TRANSITIONS)[number];

export interface DisplayViewConfig {
  viewType: ViewType;
  enabled: boolean;
  duration: number;  // 秒
  order: number;
}

export interface DisplayConfig {
  views: DisplayViewConfig[];
  loop: boolean;
  dataRefreshInterval: number;  // ミリ秒
  filter: { groupId: string; memberId: string };
  transition: TransitionType;
  companyLogoUrl: string;
  teamName: string;
  darkMode: boolean;
}

export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  views: [
    { viewType: 'PERIOD_GRAPH', enabled: true, duration: 30, order: 0 },
    { viewType: 'CUMULATIVE_GRAPH', enabled: true, duration: 30, order: 1 },
    { viewType: 'TREND_GRAPH', enabled: true, duration: 30, order: 2 },
    { viewType: 'REPORT', enabled: true, duration: 30, order: 3 },
    { viewType: 'RECORD', enabled: true, duration: 30, order: 4 },
  ],
  loop: true,
  dataRefreshInterval: 60000,
  filter: { groupId: '', memberId: '' },
  transition: 'NONE',
  companyLogoUrl: '',
  teamName: '',
  darkMode: false,
};
