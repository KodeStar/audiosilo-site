/**
 * Published benchmark sets: public/benchmarks/<set>/ holds the harness and its
 * results, public/benchmarks/<set>.zip all of it, and src/pages/benchmarks/[set].astro
 * lists them. A set's page builds only once its blog post is published.
 */
export const BENCHMARK_SETS = [
  {
    set: '2026-10-audiobookshelf',
    /** The blog post that reports this set. */
    post: 'audiosilo-vs-audiobookshelf',
    title: 'AudioSilo vs Audiobookshelf benchmark (October 2026)',
    description:
      'The harness and every result file behind the AudioSilo vs Audiobookshelf comparison: scans, memory, start-up, API and web player timings on 1,000 to 5,000 LibriVox books, run with AudioSilo 2.5.0 and again with 2.5.1.',
  },
] as const

export type BenchmarkSet = (typeof BENCHMARK_SETS)[number]
