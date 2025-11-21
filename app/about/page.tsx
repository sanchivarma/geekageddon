'use client';

import { SiteShell } from "../geekpeek/SiteShell";

const pillars = [
  {
    title: "Curated Intelligence",
    detail: "We gather signal from founders, investors, and researchers so you can skip the noise and dive straight into the breakthroughs.",
  },
  {
    title: "Human + AI Editorial",
    detail: "Geekageddon blends human context with AI-assisted trend tracking to surface stories that actually matter.",
  },
  {
    title: "Community First",
    detail: "From indie hackers to enterprise leaders, we welcome contributions, tips, and feedback to keep the uplink sharp.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Geekageddon</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">About the Mission</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Geekageddon is a living lab for future tech reporting. We spotlight AI leaps, product launches, funding rounds, and cultural shifts so
          builders can stay ahead without doomscrolling twelve apps.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">{pillar.title}</p>
              <p className="mt-2">{pillar.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 space-y-3 rounded-3xl border border-dashed border-slate-200/70 bg-slate-50/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          <h2 className="text-base font-semibold uppercase tracking-[0.3em] text-slate-900 dark:text-white">What&apos;s Next</h2>
          <p>
            We are rolling out deeper research briefings, contributor tools, and a transparency dashboard for our curation pipeline. If you have
            ideas or want to collaborate, drop us a line via the contact page.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
