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
  { code: "chi_sim", label: "ä¸­ć (çŽä˝)" },
  { code: "chi_tra", label: "ä¸­ć (çšéŤ)" },
  { code: "spa", label: "EspaĂąol" },
  { code: "fra", label: "FranĂ§ais" },
  { code: "deu", label: "Deutsch" },
  { code: "jpn", label: "ćĽćŹčŞ" },
  { code: "kor", label: "íęľ­ě´" },
  { code: "rus", label: "Đ ŃŃŃĐşĐ¸Đš" },
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
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-home-muted">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-home-md-bright">
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
        <label htmlFor="ocr-lang" className="text-zinc-600">
          {t("languageLabel")}
        </label>
        <select
          id="ocr-lang"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={status === "working"}
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-brand disabled:opacity-60"
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
          <div className="rounded-2xl border border-black/10 bg-home-white p-2 shadow-home">
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
                "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed px-6 py-12 text-center transition-colors",
                dragging
                  ? "border-brand bg-teal-50/60"
                  : "border-zinc-300 bg-white hover:border-zinc-400",
              ].join(" ")}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={`transition-transform ${
                  dragging ? "scale-110 text-brand" : "text-zinc-400"
                }`}
              >
                <path
                  d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="space-y-3">
                <p className="text-base font-medium text-zinc-900">{t("dropTitle")}</p>
                <span className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
                  {t("dropClickBrowse")}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {t("dropSubtitle")
                  .split("Âˇ")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((spec) => (
                    <span
                      key={spec}
                      className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600"
                    >
                      {spec}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
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
                  <span aria-hidden="true">â</span>
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
          </div>
          <p className="mt-2 text-center font-mono text-xs text-zinc-400">{t("modelNote")}</p>
          {status === "error" && errorMsg && (
            <p className="mt-2 text-center text-sm text-red-600">{errorMsg}</p>
          )}
        </>
      )}

      {(status === "working" || status === "done") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: original pages */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-home-paper shadow-sm">
            <div className="flex items-center justify-between border-b border-black/10 bg-home-paper-2 px-4 py-2.5">
              <span className="text-sm font-medium text-zinc-700">{t("paneOriginal")}</span>
              <span className="max-w-[60%] truncate font-mono text-xs text-zinc-400">{fileName}</span>
            </div>
            <div className="max-h-[60vh] overflow-auto p-3">
              {pages.length === 0 ? (
                <div className="flex min-h-[180px] items-center justify-center gap-3 text-zinc-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span className="font-mono text-xs">{t("rendering")} âŚ</span>
                </div>
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

          {/* Right: recognized Markdown */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-home-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-home-paper-2 px-4 py-2.5">
              <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 text-sm">
                <button
                  onClick={() => setTab("preview")}
                  className={`rounded px-3 py-1 ${
                    tab === "preview"
                      ? "bg-zinc-950 font-medium text-white"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {t("tabPreview")}
                </button>
                <button
                  onClick={() => setTab("source")}
                  className={`rounded px-3 py-1 ${
                    tab === "source"
                      ? "bg-zinc-950 font-medium text-white"
                      : "text-zinc-500 hover:text-zinc-800"
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
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    {t("actionNewFile")}
                  </button>
                </div>
              ) : (
                <span className="font-mono text-xs text-zinc-400">
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
              <div className="h-1 w-full bg-zinc-100">
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
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-zinc-700">
                    {markdown}
                  </pre>
                )
              ) : (
                <div className="flex min-h-[180px] items-center justify-center gap-3 text-zinc-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span className="font-mono text-xs">{t("recognizing")} âŚ</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
