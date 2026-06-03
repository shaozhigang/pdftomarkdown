"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ResultActionsProps {
  markdown: string;
  fileName: string;
}

export function ResultActions({ markdown, fileName }: ResultActionsProps) {
  const t = useTranslations("Converter");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={copy}
        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
      >
        {copied ? t("actionCopied") : t("actionCopy")}
      </button>
      <button
        onClick={download}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {t("actionDownload")}
      </button>
    </div>
  );
}
