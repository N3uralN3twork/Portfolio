import Link from "next/link";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SearchIndexItem } from "@/lib/content";
import { profile } from "@/lib/profile";

const navItems = [
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
];

export function SiteHeader({ searchIndex }: { searchIndex: SearchIndexItem[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border bg-card font-mono text-sm font-semibold">
            MQ
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-medium">{profile.name}</span>
            <span className="text-xs text-muted-foreground">Research portfolio</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CommandMenu items={searchIndex} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
