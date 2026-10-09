/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Optional override of TOUR_BASE (src/data/media.ts), e.g. /media/tours for local previews. */
  readonly PUBLIC_TOUR_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
