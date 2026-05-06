import type { Metadata } from "next";
import { LabClient } from "./lab-client";

export const metadata: Metadata = {
  title: "Decision Lab",
  description:
    "Interactive systems craft demos for latency, data pipeline failures, and production model serving tradeoffs.",
};

export default function LabPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
          Systems Craft
        </p>
        <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Decision Lab
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Small production-minded demos for the choices that shape reliable data
          and machine learning systems: latency budgets, pipeline failures, and
          serving architecture tradeoffs.
        </p>
      </header>

      <LabClient />
    </div>
  );
}
