import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";

const labRouteDir = path.join(process.cwd(), "src", "app", "lab");

describe("lab route", () => {
  test("uses a server page with a focused client island for interactive demos", async () => {
    const [page, client] = await Promise.all([
      readFile(path.join(labRouteDir, "page.tsx"), "utf8"),
      readFile(path.join(labRouteDir, "lab-client.tsx"), "utf8"),
    ]);

    expect(page).toContain("Decision Lab");
    expect(page).toContain("Systems Craft");
    expect(page).toContain("LabClient");
    expect(page).not.toContain('"use client"');
    expect(client).toContain('"use client"');
    expect(client).toContain("Latency Budget Simulator");
    expect(client).toContain("Pipeline Failure Drill");
    expect(client).toContain("Model Serving Tradeoff");
  });

  test("adds Lab as a top-level navigation item", async () => {
    const header = await readFile(
      path.join(process.cwd(), "src", "components", "site-header.tsx"),
      "utf8",
    );

    expect(header).toContain('{ label: "Lab", href: "/lab" }');
  });
});
