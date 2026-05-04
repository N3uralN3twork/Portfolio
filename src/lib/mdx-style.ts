import type * as React from "react";

export function parseMdxStyleString(
  style: string,
): React.CSSProperties | undefined {
  const entries = style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => declaration.split(":"))
    .filter((parts) => parts.length >= 2)
    .map(([property, ...valueParts]) => [
      toCamelCase(property.trim()),
      valueParts.join(":").trim(),
    ]);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

export function normalizeMdxStyleAttributes(source: string): string {
  return source.replace(
    /\sstyle=(["'])([^"']*)\1/g,
    (_match, _quote: string, style: string) => {
      const expression = styleStringToJsxObjectExpression(style);

      return expression ? ` style={{ ${expression} }}` : "";
    },
  );
}

function styleStringToJsxObjectExpression(style: string): string | undefined {
  const entries = Object.entries(parseMdxStyleString(style) ?? {});

  if (entries.length === 0) {
    return undefined;
  }

  return entries
    .map(([property, value]) => `${property}: ${JSON.stringify(value)}`)
    .join(", ");
}

function toCamelCase(property: string): string {
  return property.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}
