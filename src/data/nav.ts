import { DOCS_URL, GITHUB_SERVER_URL } from './links'

/** The three pillars, pricing, then the blog. Docs and GitHub are external. */
export const primaryNav = [
  { label: 'Player', href: '/player' },
  { label: 'Server', href: '/server' },
  { label: 'Metadata', href: '/metadata' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
] as const

export const externalNav = [
  { label: 'Docs', href: DOCS_URL },
  { label: 'GitHub', href: GITHUB_SERVER_URL },
] as const
