"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const t = useTranslations("Converter");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          {t("dropTitleBefore")}{" "}
          <span className="text-brand">{t("dropClickBrowse")}</span>
        </p>
        <p className="text-sm text-slate-500">{t("dropSubtitle")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
