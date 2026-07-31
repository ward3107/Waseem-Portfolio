export type Tier = {
  clicks: number;
  percent: number;
  code: string;
  isMajor: boolean;
  stage: 1 | 2 | 3;
  marqueeSpeed: string;
  weaponName: string;
  weaponEmoji: string;
};

// 17 tiers, click counts roughly tripled from v1 so 10% is a real climb:
// +15 clicks per half-percent step, +30 clicks per whole-percent jump.
// Each tier has its own coding-themed weapon that shows in the WEAPON tile.
export const TIERS: readonly Tier[] = [
  { clicks: 30, percent: 2, code: 'VIBE02', isMajor: true, stage: 1, marqueeSpeed: '60s', weaponName: 'hello world', weaponEmoji: '👋' },
  { clicks: 45, percent: 2.5, code: 'VIBE25H', isMajor: false, stage: 1, marqueeSpeed: '60s', weaponName: 'console.log', weaponEmoji: '📝' },
  { clicks: 60, percent: 3, code: 'VIBE03', isMajor: false, stage: 1, marqueeSpeed: '60s', weaponName: 'printf', weaponEmoji: '🖨️' },
  { clicks: 75, percent: 3.5, code: 'VIBE35H', isMajor: false, stage: 1, marqueeSpeed: '60s', weaponName: 'echo', weaponEmoji: '📣' },
  { clicks: 105, percent: 4, code: 'VIBE04', isMajor: true, stage: 2, marqueeSpeed: '45s', weaponName: 'for-loop', weaponEmoji: '🔁' },
  { clicks: 120, percent: 4.5, code: 'VIBE45H', isMajor: false, stage: 2, marqueeSpeed: '45s', weaponName: 'forEach', weaponEmoji: '🔄' },
  { clicks: 135, percent: 5, code: 'VIBE05', isMajor: false, stage: 2, marqueeSpeed: '45s', weaponName: 'map()', weaponEmoji: '🗺️' },
  { clicks: 150, percent: 5.5, code: 'VIBE55H', isMajor: false, stage: 2, marqueeSpeed: '45s', weaponName: 'recursion', weaponEmoji: '♾️' },
  { clicks: 180, percent: 6, code: 'VIBE06', isMajor: true, stage: 3, marqueeSpeed: '30s', weaponName: 'regex', weaponEmoji: '🎯' },
  { clicks: 195, percent: 6.5, code: 'VIBE65H', isMajor: false, stage: 3, marqueeSpeed: '30s', weaponName: 'git push', weaponEmoji: '🚀' },
  { clicks: 210, percent: 7, code: 'VIBE07', isMajor: false, stage: 3, marqueeSpeed: '30s', weaponName: 'sudo', weaponEmoji: '🔓' },
  { clicks: 225, percent: 7.5, code: 'VIBE75H', isMajor: false, stage: 3, marqueeSpeed: '30s', weaponName: 'chmod 777', weaponEmoji: '🔑' },
  { clicks: 255, percent: 8, code: 'VIBE08', isMajor: true, stage: 3, marqueeSpeed: '20s', weaponName: 'SIGKILL', weaponEmoji: '☠️' },
  { clicks: 270, percent: 8.5, code: 'VIBE85H', isMajor: false, stage: 3, marqueeSpeed: '20s', weaponName: 'DROP TABLE', weaponEmoji: '💣' },
  { clicks: 285, percent: 9, code: 'VIBE09', isMajor: false, stage: 3, marqueeSpeed: '20s', weaponName: 'rm -rf /', weaponEmoji: '🔥' },
  { clicks: 300, percent: 9.5, code: 'VIBE95H', isMajor: false, stage: 3, marqueeSpeed: '20s', weaponName: 'KERNEL PANIC', weaponEmoji: '💀' },
  { clicks: 330, percent: 10, code: 'VIBE10', isMajor: true, stage: 3, marqueeSpeed: '12s', weaponName: 'AGI', weaponEmoji: '🤖' },
] as const;

// Bosses gate every whole-percent jump. Health scales harder now that the
// ladder is roughly three times as long — the last boss is a real wall.
export const BOSSES: readonly { clicks: number; health: number }[] = [
  { clicks: 90, health: 10 },
  { clicks: 165, health: 20 },
  { clicks: 240, health: 30 },
  { clicks: 315, health: 45 },
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

// Marquee rows grow with the stage — the field gets busier, harder to aim.
// Stage 1: 2 rows (baseline). Stage 2: 3 rows. Stage 3: 4 rows.
export const rowsForStage = (stage: 1 | 2 | 3): number => (stage === 1 ? 2 : stage === 2 ? 3 : 4);

// Per-row speed variance and direction so extra rows feel distinct rather
// than being clones of the two base rows. Index maps to a fixed
// (direction, multiplier) so behavior stays stable across renders.
export type RowSpec = { direction: 'left' | 'right'; speedMultiplier: number };
export const ROW_SPECS: readonly RowSpec[] = [
  { direction: 'left', speedMultiplier: 1 },
  { direction: 'right', speedMultiplier: 1 },
  { direction: 'left', speedMultiplier: 0.7 },
  { direction: 'right', speedMultiplier: 1.35 },
] as const;

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
