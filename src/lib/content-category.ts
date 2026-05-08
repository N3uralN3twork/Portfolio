export const contentCategories = [
  "C++ / Systems",
  "Statistics",
  "ML Models",
  "Evaluation",
  "Data Systems",
  "Visualization",
  "Research Notes",
] as const;

export type ContentCategory = (typeof contentCategories)[number];

export function deriveContentCategory(tags: string[]): ContentCategory {
  const normalized = tags.map((tag) => tag.toLowerCase());
  const has = (...needles: string[]) =>
    normalized.some((tag) => needles.some((needle) => tag.includes(needle)));

  if (has("c++", "cpp", "systems", "low latency", "performance")) {
    return "C++ / Systems";
  }

  if (has("statistics", "sem", "lavaan")) {
    return "Statistics";
  }

  if (has("machine learning", "xgboost", "random forest", "ensembles", "model")) {
    return "ML Models";
  }

  if (has("evaluation", "llm", "retrieval", "a/b testing")) {
    return "Evaluation";
  }

  if (has("data-engineering", "streaming", "sql", "python")) {
    return "Data Systems";
  }

  if (has("visualization", "maps", "leaflet", "designs")) {
    return "Visualization";
  }

  return "Research Notes";
}
