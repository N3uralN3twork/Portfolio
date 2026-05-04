import Image, { type StaticImageData } from "next/image";
import type { Metadata } from "next";
import {
  BriefcaseBusinessIcon,
  Code2Icon,
  DownloadIcon,
  FileTextIcon,
  GitPullRequestIcon,
  GraduationCapIcon,
  LinkIcon,
  MailIcon,
  SparklesIcon,
} from "lucide-react";
import {
  aboutIntro,
  accomplishments,
  contactLinks,
  experience,
  skillCategories,
  skills,
  type ContactLink,
  type ExperienceItem,
} from "@/lib/about";
import { profile } from "@/lib/profile";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "I am Matthias Quinn, a data scientist building production models, applied statistics workflows, and reliable data systems.",
};

const contactIcons = {
  github: GitPullRequestIcon,
  linkedin: LinkIcon,
  mail: MailIcon,
  resume: DownloadIcon,
} satisfies Record<ContactLink["icon"], typeof GitPullRequestIcon>;

const experienceIcons = {
  briefcase: BriefcaseBusinessIcon,
  graduation: GraduationCapIcon,
} satisfies Record<ExperienceItem["icon"], typeof BriefcaseBusinessIcon>;

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <IntroSection />
      <Separator />
      <ExperienceSection />
      <Separator />
      <SkillsSection />
      <Separator />
      <AccomplishmentsSection />
    </div>
  );
}

function IntroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {aboutIntro.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            {aboutIntro.headline}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {aboutIntro.body}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.focus.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {contactLinks.map((link) => {
            const Icon = contactIcons[link.icon];

            return (
              <a
                key={link.label}
                className={buttonVariants({
                  variant: link.icon === "mail" ? "default" : "outline",
                  size: "lg",
                })}
                href={link.href}
              >
                <Icon data-icon="inline-start" />
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <Image
          src={profile.headshotPath}
          width={760}
          height={760}
          alt={`${profile.name} standing outdoors`}
          className="aspect-[4/3] rounded-xl border object-cover shadow-sm"
          priority
        />
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr]">
      <SectionHeading
        eyebrow="Timeline"
        title="Work experience"
        description="A data-driven timeline that can grow as new roles, projects, and responsibilities are added."
      />

      <div className="motion-timeline-track relative flex flex-col gap-6 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-border">
        {experience.map((item, index) => {
          const Icon = experienceIcons[item.icon];

          return (
            <article
              key={`${item.role}-${item.dateRange}`}
              className="motion-reveal relative grid gap-4 pl-14"
              data-motion-delay={index % 3}
            >
              <div className="absolute left-0 top-1 grid size-10 place-items-center rounded-full border bg-background shadow-sm">
                <Icon className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-xl">{item.role}</CardTitle>
                      <CardDescription>
                        {item.organization} - {item.location}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{item.dateRange}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.summary}
                  </p>
                  <ul className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Skills"
        title="Technology I use"
        description="Core languages, modeling tools, and delivery skills."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {skillCategories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <div
                    key={skill.name}
                    className="flex min-h-20 items-center gap-3 rounded-lg border bg-background p-3"
                  >
                    <SkillIcon src={skill.iconSrc} name={skill.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {skill.strength}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SkillIcon({
  src,
  name,
}: {
  src?: StaticImageData | string;
  name: string;
}) {
  return (
    <div className="grid size-12 shrink-0 place-items-center rounded-lg border bg-card p-2">
      {src ? (
        <Image
          src={src}
          alt={`${name} logo`}
          className="max-h-8 w-auto object-contain"
        />
      ) : (
        <Code2Icon className="size-6 text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}

function AccomplishmentsSection() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeading
        eyebrow="Accomplishments"
        title="Selected resume highlights"
        description="Curated from the resume into concise outcomes and themes rather than copied bullet points."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {accomplishments.map((item) => (
          <Card key={item.title} className="h-full">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
                  <SparklesIcon
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.source}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background">
              <FileTextIcon
                className="size-5 text-muted-foreground"
                aria-hidden
              />
            </div>
            <div>
              <p className="font-medium">Curious? Checkout my latest resume!</p>
              <p className="text-sm text-muted-foreground">
                In PDF form too!
              </p>
            </div>
          </div>
          <a
            className={buttonVariants({ variant: "outline", size: "lg" })}
            href={profile.resumePath}
          >
            Open resume
            <DownloadIcon data-icon="inline-end" />
          </a>
        </CardContent>
      </Card>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">
        {title}
      </h2>
      <p className="leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
