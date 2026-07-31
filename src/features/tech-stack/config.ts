export const STAGE_THRESHOLDS = {
  STAGE_2: 20,
  STAGE_3: 50,
  WIN: 100,
} as const;

export const BOSS_CLICKS = [10, 40, 80] as const;

export const bossHealthFor = (click: number): number => (click === 10 ? 5 : 15);

export type SoundType = 'pop' | 'hit' | 'win' | 'boss' | 'shatter' | 'laser' | 'bomb';
