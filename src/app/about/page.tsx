import Image from "next/image";
import type { Metadata } from "next";
import { MailIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "About",
  description: profile.shortBio,
};

export default function AboutPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <aside className="flex flex-col gap-6">
        <Image
          src={profile.headshotPath}
          width={640}
          height={640}
          alt={`${profile.name} profile`}
          className="aspect-square rounded-lg border object-cover"
          priority
        />
        <a
          className={buttonVariants({ size: "lg" })}
          href={`mailto:${profile.email}`}
        >
          Start a conversation
          <MailIcon data-icon="inline-end" />
        </a>
      </aside>
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            About
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            {profile.shortBio}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.focus.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Working style</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            <p>
              I like systems where the data contract, statistical assumption,
              and runtime behavior can be inspected together.
            </p>
            <p>
              The portfolio is wired so posts and projects can include formulas,
              code, diagrams, and custom MDX components without a CMS.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
