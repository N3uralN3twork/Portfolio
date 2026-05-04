"use client";

import * as React from "react";
import { FileTextIcon, FolderKanbanIcon, HomeIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { SearchIndexItem } from "@/lib/content";

const staticItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Work", href: "/work", icon: FolderKanbanIcon },
  { label: "Writing", href: "/writing", icon: FileTextIcon },
  { label: "About", href: "/about", icon: UserIcon },
];

export function CommandMenu({ items }: { items: SearchIndexItem[] }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Search
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search portfolio"
        description="Navigate pages, projects, and technical notes."
      >
        <Command>
          <CommandInput placeholder="Search work, writing, or pages..." />
          <CommandList>
            <CommandEmpty>No matching result.</CommandEmpty>
            <CommandGroup heading="Pages">
              {staticItems.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.href}`}
                  onSelect={() => goTo(item.href)}
                >
                  <item.icon />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Content">
              {items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.title} ${item.summary} ${item.tags.join(" ")}`}
                  onSelect={() => goTo(item.href)}
                >
                  {item.kind === "work" ? <FolderKanbanIcon /> : <FileTextIcon />}
                  <span className="truncate">{item.title}</span>
                  <CommandShortcut>{item.kind}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
