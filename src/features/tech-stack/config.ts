export type Tier = {
  clicks: number;
  percent: number;
  code: string;
  isMajor: boolean;
  stage: 1 | 2 | 3;
  marqueeSpeed: string;
};

export const TIERS: readonly Tier[] = [
  { clicks: 10, percent: 2, code: 'VIBE02', isMajor: true, stage: 1, marqueeSpeed: '60s' },
  { clicks: 15, percent: 2.5, code: 'VIBE25H', isMajor: false, stage: 1, marqueeSpeed: '60s' },
  { clicks: 20, percent: 3, code: 'VIBE03', isMajor: false, stage: 1, marqueeSpeed: '60s' },
  { clicks: 25, percent: 3.5, code: 'VIBE35H', isMajor: false, stage: 1, marqueeSpeed: '60s' },
  { clicks: 35, percent: 4, code: 'VIBE04', isMajor: true, stage: 2, marqueeSpeed: '45s' },
  { clicks: 40, percent: 4.5, code: 'VIBE45H', isMajor: false, stage: 2, marqueeSpeed: '45s' },
  { clicks: 45, percent: 5, code: 'VIBE05', isMajor: false, stage: 2, marqueeSpeed: '45s' },
  { clicks: 50, percent: 5.5, code: 'VIBE55H', isMajor: false, stage: 2, marqueeSpeed: '45s' },
  { clicks: 60, percent: 6, code: 'VIBE06', isMajor: true, stage: 3, marqueeSpeed: '30s' },
  { clicks: 65, percent: 6.5, code: 'VIBE65H', isMajor: false, stage: 3, marqueeSpeed: '30s' },
  { clicks: 70, percent: 7, code: 'VIBE07', isMajor: false, stage: 3, marqueeSpeed: '30s' },
  { clicks: 75, percent: 7.5, code: 'VIBE75H', isMajor: false, stage: 3, marqueeSpeed: '30s' },
  { clicks: 85, percent: 8, code: 'VIBE08', isMajor: true, stage: 3, marqueeSpeed: '20s' },
  { clicks: 90, percent: 8.5, code: 'VIBE85H', isMajor: false, stage: 3, marqueeSpeed: '20s' },
  { clicks: 95, percent: 9, code: 'VIBE09', isMajor: false, stage: 3, marqueeSpeed: '20s' },
  { clicks: 100, percent: 9.5, code: 'VIBE95H', isMajor: false, stage: 3, marqueeSpeed: '20s' },
  { clicks: 110, percent: 10, code: 'VIBE10', isMajor: true, stage: 3, marqueeSpeed: '12s' },
] as const;

// Bosses appear just before each whole-percent milestone after the opening 2%
// tier — they gate the jump so the harder cards feel earned, not free.
export const BOSSES: readonly { clicks: number; health: number }[] = [
  { clicks: 30, health: 5 },
  { clicks: 55, health: 10 },
  { clicks: 80, health: 15 },
  { clicks: 105, health: 22 },
] as const;

export const WIN_CLICKS = TIERS[TIERS.length - 1].clicks;

export const tierForClicks = (clicks: number): Tier | null => {
  let match: Tier | null = null;
  for (const t of TIERS) {
    if (clicks >= t.clicks) match = t;
    else break;
  }
  return match;
};

export const bossForClicks = (clicks: number): { clicks: number; health: number } | undefined =>
  BOSSES.find((b) => b.clicks === clicks);

export type SoundType =
  | 'pop'
  | 'hit'
  | 'win'
  | 'boss'
  | 'shatter'
  | 'laser'
  | 'bomb'
  | 'tier'
  | 'milestone'
  | 'finale'
  | 'redeem';
