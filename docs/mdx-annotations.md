# Annotations in MDX

Use these components in any writing or work `.mdx` file. They are registered
globally, so no imports are needed. Notes are public author commentary stored
alongside the article. Changes appear after the site is rebuilt and deployed.

## Side notes

Wrap a passage and its note in one `AnnotatedPassage`. Put exactly one
`AnnotatedPassage.Text` first and one `AnnotatedPassage.Note` second. A passage
can contain several paragraphs. The note title is optional.

```mdx
<AnnotatedPassage>
  <AnnotatedPassage.Text>

    Matrix multiplication benefits from **reusing data**.

    A tile lets several operations share values that are already nearby.

  </AnnotatedPassage.Text>
  <AnnotatedPassage.Note title="My note">

    Think about how often each value is loaded from memory.

    - Count the loads as well as the arithmetic.
    - Compare a small tile with a larger one.

  </AnnotatedPassage.Note>
</AnnotatedPassage>
```

The main passage keeps the same width and horizontal alignment as ordinary
article text. At viewport widths of 1280px and above, notes sit in the right
margin by default. Use `<AnnotatedPassage side="left">` to put a note in the
left margin, or `side="right"` to choose the default explicitly. Margin notes
adapt to the available space and are capped at 18rem wide. On smaller screens,
notes on either side follow their passage. Long notes increase the row height, so
consecutive annotations cannot overlap. Place these blocks at article level,
not inside another annotation or a narrow card.

## Expandable explanations

`Disclosure` requires a plain-text `title` and starts collapsed. Readers can
click its summary or focus it with Tab and toggle it with Enter or Space.
It uses the browser's native disclosure control and works without JavaScript.

````mdx
<Disclosure title="Show a worked example">

  For vectors of length $n$, the dot product is:

  $$
  a \cdot b = \sum_{i=1}^{n} a_i b_i
  $$

  ```js
  const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
  ```

</Disclosure>
````

Collapsed content is still part of the public page. Do not use a disclosure to
store private notes. Its open state is not saved between visits.

## Banners

Use the existing `Callout` for inline banners. It requires a title and accepts
`type="info"` (the default) or `type="warning"`.

```mdx
<Callout title="Reading tip" type="info">

  Review the memory hierarchy before continuing.

</Callout>

<Callout title="Benchmark caveat" type="warning">

  Compare timings on the same hardware and with the same input sizes.

</Callout>
```

## Formatting and source material

Keep blank lines around Markdown inside component tags, as shown above. You can
use emphasis, links, lists, equations, and fenced code blocks in passages, notes,
and disclosures. Put rich note content between the tags, not in the title.

For commentary on another article, identify the author and link to the source
near the passage. These tools annotate content you author in your own files;
they do not import or modify an external webpage.

The original sample in `src/components/mdx/fixtures/annotations.mdx` also covers
untitled notes, consecutive annotations, and longer note content for testing.
