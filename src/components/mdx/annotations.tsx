import type { ReactNode } from "react";

function AnnotatedPassageRoot({ children }: { children: ReactNode }) {
  return (
    <div className="my-8 grid min-w-0 gap-6 xl:relative xl:left-1/2 xl:w-[min(92vw,68rem)] xl:-translate-x-1/2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:gap-8">
      {children}
    </div>
  );
}

function PassageText({ children }: { children: ReactNode }) {
  return (
    <div className="prose-lab min-w-0 [overflow-wrap:anywhere] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
      {children}
    </div>
  );
}

function PassageNote({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      aria-label={title || "Author note"}
      className="min-w-0 self-start rounded-r-lg border-l-2 border-l-[var(--lab-accent)] bg-muted/40 p-5 [overflow-wrap:anywhere]"
    >
      {title ? (
        <div className="mb-3 text-sm font-semibold text-foreground">{title}</div>
      ) : null}
      <div className="prose-lab min-w-0 text-sm leading-7 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

export const AnnotatedPassage = Object.assign(AnnotatedPassageRoot, {
  Text: PassageText,
  Note: PassageNote,
});

export function Disclosure({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="my-6 min-w-0 rounded-lg border bg-card text-card-foreground [overflow-wrap:anywhere]">
      <summary className="cursor-pointer rounded-lg px-5 py-4 font-medium marker:text-muted-foreground hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {title}
      </summary>
      <div className="prose-lab min-w-0 border-t px-5 py-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </details>
  );
}
