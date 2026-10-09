import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { setPreference, type ThemePreference } from '@/lib/theme'
import { useThemePreference } from '@/lib/use-theme'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light theme', Icon: SunIcon },
  { value: 'dark', label: 'Dark theme', Icon: MoonIcon },
  { value: 'system', label: 'Match system theme', Icon: MonitorIcon },
]

interface Props {
  className?: string
}

/**
 * Light / dark / system switch. Hydrate with `client:load` (or `client:idle`).
 * Nothing is pressed until mount, because the server cannot know the
 * viewer's stored preference (avoids a hydration mismatch). Follows changes
 * made elsewhere on the page (the "see it in light" control by the media).
 */
export default function ThemeToggle({ className }: Props) {
  const pref = useThemePreference()

  return (
    <ToggleGroup
      aria-label="Colour theme"
      size="sm"
      spacing={0}
      variant="outline"
      className={cn(className)}
      value={pref ? [pref] : []}
      onValueChange={(next) => {
        const value = next[0] as ThemePreference | undefined
        // Pressing the active item again would empty the group; keep it.
        if (!value) return
        setPreference(value)
      }}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
          <Icon aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
