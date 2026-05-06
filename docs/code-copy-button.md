# Code Copy Button

Code snippet copy support lives in the MDX rendering path.

## File Map

- `src/lib/mdx.tsx` compiles Markdown and MDX content with
  `rehype-pretty-code`.
- `src/lib/rehype-pretty-code-options.ts` configures syntax highlighting and
  preserves the original raw code on the highlighted `<pre>` node.
- `src/mdx-components.tsx` registers `pre: MdxPre`, so MDX code blocks render
  through the custom copy wrapper.
- `src/components/mdx/mdx-pre.tsx` renders the copy button and writes the code
  text to the clipboard.
- `src/lib/mdx-code-copy.ts` chooses the clipboard text. It prefers preserved
  raw source and falls back to reading nested rendered text.
- `src/components/mdx/mdx-pre.test.ts` covers the copy text extraction behavior.

## Data Flow

Markdown code starts as plain text inside a fenced code block:

````md
```ts
const first = 1;
const second = 2;
```
````

`renderMdx()` passes that source through `rehype-pretty-code`. During syntax
highlighting, the `preserve-raw-code-for-copy` Shiki transformer stores the
original highlighted source on the generated `<pre>` as `data-raw-code`.

When the MDX output renders, `src/mdx-components.tsx` replaces every `pre`
element with `MdxPre`. That component receives the highlighted children plus the
preserved raw source prop.

On click, `MdxPre` calls `extractCopyableCode(children, rawCode)`. The helper
uses `rawCode` when it exists, so the clipboard receives the original multiline
snippet instead of depending on the syntax-highlighted React child tree. If raw
source is unavailable, it recursively extracts text from the rendered children.

The button uses `navigator.clipboard.writeText()` first and falls back to a
temporary hidden `<textarea>` for older or restricted browser contexts.

## Why Raw Source Matters

Syntax highlighting wraps code in nested spans for tokens, lines, themes, and
line highlighting. Those rendered children are built for display, not for
clipboard fidelity. If the copy helper relies only on rendered children, a
multiline snippet can degrade into the first visible line followed by blank
lines.

Preserving the raw code during highlighting keeps copy behavior language-agnostic
and independent of the DOM shape produced by `rehype-pretty-code` or Shiki.

## Verification

After changing this path, run:

```powershell
npm.cmd test -- src/components/mdx/mdx-pre.test.ts
npm.cmd test
npm.cmd run lint
npm.cmd run build
```
