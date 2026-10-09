import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { binaryRun, composeRun, composeYaml, dockerRun } from '@/data/install'

function Code({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl bg-muted/80 shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard
              .writeText(code)
              .then(() => {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              })
              .catch(() => {})
          }
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground sm:p-5">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/** Install options as tabs: Compose, a single docker run, or a native binary. */
export default function InstallTabs() {
  return (
    <Tabs defaultValue="compose" className="gap-4">
      <TabsList className="h-10 rounded-full p-1">
        <TabsTrigger value="compose" className="rounded-full px-4">Compose</TabsTrigger>
        <TabsTrigger value="run" className="rounded-full px-4">docker run</TabsTrigger>
        <TabsTrigger value="binary" className="rounded-full px-4">Binary</TabsTrigger>
      </TabsList>
      <TabsContent value="compose" className="space-y-3">
        <Code code={composeYaml} label="docker-compose.yml" />
        <Code code={composeRun} label="Terminal" />
      </TabsContent>
      <TabsContent value="run">
        <Code code={dockerRun} label="Terminal" />
      </TabsContent>
      <TabsContent value="binary">
        <Code code={binaryRun} label="Terminal" />
      </TabsContent>
    </Tabs>
  )
}
