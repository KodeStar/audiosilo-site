/**
 * Rehype plugin for blog posts (the only Markdown on the site): marks every
 * h2 with `data-chapter="<its text>"`, so a post's sections register with the
 * header seek bar and the chapter lists (src/lib/site.ts) with no client
 * code. The post header carries the intro's data-chapter; see
 * postChapters() in src/lib/blog.ts, which lists the same chapters.
 */
interface Node {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: Node[]
}

const text = (n: Node): string => (n.type === 'text' ? (n.value ?? '') : (n.children ?? []).map(text).join(''))

function visit(n: Node) {
  if (n.type === 'element' && n.tagName === 'h2') {
    n.properties = { ...n.properties, dataChapter: text(n).trim() }
  }
  n.children?.forEach(visit)
}

export default function rehypeBlogChapters() {
  return (tree: Node) => visit(tree)
}
