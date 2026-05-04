import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { ReadingProgress } from "@/components/reading-progress";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { buildSearchIndex } from "@/lib/content";
import { profile } from "@/lib/profile";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name} | Technical Portfolio`,
    template: `%s | ${profile.name}`,
  },
  description: profile.shortBio,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = await buildSearchIndex();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <ReadingProgress />
          <SiteHeader searchIndex={searchIndex} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>{profile.name} builds data, ML, and systems notes in public.</p>
              <div className="flex flex-wrap gap-4">
                {profile.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </footer>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
