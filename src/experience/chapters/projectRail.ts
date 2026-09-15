/** Wrapped, evenly spaced slots: adding projects never crowds the visible cards. */
export function projectRailOffset(index: number, count: number, rotation: number): number {
  const size = Math.max(1, count);
  const offset = index + rotation / ((Math.PI * 2) / size);
  return ((offset + size / 2) % size + size) % size - size / 2;
}
