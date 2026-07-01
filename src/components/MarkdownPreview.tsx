"use client";

import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown strips `data:` URLs by default, which hides the inline
// base64 images produced by the "with images" converter. Allow data:image/*
// (from our own local conversion) while keeping the default sanitization for
// everything else.
function urlTransform(url: string): string {
  if (url.startsWith("data:image/")) return url;
  return defaultUrlTransform(url);
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="prose-md max-w-none text-sm text-slate-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={urlTransform}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
