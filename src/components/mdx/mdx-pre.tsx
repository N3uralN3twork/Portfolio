"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractCopyableCode } from "@/lib/mdx-code-copy";

type MdxPreProps = React.ComponentPropsWithoutRef<"pre"> & {
  "data-raw-code"?: string;
};

export function MdxPre({
  children,
  "data-raw-code": rawCode,
  ...props
}: MdxPreProps) {
  const [copied, setCopied] = React.useState(false);
  const code = React.useMemo(
    () => extractCopyableCode(children, rawCode),
    [children, rawCode],
  );

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="group/code relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover/code:opacity-100 focus:opacity-100"
        aria-label={copied ? "Code copied" : "Copy code"}
        onClick={copyCode}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <pre {...props}>{children}</pre>
    </div>
  );
}
