import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setPreference, type ThemePreference } from '@/lib/theme'
import { useThemePreference } from '@/lib/use-theme'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'Match system', Icon: MonitorIcon },
]

/** Compact theme switch for the header: one icon button opening a menu. */
export default function ThemeMenu({ className }: { className?: string }) {
  // null until mounted (the server cannot know a stored choice); then kept in
  // step with the in-page "Dark | Light" switch by the hero media.
  const pref = useThemePreference()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Colour theme"
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          className,
        )}
      >
        <SunIcon className="size-[18px] dark:hidden" aria-hidden="true" />
        <MoonIcon className="hidden size-[18px] dark:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-44 rounded-xl p-1.5">
        <DropdownMenuRadioGroup
          value={pref ?? ''}
          onValueChange={(v) => setPreference(v as ThemePreference)}
        >
          {OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} closeOnClick className="gap-2 rounded-lg py-2">
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
