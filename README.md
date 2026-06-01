# PDF to Markdown

一个**本地优先(local-first)**的 PDF → Markdown 转换工具:文件全程在浏览器内解析,不上传服务器。面向 LLM / RAG / Obsidian / Notion 场景。

> 产品需求见 `docs/requirements.md`,技术方案见 `docs/mvp-tech-design.md`。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- pdf.js (`pdfjs-dist`) — 浏览器端 PDF 解析
- react-markdown + remark-gfm — Markdown 预览

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000,拖入一个 PDF 即可看到转换结果。

## 生产域名

线上地址: **https://pdftomarkdown.run**

站点 URL 用于 SEO(canonical、sitemap、结构化数据),通过环境变量 `NEXT_PUBLIC_SITE_URL` 配置,默认已是生产域名。本地开发如需预览 SEO 元数据,可复制 `.env.example` 为 `.env.local` 并取消注释 localhost 一行。

部署与 Spaceship DNS 配置见 [`docs/deployment.md`](docs/deployment.md)（Vercel 方案）。

**Cloudflare DNS + Cloudflare Pages** 一体化方案见 [`docs/deployment-cloudflare.md`](docs/deployment-cloudflare.md)。

## 目录结构

```
src/
├── app/                # 页面 + SEO 落地内容
├── components/         # UI 组件(Dropzone / Converter / 预览 / 操作)
└── lib/
    ├── pdf/parse.ts        # pdf.js 解析 → 行
    ├── layout/blocks.ts    # 行 → 语义块(标题/段落/列表/表格)
    ├── markdown/serialize.ts # 块 → Markdown
    └── converter.ts        # 编排入口
```

## MVP 范围

- [x] 拖拽上传 + 本地解析
- [x] 标题 / 段落 / 列表 / 表格 还原
- [x] 双栏预览(渲染 / 源码) + 复制 + 下载
- [x] SEO 落地页 + FAQ 结构化数据
- [ ] 公式(LaTeX)、OCR、批量、API(V1.1)
