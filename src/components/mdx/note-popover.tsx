"use client";

import type { ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { MessageSquareTextIcon, XIcon } from "lucide-react";

export function NotePopover({ title = "Author note", children }: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="annotated-passage-note">
      <Popover.Root onOpenChange={(open, event) => {
        // Keep a hovered note readable until the reader explicitly dismisses it.
        if (!open && event.reason === "trigger-hover") event.cancel();
      }}>
        <Popover.Trigger
          openOnHover
          delay={150}
          aria-label={`Read note: ${title}`}
          className="flex size-8 items-center justify-center rounded-full border border-orange-300 bg-background text-foreground hover:bg-orange-100 hover:text-orange-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        >
          <MessageSquareTextIcon className="size-4" aria-hidden />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="end" sideOffset={8} collisionPadding={16} className="z-50">
            <Popover.Popup
              initialFocus={(interaction) => interaction === "keyboard"}
              className="w-80 max-w-[calc(100vw-2rem)] max-h-[min(32rem,var(--available-height))] overflow-y-auto rounded-xl border-2 border-orange-300 bg-popover p-5 text-popover-foreground shadow-xl outline-none [overflow-wrap:anywhere]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <Popover.Title className="text-sm font-semibold">{title}</Popover.Title>
                <Popover.Close aria-label="Close note" className="rounded p-1 hover:bg-muted focus-visible:outline-2 focus-visible:outline-orange-300">
                  <XIcon className="size-4" aria-hidden />
                </Popover.Close>
              </div>
              <div className="prose-lab min-w-0 text-sm leading-7 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
                {children}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
