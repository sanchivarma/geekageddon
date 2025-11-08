'use client';

import { SiteShell } from "../components/SiteShell";

export default function ImprintPage() {
  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Transparency</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Imprint / Impressum</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Geekageddon is an independent media project covering global technology news, analysis, and experiments. The following contact
          information satisfies EU and German telemedia requirements.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <dl className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <dt className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Publisher</dt>
            <dd>Geekageddon Media Lab</dd>
            <dd>Attn: Editorial</dd>
            <dd>42 Signal Alley, Berlin, Germany</dd>
            <dd>Email: hello@geekageddon.com</dd>
          </dl>
          <dl className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <dt className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Responsible Editor</dt>
            <dd>Sanchi Varma</dd>
            <dd>Editorial Hotline: +49 30 1234 5678</dd>
            <dd>Legal inquiries: legal@geekageddon.com</dd>
            <dd>VAT ID pending (Beta operations)</dd>
          </dl>
        </div>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-200/70 bg-slate-50/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          <p>
            Dispute Resolution: We are not obligated to participate in consumer arbitration boards, but we&apos;re happy to resolve issues directly.
            Email{" "}
            <a href="mailto:ombuds@geekageddon.com" className="text-cyan-600 underline decoration-dotted dark:text-cyan-300">
              ombuds@geekageddon.com
            </a>{" "}
            with any concerns.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
