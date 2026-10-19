/**
 * The player's bar-style seek bar pattern: deterministic speech-like bar
 * heights (0.16..1) per seed (mulberry32), so builds are reproducible. A
 * pattern, not a waveform. Used by BarScrubber and the blog's ReadScrubber.
 */
export function barHeights(bars: number, seed: number): number[] {
  let a = seed >>> 0
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return Array.from({ length: bars }, (_, i) => {
    const x = i / bars
    const env = 0.55 + 0.25 * Math.sin(x * 9.1 + seed) + 0.12 * Math.sin(x * 23.7)
    return Math.max(0.16, Math.min(1, env * (0.55 + rand() * 0.6)))
  })
}
