import { ArrowUpRightIcon, MenuIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import ThemeToggle from '@/components/theme/ThemeToggle'
import { DEMO_URL } from '@/data/links'
import { externalNav, primaryNav } from '@/data/nav'

/** Phone navigation: a sheet with the pillars, the demo and the theme switch. */
export default function MobileNav({ current }: { current: string }) {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,22rem)] gap-0 border-l-glass-border bg-background/95 p-0 backdrop-blur-xl">
        <SheetTitle className="px-6 pt-6 pb-2 font-display text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Menu
        </SheetTitle>
        <nav aria-label="Primary" className="flex flex-col px-3">
          {primaryNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={current === item.href ? 'page' : undefined}
              className="rounded-xl px-3 py-3 font-display text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-foreground transition-colors hover:bg-foreground/[0.05] aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col border-t border-border pt-2">
            {externalNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              >
                {item.label}
                <ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t border-border p-6">
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-brand-foreground"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
            </svg>
            Try the demo
          </a>
          <p className="-mt-2 text-center text-xs text-muted-foreground">No sign-up. Opens in your browser.</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
