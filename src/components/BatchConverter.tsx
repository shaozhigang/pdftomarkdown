"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MarkdownPreview } from "./MarkdownPreview";
import { ResultActions } from "./ResultActions";
import { convertPdfToMarkdown } from "@/lib/converter";
import type { ConvertResult } from "@/lib/types";

type ItemStatus = "queued" | "working" | "done" | "error";
type Tab = "preview" | "source";

interface BatchItem {
  id: string;
  name: string;
  status: ItemStatus;
  markdown?: string;
  result?: ConvertResult;
  error?: string;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const SAMPLES = [
  "/samples/demo-article.pdf",
  "/samples/demo-table.pdf",
  "/samples/demo-notes.pdf",
];

function mdName(name: string) {
  return name.replace(/\.pdf$/i, "") + ".md";
}

export function BatchConverter() {
  const t = useTranslations("Batch");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("preview");
  const [dragging, setDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const converting = items.some((i) => i.status === "working" || i.status === "queued");
  const doneCount = items.filter((i) => i.status === "done").length;
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const update = useCallback((id: string, patch: Partial<BatchItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const processFile = useCallback(
    async (id: string, file: File) => {
      update(id, { status: "working" });
      try {
        const buffer = await file.arrayBuffer();
        const res = await convertPdfToMarkdown(buffer, {
          profile: "general",
          fileName: file.name,
        });
        update(id, { status: "done", markdown: res.markdown, result: res });
      } catch (err) {
        update(id, {
          status: "error",
          error: err instanceof Error ? err.message : t("errorFailed"),
        });
      }
    },
    [t, update]
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter(
        (f) =>
          (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) &&
          f.size <= MAX_SIZE
      );
      if (valid.length === 0) return;

      const newItems: { item: BatchItem; file: File }[] = valid.map((file) => ({
        item: {
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          name: file.name,
          status: "queued" as ItemStatus,
        },
        file,
      }));

      setItems((prev) => [...prev, ...newItems.map((n) => n.item)]);
      setSelectedId((cur) => cur ?? newItems[0].item.id);

      // Convert sequentially to keep memory in check.
      for (const { item, file } of newItems) {
        await processFile(item.id, file);
      }
    },
    [processFile]
  );

  const onInput = (fileList: FileList | null) => {
    if (fileList) addFiles(Array.from(fileList));
  };

  const trySamples = useCallback(async () => {
    try {
      const files = await Promise.all(
        SAMPLES.map(async (path) => {
          const res = await fetch(path);
          const blob = await res.blob();
          return new File([blob], path.split("/").pop() as string, {
            type: "application/pdf",
          });
        })
      );
      addFiles(files);
    } catch {
      /* ignore sample errors */
    }
  }, [addFiles]);

  const downloadZip = useCallback(async () => {
    const ready = items.filter((i) => i.status === "done" && i.markdown);
    if (ready.length === 0) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Map<string, number>();
      for (const it of ready) {
        let name = mdName(it.name);
        const n = used.get(name) ?? 0;
        used.set(name, n + 1);
        if (n > 0) name = name.replace(/\.md$/, `-${n}.md`);
        zip.file(name, it.markdown as string);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pdf-to-markdown.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }, [items]);

  const clearAll = () => {
    setItems([]);
    setSelectedId(null);
  };

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

      {items.length === 0 ? (
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
              onInput(e.dataTransfer.files);
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
                  trySamples();
                }}
                className="inline-flex items-center gap-1 font-medium text-brand hover:text-brand-dark hover:underline"
              >
                {t("trySamples")}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={(e) => onInput(e.target.files)}
            />
          </div>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: queue */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">
                {t("filesCount", { done: doneCount, total: items.length })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {t("addMore")}
                </button>
                <button
                  onClick={clearAll}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {t("clear")}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => onInput(e.target.files)}
                />
              </div>
            </div>
            <ul className="max-h-[52vh] divide-y divide-slate-100 overflow-auto">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => setSelectedId(it.id)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 ${
                      selectedId === it.id ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <StatusIcon status={it.status} />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {it.name}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {it.status === "done" && it.result
                        ? t("pagesShort", { pages: it.result.stats.pages })
                        : t(`status_${it.status}`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-3">
              <button
                onClick={downloadZip}
                disabled={doneCount === 0 || zipping}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {zipping
                  ? t("zipping")
                  : t("downloadZip", { count: doneCount })}
              </button>
              {converting && (
                <p className="mt-2 text-center text-xs text-slate-400">
                  {t("convertingHint")}
                </p>
              )}
            </div>
          </div>

          {/* Right: preview of selected file */}
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
              {selected?.status === "done" && selected.markdown && (
                <ResultActions markdown={selected.markdown} fileName={selected.name} />
              )}
            </div>
            <div className="max-h-[52vh] flex-1 overflow-auto p-5">
              {selected?.status === "done" && selected.markdown ? (
                tab === "preview" ? (
                  <MarkdownPreview markdown={selected.markdown} />
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                    {selected.markdown}
                  </pre>
                )
              ) : selected?.status === "error" ? (
                <p className="text-sm text-red-600">
                  {t("errorFailed")}: {selected.error}
                </p>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center gap-3 text-slate-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <span className="text-sm">{t("converting")} …</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "done") {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m5 13 4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  if (status === "working") {
    return (
      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-200" />;
}
