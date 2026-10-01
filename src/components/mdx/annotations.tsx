import type { ReactNode } from "react";
import { NotePopover } from "./note-popover";

function AnnotatedPassageRoot({
  children,
  side = "right",
}: {
  children: ReactNode;
  side?: "left" | "right";
}) {
  return (
    <div data-side={side} className="annotated-passage relative my-8 min-w-0 pt-10 xl:pt-0">
      {children}
    </div>
  );
}

function PassageText({ children }: { children: ReactNode }) {
  return (
    <div className="annotated-passage-text prose-lab min-w-0 [overflow-wrap:anywhere] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
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
    <NotePopover title={title || "Author note"}>{children}</NotePopover>
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
