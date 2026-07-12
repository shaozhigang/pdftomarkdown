"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dropzone } from "./Dropzone";
import { MarkdownPreview } from "./MarkdownPreview";
import { convertPdfToWord, type WordConvertResult } from "@/lib/word/convert";
import { renderPdfPages, type RenderedPage } from "@/lib/pdf/render";

export function PdfToWord() {
  const t = useTranslations("PdfToWord");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<WordConvertResult | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [fileName, setFileName] = useState("");
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

      renderPdfPages(renderBuffer)
        .then(setPages)
        .catch((err) => console.error("preview render failed", err));

      const res = await convertPdfToWord(buffer, { fileName: file.name });
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

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const warningText = (code: string) =>
    code === "warningNoText" ? t("warningNoText") : code;

  return (
    <div className="w-full">
      <PrivacyBadge label={t("privacyBadge")} />

      {status === "idle" && <Dropzone onFile={handleFile} profile="general" />}

      {status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-red-700">
            {t("conversionFailed")}: {errorMsg}
          </p>
          <button
            onClick={reset}
            className="mt-3 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            {t("chooseAnother")}
          </button>
        </div>
      )}

      {(status === "working" || status === "done") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: original PDF */}
          <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
              <span className="text-sm font-medium text-zinc-700">
                {t("paneOriginal")}
              </span>
              <span className="max-w-[60%] truncate font-mono text-xs text-zinc-400">
                {fileName}
              </span>
            </div>
            <div className="max-h-[60vh] overflow-auto p-3">
              {pages.length === 0 ? (
                <PaneSkeleton label={t("statusParsing")} />
              ) : (
                <div className="space-y-3">
                  {pages.map((p) => (
                    <img
                      key={p.pageNumber}
                      src={p.dataUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="mx-auto w-full rounded border border-zinc-200 bg-white shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Word result */}
          <div className="flex flex-col overflow-hidden rounded-md border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-700">
                  {t("previewLabel")}
                </span>
                {result && (
                  <span className="hidden font-mono text-xs text-zinc-400 sm:inline">
                    {t("statsInfo", {
                      pages: result.stats.pages,
                      ms: result.stats.durationMs,
                    })}
                  </span>
                )}
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={download}
                    className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {t("actionDownload")}
                  </button>
                  <button
                    onClick={reset}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
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
                <PaneSkeleton label={t("statusParsing")} />
              ) : (
                <MarkdownPreview markdown={result.markdownPreview} />
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
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-brand"
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
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-zinc-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span className="font-mono text-xs">{label} …</span>
    </div>
  );
}
