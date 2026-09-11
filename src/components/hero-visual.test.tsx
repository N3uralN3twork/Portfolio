import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroVisual } from "./hero-visual";

describe("HeroVisual", () => {
  it("renders an explicitly illustrative, keyboard-operable quality loop", () => {
    const html = renderToStaticMarkup(<HeroVisual />);

    expect(html).toContain("Interactive illustrative ML quality pipeline");
    expect(html).toContain("illustrative telemetry");
    expect(html).toContain("Pause guided pipeline animation");
    expect(html).toContain("Incoming events");
    expect(html).toContain("Quality gate stage: guarded");
    expect(html).toContain("Feature plane stage: fresh");
    expect(html).toContain("Model serving stage: within budget");
    expect(html).toContain("Decision signal stage: inspectable");
    expect(html).toContain("aria-pressed");
    expect(html).toContain("sample event rate");
  });
});
