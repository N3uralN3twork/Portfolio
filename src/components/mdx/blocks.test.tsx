import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SideBySide } from "./blocks";

describe("SideBySide", () => {
  it("uses one equal desktop grid track for each panel", () => {
    const html = renderToStaticMarkup(
      <SideBySide>
        <SideBySide.Panel title="Question">Question copy</SideBySide.Panel>
        <SideBySide.Panel title="Object">Object copy</SideBySide.Panel>
        <SideBySide.Panel title="Output">Output copy</SideBySide.Panel>
      </SideBySide>,
    );

    expect(html).toContain("--side-by-side-columns:3");
    expect(html).toContain(
      "md:grid-cols-[repeat(var(--side-by-side-columns),minmax(0,1fr))]",
    );
  });

  it("lets authors override the inferred column count", () => {
    const html = renderToStaticMarkup(
      <SideBySide columns={4}>
        <SideBySide.Panel title="Alpha">Alpha copy</SideBySide.Panel>
        <SideBySide.Panel title="Beta">Beta copy</SideBySide.Panel>
      </SideBySide>,
    );

    expect(html).toContain("--side-by-side-columns:4");
  });

  it("sizes panel images for the active column count", () => {
    const html = renderToStaticMarkup(
      <SideBySide>
        <SideBySide.Panel
          title="Image"
          imageSrc="/images/MFA-AAPL-Stock-Price.png"
          imageAlt="Apple stock price"
        >
          Image copy
        </SideBySide.Panel>
        <SideBySide.Panel title="Object">Object copy</SideBySide.Panel>
        <SideBySide.Panel title="Output">Output copy</SideBySide.Panel>
      </SideBySide>,
    );

    expect(html).toContain(
      'sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"',
    );
  });
});
