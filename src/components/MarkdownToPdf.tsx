"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MarkdownPreview } from "./MarkdownPreview";

type Paper = "a4" | "letter";

// Self-contained typography for the generated PDF window, independent of app CSS.
const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; line-height: 1.6; }
  h1, h2, h3, h4 { font-weight: 700; line-height: 1.25; margin: 1.2em 0 0.5em; }
  h1 { font-size: 1.9rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; }
  p { margin: 0.6em 0; }
  a { color: #4f46e5; }
  ul, ol { margin: 0.6em 0; padding-left: 1.4em; }
  li { margin: 0.2em 0; }
  blockquote { margin: 0.8em 0; padding: 0.2em 1em; border-left: 4px solid #e5e7eb; color: #4b5563; }
  table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
  th, td { border: 1px solid #d1d5db; padding: 0.45em 0.7em; text-align: left; }
  th { background: #f3f4f6; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f3f4f6; padding: 0.1em 0.3em; border-radius: 4px; font-size: 0.9em; }
  pre { background: #f6f8fa; border: 1px solid #e5e7eb; padding: 0.9em 1em; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  img { max-width: 100%; }
`;

export function MarkdownToPdf() {
  const t = useTranslations("MdToPdf");
  const [md, setMd] = useState<string>(t("sampleContent"));
  const [paper, setPaper] = useState<Paper>("a4");
  const previewRef = useRef<HTMLDivElement>(null);

  const downloadPdf = () => {
    const html = previewRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${t(
        "docTitle"
      )}</title><style>@page{size:${paper};margin:18mm}${PRINT_CSS}</style></head><body>${html}</body></html>`
    );
    win.document.close();
    win.focus();
    // Give the new window a tick to lay out before opening the print dialog.
    setTimeout(() => win.print(), 300);
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">
              {t("editorLabel")}
            </span>
            <span className="text-xs text-slate-400">{md.length}</span>
          </div>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            placeholder={t("placeholder")}
            className="h-[60vh] w-full resize-none p-4 font-mono text-sm text-slate-800 outline-none"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">
              {t("previewLabel")}
            </span>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                {(["a4", "letter"] as Paper[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPaper(p)}
                    className={`rounded-md px-2.5 py-1 ${
                      paper === p ? "bg-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {t(p === "a4" ? "paperA4" : "paperLetter")}
                  </button>
                ))}
              </div>
              <button
                onClick={downloadPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("download")}
              </button>
            </div>
          </div>
          <div ref={previewRef} className="h-[60vh] overflow-auto p-5">
            <MarkdownPreview markdown={md} />
          </div>
        </div>
      </div>
    </div>
  );
}
