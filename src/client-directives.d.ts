import 'astro'

declare module 'astro' {
  interface AstroClientDirectives {
    /** Hydrate after load and a moment of idle, or at once on pointer/touch/focus/key (src/lib/client-settled.ts). */
    'client:settled'?: boolean
  }
}
