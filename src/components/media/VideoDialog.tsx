import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useResolvedTheme } from '@/lib/use-theme'
import type { TourFiles } from '@/data/media'

interface Props {
  /** Per-theme URLs: the tour file, its same-origin WebVTT captions and a poster (tourFiles() in src/data/media.ts). */
  files: TourFiles
  /** Dialog heading (also the video's accessible name). */
  title: string
  description?: string
  /** Trigger button content. From Astro, pass it as the component's children. */
  children?: ReactNode
  triggerVariant?: ComponentProps<typeof Button>['variant']
  triggerSize?: ComponentProps<typeof Button>['size']
  triggerClassName?: string
  contentClassName?: string
  /** CSS aspect-ratio of the video box, as width/height (e.g. "1080/2338"). Default 16/9. */
  aspect?: string
  captionsLabel?: string
  captionsLang?: string
}

/**
 * A button that opens a full, captioned tour video in a dialog. The variant
 * follows the theme (swapping live, position kept). The <video> exists only
 * while the dialog is open (the popup unmounts on close), so nothing loads
 * before it opens and a closed dialog holds no stale signed redirect URL
 * (GitHub's expire after an hour). Hydrate with `client:visible`.
 *
 * The file is a typed <source> (Safari won't play an mp4 served as
 * application/octet-stream without the type) and the element never sets
 * `crossorigin` (GitHub's asset redirects send no CORS headers).
 *
 *   <VideoDialog client:visible files={tourFiles(tours.server)} title="A tour of the admin console">
 *     Watch the tour
 *   </VideoDialog>
 */
export default function VideoDialog({
  title,
  description,
  children = 'Watch the tour',
  triggerVariant = 'outline',
  triggerSize = 'lg',
  triggerClassName,
  contentClassName,
  ...player
}: Props) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant={triggerVariant} size={triggerSize} className={triggerClassName} />}
      >
        {children}
      </DialogTrigger>
      <DialogContent className={cn('gap-4 rounded-3xl p-4 sm:max-w-5xl sm:p-6', contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <TourPlayer title={title} {...player} />
      </DialogContent>
    </Dialog>
  )
}

function TourPlayer({
  files,
  title,
  aspect = '16/9',
  captionsLabel = 'English',
  captionsLang = 'en',
}: Pick<Props, 'files' | 'title' | 'aspect' | 'captionsLabel' | 'captionsLang'>) {
  const theme = useResolvedTheme()
  // Live position, so a theme swap (which remounts the element) can resume.
  // Events from the detached old element never reach React, so this holds
  // the state at the moment of the swap.
  const resume = useRef({ time: 0, playing: false, loaded: false })
  const [failed, setFailed] = useState<string | null>(null)

  const src = files.video[theme]
  const captions = files.captions[theme]
  const posterSrc = files.poster[theme]

  // Autoplay on open (the viewer asked for it) unless they prefer reduced motion.
  const [autoPlay] = useState(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-xl bg-black"
      // Full width, unless that would make the box taller than the viewport
      // leaves room for (a tall phone tour): then narrower, at the same ratio.
      style={{ aspectRatio: aspect, width: `min(100%, calc((100dvh - 12rem) * ${aspect}))` }}
    >
      {failed === src ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(80%_70%_at_50%_40%,#1a2340,#05070f)] p-6 text-center">
          <p className="font-display text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
            This tour didn't load.
          </p>
          <p className="max-w-sm text-sm text-white/70">Try again in a moment. The demo is open in the meantime.</p>
        </div>
      ) : (
        <video
          key={src}
          className="size-full"
          poster={posterSrc}
          aria-label={title}
          controls
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          data-tour-video
          onTimeUpdate={(e) => (resume.current.time = e.currentTarget.currentTime)}
          onPlay={() => (resume.current.playing = true)}
          onPause={() => (resume.current.playing = false)}
          onLoadedMetadata={(e) => {
            const r = resume.current
            if (!r.loaded) {
              r.loaded = true // first load: nothing to restore
              return
            }
            const el = e.currentTarget
            el.currentTime = r.time
            if (r.playing) el.play().catch(() => {})
            else el.pause() // cancels autoPlay when the viewer had paused
          }}
        >
          {/* A failed <source> fires its own error event, not the video's. */}
          <source src={src} type="video/mp4" onError={() => setFailed(src)} />
          <track kind="captions" src={captions} srcLang={captionsLang} label={captionsLabel} default />
        </video>
      )}
    </div>
  )
}
