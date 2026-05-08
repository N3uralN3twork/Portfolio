export type RoleFitItem = {
  title: string;
  description: string;
  signal: string;
  icon: "database" | "gauge" | "sigma" | "book";
};

export type HowIWorkStage = {
  title: string;
  description: string;
  icon: "clipboard" | "users" | "drafting" | "code" | "rocket" | "activity";
};

export const roleFitItems: RoleFitItem[] = [
  {
    title: "Production Data Science",
    description:
      "I like turning ambiguous operational questions into measured workflows, usable model outputs, and decisions people can inspect.",
    signal: "Data science with deployment gravity",
    icon: "database",
  },
  {
    title: "Model Building & Evaluation",
    description:
      "I enjoy building models, evaluation harnesses, and monitoring views that make model behavior easier to compare and trust.",
    signal: "Model quality, not leaderboard theater",
    icon: "gauge",
  },
  {
    title: "Low-Latency Data Systems",
    description:
      "I am drawn to hot paths, fast feedback loops, C++ performance work, and systems where latency changes the product experience.",
    signal: "Performance-aware implementation",
    icon: "sigma",
  },
  {
    title: "Applied Research & Statistics",
    description:
      "I like learning new domains, working through statistical assumptions, and translating research questions into practical evidence.",
    signal: "Curious, careful, domain-first",
    icon: "book",
  },
];

export const howIWorkStages: HowIWorkStage[] = [
  {
    title: "Gather requirements",
    description:
      "Start by naming the decision, constraint, audience, and failure mode before touching the implementation.",
    icon: "clipboard",
  },
  {
    title: "Learn from SMEs",
    description:
      "Use experienced subject matter experts to understand edge cases, vocabulary, and what would make the result useful.",
    icon: "users",
  },
  {
    title: "Design the solution",
    description:
      "Choose a small architecture, data contract, and evaluation plan that can survive real use instead of only a demo.",
    icon: "drafting",
  },
  {
    title: "Implement",
    description:
      "Build the simplest version that proves the shape, then harden the parts that sit on the critical path.",
    icon: "code",
  },
  {
    title: "Deploy",
    description:
      "Ship with the operational hooks needed to debug inputs, outputs, model behavior, and user-facing latency.",
    icon: "rocket",
  },
  {
    title: "Monitor",
    description:
      "Watch the system after launch so drift, latency, and user feedback inform the next requirement pass.",
    icon: "activity",
  },
];
