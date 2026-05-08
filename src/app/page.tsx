import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  Code2Icon,
  DatabaseIcon,
  DownloadIcon,
  GaugeIcon,
  MailIcon,
  PencilRulerIcon,
  RocketIcon,
  SigmaIcon,
  UsersIcon,
} from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { HeroVisual } from "@/components/hero-visual";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { getAllContent } from "@/lib/content";
import {
  howIWorkStages,
  roleFitItems,
  type HowIWorkStage,
  type RoleFitItem,
} from "@/lib/home";
import { profile } from "@/lib/profile";

const roleFitIcons = {
  database: DatabaseIcon,
  gauge: GaugeIcon,
  sigma: SigmaIcon,
  book: BookOpenIcon,
} satisfies Record<RoleFitItem["icon"], typeof DatabaseIcon>;

const workStageIcons = {
  clipboard: ClipboardCheckIcon,
  users: UsersIcon,
  drafting: PencilRulerIcon,
  code: Code2Icon,
  rocket: RocketIcon,
  activity: ActivityIcon,
} satisfies Record<HowIWorkStage["icon"], typeof ClipboardCheckIcon>;

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

      <RoleFitSection />

      <Separator />

      <HowIWorkSection />

      <Separator />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">
              Featured research and systems work
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Selected case studies and technical notes on ML, statistics, and
              low-latency systems.
            </p>
          </div>
          <Link
            href="/writing"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
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

function RoleFitSection() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          Role fit
        </p>
        <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          Where I do my best work.
        </h2>
        <p className="text-lg leading-8 text-muted-foreground">
          I am strongest in hybrid roles where data science, model behavior,
          applied statistics, systems thinking, and continuous learning all have
          to meet in production.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roleFitItems.map((item) => {
          const Icon = roleFitIcons[item.icon];

          return (
            <Card key={item.title} className="h-full">
              <CardHeader className="gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-10 place-items-center rounded-lg border bg-background">
                    <Icon className="size-5 text-muted-foreground" aria-hidden />
                  </div>
                  <Badge variant="secondary" className="text-[0.68rem]">
                    {item.signal}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl tracking-normal">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="leading-6">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function HowIWorkSection() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          How I work
        </p>
        <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          I treat learning as one of my top goals.
        </h2>
        <p className="leading-7 text-muted-foreground">
          The goal is to ship useful systems, then keep learning from their behavior.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          {howIWorkStages.map((stage, index) => {
            const Icon = workStageIcons[stage.icon];
            const isLast = index === howIWorkStages.length - 1;

            return (
              <div
                key={stage.title}
                className="relative rounded-lg border bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg border bg-card">
                      <Icon
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                    <p className="font-medium">{stage.title}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {stage.description}
                </p>
                {isLast ? (
                  <Badge variant="secondary" className="mt-4">
                    feeds the next pass
                  </Badge>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
