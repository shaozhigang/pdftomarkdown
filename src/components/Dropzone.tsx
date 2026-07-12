"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEMO_FILE_NAME_BY_PROFILE,
  DEMO_PDF_BY_PROFILE,
} from "@/lib/examples";
import type { ConvertProfile } from "@/lib/types";

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  profile?: ConvertProfile;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function Dropzone({
  onFile,
  disabled,
  profile = "general",
}: DropzoneProps) {
  const t = useTranslations("Converter");
  const tExamples = useTranslations("Examples");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setError(t("errorNotPdf"));
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(t("errorTooLarge"));
        return;
      }
      onFile(file);
    },
    [onFile, t]
  );

  const trySample = useCallback(async () => {
    if (disabled || loadingSample) return;
    setError(null);
    setLoadingSample(true);
    try {
      const path = DEMO_PDF_BY_PROFILE[profile];
      const name = DEMO_FILE_NAME_BY_PROFILE[profile];
      const res = await fetch(path);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const file = new File([blob], name, { type: "application/pdf" });
      onFile(file);
    } catch {
      setError(tExamples("errorSampleLoad"));
    } finally {
      setLoadingSample(false);
    }
  }, [disabled, loadingSample, onFile, profile, tExamples]);

  const specs = t(`dropSubtitle_${profile}`)
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="w-full">
      <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled)
              inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (disabled) return;
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={[
            "flex flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragging
              ? "border-brand bg-teal-50/60"
              : "border-zinc-300 bg-white hover:border-zinc-400",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
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
            <p className="text-base font-medium text-zinc-900">
              {t(`dropTitle_${profile}`)}
            </p>
            <span className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
              {t("dropClickBrowse")}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {specs.map((spec) => (
              <span
                key={spec}
                className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <span>{tExamples("samplePrompt")}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                trySample();
              }}
              disabled={disabled || loadingSample}
              className="inline-flex items-center gap-1 font-medium text-brand transition hover:text-brand-dark hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSample
                ? tExamples("loadingSample")
                : tExamples("trySample")}
              {!loadingSample && <span aria-hidden="true">→</span>}
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

      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
