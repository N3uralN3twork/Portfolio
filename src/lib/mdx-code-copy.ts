import * as React from "react";

export function extractCopyableCode(
  children: React.ReactNode,
  rawCode?: unknown,
): string {
  if (typeof rawCode === "string" || typeof rawCode === "number") {
    return String(rawCode);
  }

  return extractRenderedText(children);
}

function extractRenderedText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractRenderedText).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractRenderedText(node.props.children);
  }

  return "";
}
