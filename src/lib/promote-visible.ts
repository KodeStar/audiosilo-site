/**
 * An inline script (rendered with set:html right after a pair of per-theme
 * images) that eager-loads, at high priority, the one the painted theme shows.
 * `attr` and `prefix` pick the image: `img[<attr>="<prefix><theme>"]`.
 */
export function promoteVisibleImg(attr: string, prefix = ''): string {
  return `(function(s){var d=document.documentElement.classList.contains('dark');var i=s.parentNode.querySelector('img[${attr}="${prefix}'+(d?'dark':'light')+'"]');if(i){i.fetchPriority='high';i.loading='eager'}})(document.currentScript)`
}
