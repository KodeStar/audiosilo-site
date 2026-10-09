import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'

/** Registers the `client:settled` directive (src/lib/client-settled.ts). */
export default function clientSettled(): AstroIntegration {
  return {
    name: 'client-settled',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({ name: 'settled', entrypoint: fileURLToPath(new URL('../lib/client-settled.ts', import.meta.url)) })
      },
    },
  }
}
