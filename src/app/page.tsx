import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, MailIcon } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { HeroVisual } from "@/components/hero-visual";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { getAllContent } from "@/lib/content";
import { profile } from "@/lib/profile";

export default async function Home() {
  const entries = await getAllContent();
  const featured = entries.filter((entry) => entry.meta.featured).slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="motion-reveal flex flex-col gap-8">
          <div className="flex flex-wrap gap-2">
            {profile.focus.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal sm:text-6xl">
              Data systems, ML experiments, and statistical notes with low
              latency instincts.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {profile.shortBio}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonVariants({ size: "lg" })} href="/work">
              View work
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <a
              className={buttonVariants({ variant: "outline", size: "lg" })}
              href={`mailto:${profile.email}`}
            >
              Contact
              <MailIcon data-icon="inline-end" />
            </a>
            <a
              className={buttonVariants({ variant: "ghost", size: "lg" })}
              href={profile.resumePath}
            >
              Resume
              <DownloadIcon data-icon="inline-end" />
            </a>
          </div>
        </div>
        <div className="motion-reveal" data-motion-delay="1">
          <HeroVisual />
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">
              Featured research and systems work
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Seeded examples show the intended shape: case studies, math-heavy
              notes, code, and reproducible evaluation thinking.
            </p>
          </div>
          <Link href="/writing" className="inline-flex items-center gap-2 text-sm font-medium">
            Browse writing
            <ArrowRightIcon aria-hidden />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((entry, index) => (
            <div
              key={entry.href}
              className="motion-reveal motion-card-lift"
              data-motion-delay={index % 3}
            >
              <ContentCard entry={entry} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
