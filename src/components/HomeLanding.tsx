import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Converter } from "@/components/Converter";
import { HomeFooter } from "@/components/HomeFooter";
import { HomeHeader } from "@/components/HomeHeader";
import { SectionTabs } from "@/components/home/SectionTabs";
import { SITE_URL, type Faq } from "@/lib/landing";
import "@/app/home-landing.css";

export async function HomeLanding({ locale }: { locale: string }) {
  const t = await getTranslations("Home");
  const tExamples = await getTranslations("Examples");
  const faqs = t.raw("faqs") as Faq[];
  const howToSteps = tExamples.raw("general.steps") as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t("h1"),
        url: SITE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "HowTo",
        name: tExamples("general.howToName"),
        step: howToSteps.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text,
        })),
      },
    ],
  };

  const rich = {
    em: (chunks: ReactNode) => <em>{chunks}</em>,
    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
    code: (chunks: ReactNode) => (
      <code className="font-home-mono text-[0.92em]">{chunks}</code>
    ),
    file: (chunks: ReactNode) => <span className="home-file">{chunks}</span>,
  };

  return (
    <div className="home-landing" data-locale={locale}>
      <a className="home-skip" href="#main">
        {t("nav.skip")}
      </a>
      <HomeHeader />

      <main id="main">
        <Hero t={t} rich={rich} />

        <section id="convert" className="home-section home-band-dark home-convert-band !pt-0">
          <div className="home-wrap">
            <p className="home-eyebrow home-eyebrow-light">{t("convert.eyebrow")}</p>
            <h2>{t("convert.title")}</h2>
            <p className="home-lede">{t("convert.lede")}</p>
            <div className="home-convert-card mt-8">
              <Converter profile="general" />
            </div>
          </div>
        </section>

        <Problem t={t} rich={rich} />
        <MarkdownSection t={t} rich={rich} />
        <Compare t={t} />
        <Bridge t={t} />
        <When t={t} rich={rich} />
        <How t={t} />
        <UseCases t={t} rich={rich} />
        <BeforeAfter t={t} />
        <Map t={t} />
        <Who t={t} />
        <Intents t={t} />
        <FaqSection t={t} faqs={faqs} />

        <section className="home-section home-band-dark text-center">
          <div className="home-wrap">
            <p className="home-eyebrow home-eyebrow-light">{t("cta.eyebrow")}</p>
            <h2 className="mx-auto max-w-[16ch]">{t("cta.title")}</h2>
            <p className="mx-auto max-w-[56ch]">{t("cta.p1")}</p>
            <p className="mx-auto mb-6 max-w-[56ch]">{t("cta.p2")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a className="home-btn home-btn-light" href="#convert">
                {t("hero.cta")}
              </a>
              <a className="home-btn home-btn-ghost" href="#before-after">
                {t("hero.sample")}
              </a>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

type TFn = Awaited<ReturnType<typeof getTranslations>>;
type Rich = {
  em: (chunks: ReactNode) => ReactNode;
  strong: (chunks: ReactNode) => ReactNode;
  code: (chunks: ReactNode) => ReactNode;
  file: (chunks: ReactNode) => ReactNode;
};

function Hero({ t, rich }: { t: TFn; rich: Rich }) {
  const chips = (t.raw("hero.chips") as unknown);
  const chipList = Array.isArray(chips) ? (chips as string[]) : [];
  return (
    <section className="home-hero" id="top">
      <div className="home-wrap-wide">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <p className="home-eyebrow home-eyebrow-light">PDF → Markdown</p>
            <h1>{t.rich("hero.title", rich)}</h1>
            <p className="home-lede">{t("hero.lede")}</p>
            <div className="mb-[18px] mt-7 flex flex-wrap gap-3">
              <a className="home-btn home-btn-light" href="#convert">
                {t("hero.cta")}
              </a>
              <a className="home-btn home-btn-ghost" href="#before-after">
                {t("hero.sample")}
              </a>
            </div>
            <p className="max-w-[56ch] text-[15px]">{t.rich("hero.support", rich)}</p>
            <p className="max-w-[56ch] text-[15px]">{t("hero.privacy")}</p>
            <div className="mt-7 flex flex-wrap gap-2" aria-label={t("hero.chipsAria")}>
              {chipList.map((chip) => (
                <span key={chip} className="home-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <HeroPreview t={t} />
        </div>
      </div>
    </section>
  );
}

function HeroPreview({ t }: { t: TFn }) {
  return (
    <div className="home-preview" aria-hidden="true">
      <div className="home-preview-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
      <article className="home-doc">
        <div className="home-doc-bar">
          <span className="home-dot home-dot-pdf" />
          report.pdf · page 12
        </div>
        <div className="home-pdf-page">
          <div className="home-pdf-head">
            <span>Confidential</span>
            <span>p. 12</span>
          </div>
          <div className="home-pdf-kicker">API Guide</div>
          <div className="home-pdf-title">Authentication</div>
          <div className="home-pdf-rule" />
          <div>2.1 API Keys</div>
          <p className="my-2 text-[#4d4a43]">API keys are…</p>
          <div>2.2 OAuth</div>
          <p className="my-2 text-[#4d4a43]">OAuth is…</p>
          <table className="home-mini-table">
            <thead>
              <tr>
                <th>{t("preview.channel")}</th>
                <th>{t("preview.share")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Keys</td>
                <td>Server</td>
              </tr>
              <tr>
                <td>OAuth</td>
                <td>Apps</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <article className="home-doc">
        <div className="home-doc-bar">
          <span className="home-dot home-dot-md" />
          report.md
        </div>
        <div className="home-md-page">
          <div>
            <span className="home-tok-h"># API Guide: Authentication</span>
          </div>
          <br />
          <div>
            <span className="home-tok-h">## 2.1 API Keys</span>
          </div>
          <div>
            <span className="home-tok-p">API keys are...</span>
          </div>
          <br />
          <div>
            <span className="home-tok-h">## 2.2 OAuth</span>
          </div>
          <div>
            <span className="home-tok-p">OAuth is...</span>
          </div>
          <br />
          <div>
            <span className="home-tok-li">| Method | Use |</span>
          </div>
          <div>
            <span className="home-tok-li">| --- | --- |</span>
          </div>
          <div>
            <span className="home-tok-li">| Keys | Server |</span>
          </div>
          <div>
            <span className="home-tok-li">| OAuth | Apps |</span>
          </div>
        </div>
      </article>
    </div>
  );
}

function Problem({ t, rich }: { t: TFn; rich: Rich }) {
  const good = t.raw("problem.goodRows") as { trait: string; means: string }[];
  const bad = t.raw("problem.badRows") as { trait: string; hurts: string }[];
  return (
    <section id="problem" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("problem.eyebrow")}</p>
          <h2>{t("problem.title")}</h2>
          <p className="home-lede">{t.rich("problem.lede", rich)}</p>
        </div>
        <blockquote className="home-quote">{t("problem.quote")}</blockquote>
        <div className="grid gap-[18px] md:grid-cols-2">
          <article className="home-card">
            <span className="home-tag home-tag-pdf">{t("problem.goodTag")}</span>
            <h3 className="mt-3">{t("problem.goodH")}</h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="home-data">
                <thead>
                  <tr>
                    <th>{t("th.trait")}</th>
                    <th>{t("th.means")}</th>
                  </tr>
                </thead>
                <tbody>
                  {good.map((row) => (
                    <tr key={row.trait}>
                      <td>{row.trait}</td>
                      <td>{row.means}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <article className="home-card">
            <span className="home-tag home-tag-bridge">{t("problem.badTag")}</span>
            <h3 className="mt-3">{t("problem.badH")}</h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="home-data">
                <thead>
                  <tr>
                    <th>{t("th.trait")}</th>
                    <th>{t("th.hurts")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bad.map((row) => (
                    <tr key={row.trait}>
                      <td>{row.trait}</td>
                      <td>{row.hurts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
        <div className="mt-[18px] grid gap-[18px] md:grid-cols-2">
          <article className="home-card">
            <h3>{t("problem.see")}</h3>
            <p>{t("problem.seeP")}</p>
            <pre className="home-code">{t("problem.seeCode")}</pre>
          </article>
          <article className="home-card">
            <h3>{t("problem.soft")}</h3>
            <p>{t.rich("problem.softP", rich)}</p>
            <ul className="home-check">
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C45C26" strokeWidth="2">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <span>{t.rich("problem.gap1", rich)}</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span>{t.rich("problem.gap2", rich)}</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span>{t("problem.gap3")}</span>
              </li>
            </ul>
          </article>
        </div>
        <p className="home-lede mt-7">{t("problem.close")}</p>
      </div>
    </section>
  );
}

function MarkdownSection({ t, rich }: { t: TFn; rich: Rich }) {
  const traits = t.raw("md.traits") as { title: string; body: string }[];
  const chips = t.raw("md.chips") as string[];
  return (
    <section id="markdown" className="home-section home-band-alt">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("md.eyebrow")}</p>
          <h2>{t("md.title")}</h2>
          <p className="home-lede">{t("md.lede")}</p>
        </div>
        <pre className="home-code mb-7">{t("md.sample")}</pre>
        <h3 className="mb-3.5">{t("md.diff")}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {traits.map((item) => (
            <article key={item.title} className="home-trait">
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-[18px] md:grid-cols-2">
          <article className="home-card">
            <h3>{t("md.why")}</h3>
            <p>{t.rich("md.sep", rich)}</p>
            <p>{t.rich("md.pdfAsks", rich)}</p>
            <p>{t.rich("md.mdAsks", rich)}</p>
            <p>{t("md.notCosmetic")}</p>
            <pre className="home-code">{t("md.whyCode")}</pre>
          </article>
          <article className="home-card">
            <h3>{t("md.tree")}</h3>
            <p>{t("md.treeP")}</p>
            <pre className="home-code home-code-tree">{t("md.treeCode")}</pre>
            <p className="mt-4">{t("md.aiNeed")}</p>
          </article>
        </div>
        <p className="mb-3 mt-7">
          <strong>{t("md.fits")}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="home-chip home-chip-ink">
              {chip}
            </span>
          ))}
        </div>
        <p className="home-lede mt-6">{t("md.close")}</p>
      </div>
    </section>
  );
}

function CompareCell({ value }: { value: string }) {
  if (value.includes("★")) {
    return (
      <span className={`home-stars ${value.length < 5 ? "home-stars-low" : ""}`}>
        {value}
      </span>
    );
  }
  return value;
}

function Compare({ t }: { t: TFn }) {
  const rows = t.raw("cmp.rows") as { label: string; pdf: string; md: string }[];
  return (
    <section id="compare" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("cmp.eyebrow")}</p>
          <h2>{t("cmp.title")}</h2>
          <blockquote className="home-quote">{t("cmp.quote")}</blockquote>
        </div>
        <div className="home-card overflow-x-auto">
          <table className="home-data">
            <thead>
              <tr>
                <th />
                <th>PDF</th>
                <th>Markdown</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>
                    <CompareCell value={row.pdf} />
                  </td>
                  <td>
                    <CompareCell value={row.md} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="home-lede mt-6">{t("cmp.still")}</p>
        <p>{t("cmp.close")}</p>
      </div>
    </section>
  );
}

function Bridge({ t }: { t: TFn }) {
  const extract = t.raw("bridge.extract") as { title: string; body: string }[];
  return (
    <section id="bridge" className="home-section home-band-alt">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("bridge.eyebrow")}</p>
          <h2>{t("bridge.title")}</h2>
          <p className="home-lede">{t("bridge.lede")}</p>
        </div>
        <div className="mb-[22px] flex flex-wrap items-center gap-2">
          <span className="home-step-pill">{t("bridge.p1")}</span>
          <span className="text-home-muted" aria-hidden>
            →
          </span>
          <span className="home-step-pill home-step-pill-accent">PDF to Markdown</span>
          <span className="text-home-muted" aria-hidden>
            →
          </span>
          <span className="home-step-pill">{t("bridge.p3")}</span>
          <span className="text-home-muted" aria-hidden>
            →
          </span>
          <span className="home-step-pill">{t("bridge.p4")}</span>
        </div>
        <p>{t("bridge.notText")}</p>
        <h3>{t("bridge.recover")}</h3>
        <div className="home-extract mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {extract.map((item) => (
            <div key={item.title}>
              {item.title}
              <span>{item.body}</span>
            </div>
          ))}
        </div>
        <p className="home-lede mt-7">{t("bridge.ctaLine")}</p>
        <a className="home-btn home-btn-primary" href="#convert">
          {t("nav.convert")}
        </a>
      </div>
    </section>
  );
}

function When({ t, rich }: { t: TFn; rich: Rich }) {
  const pdfRows = t.raw("when.pdfRows") as { use: string; why: string }[];
  const mdRows = t.raw("when.mdRows") as { use: string; why: string }[];
  const needs = t.raw("when.needs") as string[];
  return (
    <section id="when" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("when.eyebrow")}</p>
          <h2>{t("when.title")}</h2>
          <p className="home-lede">{t.rich("when.lede", rich)}</p>
        </div>
        <SectionTabs
          label={t("when.tabsAria")}
          tabs={[
            { id: "when-pdf", label: t("when.tabPdf") },
            { id: "when-md", label: t("when.tabMd") },
            { id: "when-need", label: t("when.tabNeed") },
          ]}
        >
            <article key="pdf" className="home-card">
              <span className="home-tag home-tag-pdf">PDF = Presentation / Distribution / Archive</span>
              <h3 className="mt-3.5">{t("when.pdfH")}</h3>
              <p>{t("when.pdfP")}</p>
              <p>
                <em>{t("when.pdfJob")}</em>
              </p>
              <div className="overflow-x-auto rounded-xl">
                <table className="home-data">
                  <thead>
                    <tr>
                      <th>{t("th.use")}</th>
                      <th>{t("th.whyPdf")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdfRows.map((row) => (
                      <tr key={row.use}>
                        <td>{row.use}</td>
                        <td>{row.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article key="md" className="home-card">
              <span className="home-tag home-tag-md">Markdown = Content / Structure / Processing</span>
              <h3 className="mt-3.5">{t("when.mdH")}</h3>
              <p>{t("when.mdP")}</p>
              <p>
                <em>{t("when.mdJob")}</em>
              </p>
              <div className="overflow-x-auto rounded-xl">
                <table className="home-data">
                  <thead>
                    <tr>
                      <th>{t("th.use")}</th>
                      <th>{t("th.whyMd")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mdRows.map((row) => (
                      <tr key={row.use}>
                        <td>{row.use}</td>
                        <td>{row.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article key="need" className="home-card">
              <span className="home-tag home-tag-bridge">PDF → Markdown</span>
              <h3 className="mt-3.5">{t("when.needH")}</h3>
              <p>{t("when.needP")}</p>
              <ul className="home-need-grid">
                {needs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">{t.rich("when.needClose", rich)}</p>
            </article>
        </SectionTabs>
      </div>
    </section>
  );
}

function How({ t }: { t: TFn }) {
  return (
    <section id="how" className="home-section home-band-dark">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow home-eyebrow-light">{t("how.eyebrow")}</p>
          <h2>{t("how.title")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(["s1", "s2", "s3"] as const).map((key, i) => (
            <article key={key} className="home-step">
              <div className="home-num">0{i + 1}</div>
              <h3>{t(`how.${key}`)}</h3>
              <p>{t(`how.${key}p`)}</p>
            </article>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="home-step-pill">PDF</span>
          <span aria-hidden>→</span>
          <span className="home-step-pill home-step-pill-accent">{t("how.p2")}</span>
          <span aria-hidden>→</span>
          <span className="home-step-pill">{t("how.p3")}</span>
          <span aria-hidden>→</span>
          <span className="home-step-pill">{t("how.p4")}</span>
          <span aria-hidden>→</span>
          <a className="home-step-pill home-step-pill-accent home-step-pill-cta" href="#convert">
            {t("nav.convert")}
          </a>
        </div>
      </div>
    </section>
  );
}

function UseCases({ t, rich }: { t: TFn; rich: Rich }) {
  const pile = t.raw("uc1.list") as string[];
  const want = t.raw("uc2.list") as string[];
  return (
    <section id="use-cases" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("uc.eyebrow")}</p>
          <h2>{t("uc.title")}</h2>
        </div>
        <SectionTabs
          label={t("uc.tabsAria")}
          tabs={[
            { id: "uc1", label: t("uc.tab1") },
            { id: "uc2", label: t("uc.tab2") },
            { id: "uc3", label: t("uc.tab3") },
            { id: "uc4", label: t("uc.tab4") },
            { id: "uc5", label: t("uc.tab5") },
            { id: "uc6", label: t("uc.tab6") },
          ]}
        >
            <article key="uc1" className="home-card">
              <span className="home-tag home-tag-md">{t("uc.primary")}</span>
              <h3 className="mt-3">{t("uc1.h")}</h3>
              <p>{t.rich("uc1.p", rich)}</p>
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p>
                    <strong>{t("uc1.pile")}</strong>
                  </p>
                  <ul className="ml-[18px] list-disc text-home-ink-soft">
                    {pile.map((item) => (
                      <li key={item} className="my-1.5">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>{t("uc1.pipe")}</strong>
                  </p>
                  <pre className="home-code">{t("uc1.pipeCode")}</pre>
                </div>
              </div>
              <p className="mt-4">{t.rich("uc1.close", rich)}</p>
              <p className="mt-3">
                <Link className="font-semibold text-home-md underline-offset-2 hover:underline" href="/pdf-to-markdown-for-chatgpt">
                  {t("tools.chatgpt")}
                </Link>
              </p>
            </article>
            <article key="uc2" className="home-card">
              <h3>{t("uc2.h")}</h3>
              <p>{t.rich("uc2.p", rich)}</p>
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p>
                    <strong>{t("uc2.want")}</strong>
                  </p>
                  <ul className="ml-[18px] list-disc text-home-ink-soft">
                    {want.map((item) => (
                      <li key={item} className="my-1.5">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>{t("uc2.close")}</p>
                </div>
                <pre className="home-code">{t("uc2.code")}</pre>
              </div>
            </article>
            <article key="uc3" className="home-card">
              <h3>{t("uc3.h")}</h3>
              <p>{t("uc3.p")}</p>
              <div className="grid gap-6 md:grid-cols-2">
                <pre className="home-code">{t("uc3.codeIn")}</pre>
                <div>
                  <pre className="home-code">{t("uc3.codeOut")}</pre>
                  <p className="mt-3">{t("uc3.close")}</p>
                </div>
              </div>
            </article>
            <article key="uc4" className="home-card">
              <h3>{t("uc4.h")}</h3>
              <p>{t("uc4.p")}</p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p>
                    <strong>{t("uc4.from")}</strong>
                  </p>
                  <ul className="ml-[18px] list-disc">
                    {["API Documentation.pdf", "User Manual.pdf", "Developer Guide.pdf", "Product Specification.pdf"].map(
                      (file) => (
                        <li key={file} className="my-1.5">
                          <span className="home-file">{file}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>{t("uc4.to")}</strong>
                  </p>
                  <ul className="ml-[18px] list-disc">
                    {["README.md", "API.md", "Guide.md", "Specification.md"].map((file) => (
                      <li key={file} className="my-1.5">
                        <span className="home-file">{file}</span>
                      </li>
                    ))}
                  </ul>
                  <p>{t("uc4.close")}</p>
                  <p className="mt-3">
                    <Link className="font-semibold text-home-md underline-offset-2 hover:underline" href="/pdf-to-markdown-for-obsidian">
                      {t("tools.obsidian")}
                    </Link>
                    {" · "}
                    <Link className="font-semibold text-home-md underline-offset-2 hover:underline" href="/pdf-to-markdown-for-notion">
                      {t("tools.notion")}
                    </Link>
                  </p>
                </div>
              </div>
            </article>
            <article key="uc5" className="home-card">
              <h3>{t("uc5.h")}</h3>
              <p>{t("uc5.p")}</p>
              <pre className="home-code">{t("uc5.code")}</pre>
            </article>
            <article key="uc6" className="home-card">
              <h3>{t("uc6.h")}</h3>
              <p>{t.rich("uc6.p", rich)}</p>
              <pre className="home-code">{t("uc6.code")}</pre>
            </article>
        </SectionTabs>
      </div>
    </section>
  );
}

function BeforeAfter({ t }: { t: TFn }) {
  return (
    <section id="before-after" className="home-section home-band-alt">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("ba.eyebrow")}</p>
          <h2>{t("ba.title")}</h2>
        </div>
        <div className="home-ba grid gap-4 md:grid-cols-2">
          <article className="home-card overflow-hidden !p-0">
            <div className="home-ba-label home-ba-label-pdf">{t("ba.before")}</div>
            <pre>{t("ba.beforeCode")}</pre>
          </article>
          <article className="home-card overflow-hidden !p-0">
            <div className="home-ba-label home-ba-label-md">{t("ba.after")}</div>
            <pre>{t("ba.afterCode")}</pre>
          </article>
        </div>
        <p className="home-lede mt-5">{t("ba.p")}</p>
        <p className="mt-4">{t("ba.close")}</p>
      </div>
    </section>
  );
}

function Map({ t }: { t: TFn }) {
  return (
    <section id="map" className="home-section home-band-dark">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow home-eyebrow-light">{t("map.eyebrow")}</p>
          <h2>{t("map.title")}</h2>
          <p>{t("map.p")}</p>
        </div>
        <div className="grid justify-items-center gap-2.5">
          <div className="home-flow-card">
            <strong>PDF</strong>
            <span>{t("map.pdf")}</span>
          </div>
          <div className="home-flow-join" aria-hidden />
          <div className="grid w-full gap-3 md:grid-cols-2">
            <div className="grid justify-items-center gap-2.5 rounded-2xl border border-dashed border-[rgba(237,234,227,0.1)] p-2">
              <div className="home-flow-card">
                <strong>{t("map.read")}</strong>
                <span>{t("map.readD")}</span>
              </div>
            </div>
            <div className="grid justify-items-center gap-2.5 rounded-2xl border border-dashed border-[rgba(237,234,227,0.1)] p-2">
              <div className="home-flow-card home-flow-card-accent">
                <strong>{t("map.convert")}</strong>
                <span>{t("map.extract")}</span>
              </div>
              <div className="home-flow-join" aria-hidden />
              <div className="home-flow-card">
                <strong>Markdown</strong>
                <span>{t("map.md")}</span>
              </div>
            </div>
          </div>
          <div className="home-flow-join" aria-hidden />
          <div className="grid w-full gap-3 md:grid-cols-3">
            <div className="home-flow-card !w-full">
              <strong>{t("map.edit")}</strong>
              <span>{t("map.editD")}</span>
            </div>
            <div className="home-flow-card !w-full">
              <strong>AI / RAG</strong>
              <span>{t("map.aiD")}</span>
            </div>
            <div className="home-flow-card !w-full">
              <strong>{t("map.web")}</strong>
              <span>{t("map.webD")}</span>
            </div>
          </div>
        </div>
        <div className="mt-7 grid gap-3.5 md:grid-cols-3">
          <article className="home-job">
            <h3>PDF</h3>
            <p>{t("job.pdf")}</p>
          </article>
          <article className="home-job">
            <h3>Markdown</h3>
            <p>{t("job.md")}</p>
          </article>
          <article className="home-job">
            <h3>PDF to Markdown</h3>
            <p>{t("job.conv")}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Who({ t }: { t: TFn }) {
  const people = t.raw("who.people") as { title: string; body: string }[];
  return (
    <section id="who" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("who.eyebrow")}</p>
          <h2>{t("who.title")}</h2>
        </div>
        <div className="grid gap-3.5 md:grid-cols-2">
          {people.map((person) => (
            <article key={person.title} className="home-card home-persona-card">
              <h3>{person.title}</h3>
              <p className="mb-0">{person.body}</p>
            </article>
          ))}
        </div>
        <p className="home-lede mt-6">{t("who.close")}</p>
      </div>
    </section>
  );
}

function Intents({ t }: { t: TFn }) {
  const items = t.raw("intents") as {
    id: string;
    tag: string;
    tagKind: "pdf" | "md" | "bridge";
    h: string;
    p: string;
    href: string;
    link: string;
  }[];
  return (
    <section id="intents" className="home-section">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("intent.eyebrow")}</p>
          <h2>{t("intent.title")}</h2>
          <p className="home-lede">{t("intent.lede")}</p>
        </div>
        {items.map((item, i) => (
          <details key={item.id} id={item.id} className="home-intent" open={i === 0}>
            <summary>
              <span className={`home-tag home-tag-${item.tagKind}`}>{item.tag}</span>
              <span className="font-semibold">{item.h}</span>
            </summary>
            <p>{item.p}</p>
            <Link
              className="font-semibold text-home-md underline-offset-2 hover:underline"
              href={item.href as "/scanned-pdf-to-markdown"}
            >
              {item.link}
            </Link>
          </details>
        ))}
      </div>
    </section>
  );
}

function FaqSection({ t, faqs }: { t: TFn; faqs: Faq[] }) {
  return (
    <section id="faq" className="home-section home-band-alt">
      <div className="home-wrap">
        <div className="mb-10 max-w-[740px]">
          <p className="home-eyebrow">{t("faq.eyebrow")}</p>
          <h2>{t("faq.title")}</h2>
        </div>
        {faqs.map((item) => (
          <details key={item.q} className="home-faq">
            <summary>
              <span>{item.q}</span>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
