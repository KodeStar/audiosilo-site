import { DOCS_URL, GITHUB_SERVER_URL } from './links'

/** The three pillars, then pricing (the footer's AudioSilo column). */
export const pillarNav = [
  { label: 'Player', href: '/player' },
  { label: 'Server', href: '/server' },
  { label: 'Metadata', href: '/metadata' },
  { label: 'Pricing', href: '/pricing' },
] as const

export const blogNav = { label: 'Blog', href: '/blog' } as const

/** The header: the pillars, pricing, then the blog. Docs and GitHub are external. */
export const primaryNav = [...pillarNav, blogNav] as const

export const externalNav = [
  { label: 'Docs', href: DOCS_URL },
  { label: 'GitHub', href: GITHUB_SERVER_URL },
] as const
