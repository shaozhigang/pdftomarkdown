"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dropzone } from "./Dropzone";
import { MarkdownPreview } from "./MarkdownPreview";
import { ResultActions } from "./ResultActions";
import { convertPdfToMarkdown } from "@/lib/converter";
import { renderPdfPages, type RenderedPage } from "@/lib/pdf/render";
import type { ConvertProfile, ConvertResult } from "@/lib/types";

type Tab = "preview" | "source";

interface ConverterProps {
  profile?: ConvertProfile;
}

export function Converter({ profile = "general" }: ConverterProps) {
  const t = useTranslations("Converter");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [fileName, setFileName] = useState("");
  const [tab, setTab] = useState<Tab>("preview");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = async (file: File) => {
    setStatus("working");
    setFileName(file.name);
    setResult(null);
    setPages([]);
    setErrorMsg("");
    try {
      const buffer = await file.arrayBuffer();
      // pdf.js detaches buffers it consumes, so give each path its own copy.
      const renderBuffer = buffer.slice(0);

      // Render the original pages in parallel — show them the moment they're ready.
      renderPdfPages(renderBuffer)
        .then(setPages)
        .catch((err) => console.error("preview render failed", err));

      const res = await convertPdfToMarkdown(buffer, {
        profile,
        fileName: file.name,
      });
      setResult(res);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : t("conversionFailed"));
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setPages([]);
    setFileName("");
  };

  const warningText = (code: string) => {
    if (code === "warningNoText") return t("warningNoText");
    if (code === "warningNoTables") return t("warningNoTables");
    return code;
  };

  return (
    <div className="w-full">
      <PrivacyBadge label={t("privacyBadge")} />

      {status === "idle" && <Dropzone onFile={handleFile} profile={profile} />}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-red-700">
            {t("conversionFailed")}: {errorMsg}
          </p>
          <button
            onClick={reset}
            className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            {t("chooseAnother")}
          </button>
        </div>
      )}

      {(status === "working" || status === "done") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: original PDF */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">
                {t("paneOriginal")}
              </span>
              <span className="max-w-[60%] truncate text-xs text-slate-400">
                {fileName}
              </span>
            </div>
            <div className="max-h-[60vh] overflow-auto p-3">
              {pages.length === 0 ? (
                <PaneSkeleton label={t(`statusParsing_${profile}`)} />
              ) : (
                <div className="space-y-3">
                  {pages.map((p) => (
                    <img
                      key={p.pageNumber}
                      src={p.dataUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="mx-auto w-full rounded-md border border-slate-200 bg-white shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Markdown result */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
                  <button
                    onClick={() => setTab("preview")}
                    className={`rounded-md px-3 py-1 ${
                      tab === "preview" ? "bg-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {t("tabPreview")}
                  </button>
                  <button
                    onClick={() => setTab("source")}
                    className={`rounded-md px-3 py-1 ${
                      tab === "source" ? "bg-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {t("tabSource")}
                  </button>
                </div>
                {result && (
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    {profile === "table"
                      ? t("statsTables", {
                          pages: result.stats.pages,
                          tables: result.stats.tables,
                          ms: result.stats.durationMs,
                        })
                      : t("statsInfo", {
                          pages: result.stats.pages,
                          ms: result.stats.durationMs,
                        })}
                  </span>
                )}
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <ResultActions markdown={result.markdown} fileName={fileName} />
                  <button
                    onClick={reset}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {t("actionNewFile")}
                  </button>
                </div>
              )}
            </div>

            {result && result.warnings.length > 0 && (
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                {result.warnings.map(warningText).join(" ")}
              </div>
            )}

            <div className="max-h-[60vh] flex-1 overflow-auto p-5">
              {!result ? (
                <PaneSkeleton label={t(`statusParsing_${profile}`)} />
              ) : tab === "preview" ? (
                <MarkdownPreview markdown={result.markdown} />
              ) : (
                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                  {result.markdown}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrivacyBadge({ label }: { label: string }) {
  return (
    <div className="mb-4 flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </span>
    </div>
  );
}

function PaneSkeleton({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span className="text-sm">{label} …</span>
    </div>
  );
}
