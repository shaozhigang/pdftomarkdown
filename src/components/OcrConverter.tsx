"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MarkdownPreview } from "./MarkdownPreview";
import { ResultActions } from "./ResultActions";
import { renderPdfPages, type RenderedPage } from "@/lib/pdf/render";
import { ocrImagesToMarkdown, type OcrProgress } from "@/lib/ocr";

type Status = "idle" | "working" | "done" | "error";
type Tab = "preview" | "source";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const SAMPLE_PDF = "/samples/demo-article.pdf";

const LANGUAGES: { code: string; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "chi_sim", label: "中文 (简体)" },
  { code: "chi_tra", label: "中文 (繁體)" },
  { code: "spa", label: "Español" },
  { code: "fra", label: "Français" },
  { code: "deu", label: "Deutsch" },
  { code: "jpn", label: "日本語" },
  { code: "kor", label: "한국어" },
  { code: "rus", label: "Русский" },
];

export function OcrConverter() {
  const t = useTranslations("Ocr");
  const [status, setStatus] = useState<Status>("idle");
  const [lang, setLang] = useState("eng");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [markdown, setMarkdown] = useState("");
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [fileName, setFileName] = useState("");
  const [tab, setTab] = useState<Tab>("preview");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useCallback(
    async (file: File) => {
      setStatus("working");
      setFileName(file.name);
      setPages([]);
      setMarkdown("");
      setProgress(null);
      setErrorMsg("");
      try {
        const buffer = await file.arrayBuffer();
        const rendered = await renderPdfPages(buffer);
        setPages(rendered);
        if (rendered.length === 0) throw new Error(t("errorNoPages"));

        const images = rendered.map((p) => p.dataUrl);
        const md = await ocrImagesToMarkdown(images, lang, {
          onProgress: setProgress,
          onPartial: setMarkdown,
        });
        setMarkdown(md);
        setStatus("done");
      } catch (err) {
        console.error(err);
        setErrorMsg(err instanceof Error ? err.message : t("errorFailed"));
        setStatus("error");
      }
    },
    [lang, t]
  );

  const handleFile = useCallback(
    (file: File | undefined) => {
      setErrorMsg("");
      if (!file) return;
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMsg(t("errorNotPdf"));
        setStatus("error");
        return;
      }
      if (file.size > MAX_SIZE) {
        setErrorMsg(t("errorTooLarge"));
        setStatus("error");
        return;
      }
      run(file);
    },
    [run, t]
  );

  const trySample = useCallback(async () => {
    try {
      const res = await fetch(SAMPLE_PDF);
      const blob = await res.blob();
      run(new File([blob], "scanned-sample.pdf", { type: "application/pdf" }));
    } catch {
      setErrorMsg(t("errorFailed"));
      setStatus("error");
    }
  }, [run, t]);

  const reset = () => {
    setStatus("idle");
    setPages([]);
    setMarkdown("");
    setProgress(null);
    setFileName("");
  };

  const pct = progress ? Math.round(progress.progress * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
          {t("privacyBadge")}
        </span>
      </div>

      {/* Language selector */}
      <div className="mb-3 flex items-center justify-center gap-2 text-sm">
        <label htmlFor="ocr-lang" className="text-slate-600">
          {t("languageLabel")}
        </label>
        <select
          id="ocr-lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={status === "working"}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-brand disabled:opacity-60"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {(status === "idle" || status === "error") && (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={[
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition",
              dragging
                ? "border-brand bg-indigo-50"
                : "border-slate-300 bg-white hover:border-brand/60",
            ].join(" ")}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-brand">
              <path
                d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-base font-medium">
              {t("dropTitle")} <span className="text-brand">{t("dropClickBrowse")}</span>
            </p>
            <p className="text-sm text-slate-500">{t("dropSubtitle")}</p>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <span>{t("samplePrompt")}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  trySample();
                }}
                className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-dark hover:underline"
              >
                {t("trySample")}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">{t("modelNote")}</p>
          {status === "error" && errorMsg && (
            <p className="mt-2 text-center text-sm text-red-600">{errorMsg}</p>
          )}
        </>
      )}

      {(status === "working" || status === "done") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: original pages */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">{t("paneOriginal")}</span>
              <span className="max-w-[60%] truncate text-xs text-slate-400">{fileName}</span>
            </div>
            <div className="max-h-[60vh] overflow-auto p-3">
              {pages.length === 0 ? (
                <div className="flex min-h-[180px] items-center justify-center gap-3 text-slate-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span className="text-sm">{t("rendering")} …</span>
                </div>
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

          {/* Right: recognized Markdown */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
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
              {status === "done" ? (
                <div className="flex items-center gap-2">
                  <ResultActions markdown={markdown} fileName={fileName} />
                  <button
                    onClick={reset}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {t("actionNewFile")}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  {progress
                    ? t("ocrProgress", {
                        page: progress.page,
                        total: progress.totalPages,
                        pct,
                      })
                    : t("rendering")}
                </span>
              )}
            </div>

            {status === "working" && (
              <div className="h-1 w-full bg-slate-100">
                <div
                  className="h-1 bg-brand transition-all"
                  style={{
                    width: progress
                      ? `${Math.round(
                          ((progress.page - 1 + progress.progress) /
                            progress.totalPages) *
                            100
                        )}%`
                      : "0%",
                  }}
                />
              </div>
            )}

            <div className="max-h-[60vh] flex-1 overflow-auto p-5">
              {markdown ? (
                tab === "preview" ? (
                  <MarkdownPreview markdown={markdown} />
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                    {markdown}
                  </pre>
                )
              ) : (
                <div className="flex min-h-[180px] items-center justify-center gap-3 text-slate-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span className="text-sm">{t("recognizing")} …</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
