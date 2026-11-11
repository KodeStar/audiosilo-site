# Writing blog posts that are easy to read

A reader called the comparison post "near unreadable due to the volume of
text". The User Guide had the same problem and was rewritten to the rules in
`audiosilo-docs/docs-developers/contributing/documentation.md` ("User Guide
readability rules"). These are the blog's version. Check every new or edited
post against them.

## The rules

1. **Answer first.** The opening paragraph answers the title's question in
   2-3 short sentences. Detail comes after, never before.
2. **Short sentences, short paragraphs.** Aim for under 20 words a sentence and
   split anything over 30. Keep paragraphs to 1-3 sentences. One idea each.
3. **Lists and tables over prose.** Steps are numbered lists, one action per
   step, UI labels in **bold**. Several figures or a side-by-side comparison go
   in a table, not a sentence that strings them together.
4. **No internal names.** No PR or issue numbers, phase or track names, code
   identifiers, source paths or API routes. Config keys, environment variables
   and commands appear only where the reader types them.
5. **Main path first, edge cases last.** Rare cases, caveats and "if you also
   ..." go in a short **Good to know** section near the end, or a link to the
   docs.
6. **Say it once.** Don't repeat a fact in the intro, the body and the
   conclusion. Don't restate what the at-a-glance grid already shows. Link the
   docs instead of copying them.
7. **Method and fine print go last.** In comparisons and benchmarks, results
   come first in a table; how it was measured goes in a short section at the
   end.
8. **Release posts:** one short section per change: what you can now do (1-3
   sentences) and a docs link. Fixes go in one short list. No changelog prose.
9. **Keep posts short.** Tips and feature posts: about 800 words. Guides: about
   1,200. Comparisons and reverse-proxy guides: about 1,500, not counting code
   blocks and tables. Past that, cut.
10. **No em dashes, and few spaced hyphens.** Never use the em dash character.
    A spaced hyphen in the middle of a sentence is the same habit. Prefer a
    full stop or a comma. A list item written as a label, a hyphen and its text
    is fine.

## Wording

11. **Say what it does, not how it feels.** Name the step, the mechanism or
    the number. "Downloaded books play with no connection", not "your library
    is always within reach". If a sentence about AudioSilo could appear
    unchanged on another product's blog, cut it.
12. **Name who does what.** "The server scans the folder", not "the folder is
    scanned". Use the passive only when the actor does not matter.
13. **No colon as a mid-sentence connector.** A colon introduces a list, an
    example, a figure, a definition or a labelled item. Anywhere else, write
    two sentences.
14. **Plain and literal.** No metaphors, slogans or sentence fragments for
    effect. Never "simply", "easily" or "just" in a step. Instead of "much
    faster", give the measured figure. With no figure, say what changes.
15. **One name per thing.** Use the label the reader sees in the product, and
    keep it for the whole post. Do not switch between "the console", "the
    admin page" and "the dashboard".
16. **Numbered steps start with the goal and end with the result.** "To share
    a book, open its page and select **Share**." After the last step, say what
    the reader should now see.
17. **Links say where they go.** Link text is the page's title or a short
    description, never "here" or "this page".

**A rule never beats a clear sentence.** Short does not mean clipped. Keep
"the" and "a", and keep a longer sentence when it carries one idea with its
condition. If a rule makes a sentence worse, rewrite the sentence another way.

**Cut, don't add.** When you edit a post, look for something to remove.
Accuracy still comes first: a shorter post keeps every figure and claim true,
and a readability edit adds no new claims.
