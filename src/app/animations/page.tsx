import type { Metadata } from "next";
import { AnimationsClient } from "./animations-client";

export const metadata: Metadata = {
  title: "Animations",
  description:
    "A Motion for React animation that visualizes Bayesian updating in an A/B test.",
};

export default function AnimationsPage() {
  return <AnimationsClient />;
}
