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

  return (
    <div className="w-full">
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
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition",
          dragging
            ? "border-brand bg-indigo-50"
            : "border-slate-300 bg-white hover:border-brand/60",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          className="text-brand"
        >
          <path
            d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-base font-medium">
          {t(`dropTitle_${profile}`)}{" "}
          <span className="text-brand">{t("dropClickBrowse")}</span>
        </p>
        <p className="text-sm text-slate-500">
          {t(`dropSubtitle_${profile}`)}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={trySample}
          disabled={disabled || loadingSample}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand/60 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingSample ? tExamples("loadingSample") : tExamples("trySample")}
        </button>
      </div>

      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
