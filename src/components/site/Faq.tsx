import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export interface FaqItem {
  q: string
  /** Paragraphs; may contain simple inline HTML links. */
  a: string[]
}

/** The pricing FAQ: shadcn accordion, one item open at a time. */
export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="border-t border-border">
      {items.map((item) => (
        <AccordionItem key={item.q} value={item.q} className="border-b border-border">
          <AccordionTrigger className="py-5 font-display text-[1.1875rem] font-semibold tracking-[-0.02em] hover:no-underline sm:text-xl">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline">
            {item.a.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
