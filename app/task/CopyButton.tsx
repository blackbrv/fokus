"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copies `text`, or this page's URL when omitted. */
export function CopyButton({ text, label, variant = "default" }: { text?: string; label: string; variant?: "default" | "outline" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text ?? location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard blocked; the URL bar still works. */
    }
  };
  return (
    <Button variant={variant} onClick={copy} className="font-medium">
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}
