import { useEffect, useState } from 'react'

// Shown if the GitHub API can't be reached; keep in step with the latest server tag.
const FALLBACK = 'v1.6.2'

interface Props {
  className?: string
}

export default function VersionBadge({ className = '' }: Props) {
  const [version, setVersion] = useState(FALLBACK)

  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/repos/KodeStar/audiosilo-server/releases/latest')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && data.tag_name) setVersion(data.tag_name)
      })
      .catch(() => {
        // Keep the fallback version on any network/parse error.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <span className={className}>{version}</span>
}
