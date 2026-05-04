---
title: A small harness for LLM regression tests
summary: Designing an evaluation loop that treats prompts, datasets, and model settings as versioned artifacts.
date: "2026-01-27"
tags:
  - llms
  - evaluation
  - python
links:
  - label: Harness sketch
    href: https://github.com/
featured: false
difficulty: easy
readingTime: 6 min read
type: writing
status: published
---

LLM evaluation should feel closer to database migration testing than dashboard vibes. A prompt change is a code change, and a model setting change is a runtime change.

<Equation expression="score = accuracy - \lambda \cdot latency_{p95}" />

The harness I like for early projects has four tables: test cases, expected behaviors, model runs, and human adjudications. That shape keeps the system honest without pretending every answer has a single canonical string.

```ts
type EvalCase = {
  id: string;
  prompt: string;
  rubric: string[];
  expectedFailureModes: string[];
};
```

<LinkCard title="Related project" href="/work/retrieval-evaluation-lab">
See the retrieval evaluation lab for a project-shaped version of this workflow.
</LinkCard>
