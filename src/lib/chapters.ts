/** A pillar page's section, as its ChapterList shows it. */
export interface Chapter {
  id: string
  title: string
}

/**
 * The page's chapter list is the single source of each section's
 * `data-chapter` (the header seek bar's tooltip): `chapterTitle(chapters)('demo')`
 * returns that section's title and fails the build on an unknown id.
 */
export function chapterTitle(chapters: readonly Chapter[]): (id: string) => string {
  return (id) => {
    const c = chapters.find((ch) => ch.id === id)
    if (!c) throw new Error(`No chapter "${id}" in this page's chapter list`)
    return c.title
  }
}
