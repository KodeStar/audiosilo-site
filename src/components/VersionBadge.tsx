import { useEffect, useState } from 'react'
import { GITHUB_SERVER_LATEST_API } from '@/data/links'
import { SERVER_VERSION } from '@/data/status'

// Shown if the GitHub API can't be reached; bump SERVER_VERSION in src/data/status.ts.
const FALLBACK = SERVER_VERSION

interface Props {
  className?: string
}

export default function VersionBadge({ className = '' }: Props) {
  const [version, setVersion] = useState(FALLBACK)

  useEffect(() => {
    let cancelled = false
    fetch(GITHUB_SERVER_LATEST_API)
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
