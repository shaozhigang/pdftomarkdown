"use client";

import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { MarkdownPreview } from "./MarkdownPreview";
import { ResultActions } from "./ResultActions";
import { convertPdfToMarkdown } from "@/lib/converter";
import type { ConvertResult } from "@/lib/types";

type Tab = "preview" | "source";

export function Converter() {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle"
  );
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [tab, setTab] = useState<Tab>("preview");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = async (file: File) => {
    setStatus("working");
    setFileName(file.name);
    setResult(null);
    setErrorMsg("");
    try {
      const buffer = await file.arrayBuffer();
      const res = await convertPdfToMarkdown(buffer);
      setResult(res);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setFileName("");
  };

  return (
    <div className="w-full">
      {status === "idle" && <Dropzone onFile={handleFile} />}

      {status === "working" && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-14">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span className="text-slate-600">
            Parsing locally{" "}
            <span className="font-medium">{fileName}</span> …
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-red-700">Conversion failed: {errorMsg}</p>
          <button
            onClick={reset}
            className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          >
            Choose another file
          </button>
        </div>
      )}

      {status === "done" && result && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
                <button
                  onClick={() => setTab("preview")}
                  className={`rounded-md px-3 py-1 ${
                    tab === "preview" ? "bg-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setTab("source")}
                  className={`rounded-md px-3 py-1 ${
                    tab === "source" ? "bg-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Source
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {result.stats.pages} pages · {result.stats.durationMs} ms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ResultActions markdown={result.markdown} fileName={fileName} />
              <button
                onClick={reset}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                New file
              </button>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              {result.warnings.join(" ")}
            </div>
          )}

          <div className="max-h-[60vh] overflow-auto p-5">
            {tab === "preview" ? (
              <MarkdownPreview markdown={result.markdown} />
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                {result.markdown}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
