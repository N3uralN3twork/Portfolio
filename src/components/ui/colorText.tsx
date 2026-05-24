"use client";

import type { CSSProperties, ReactNode } from "react";

type ColorProps = {
  value: CSSProperties["color"];
  children: ReactNode;
};

export const Color = ({ value, children }: ColorProps) => (
  <span style={{ color: value }}>{children}</span>
);
