'use client';

import { SiteShell } from "../components/SiteShell";

const sections = [
  {
    title: "What We Collect",
    body: "Geekageddon stores basic analytics (page views, referrers) and details you voluntarily submit via forms or email. No biometric, financial, or advertising tracking data is collected.",
  },
  {
    title: "How We Use It",
    body: "Data powers content personalization, community moderation, and responses to your requests. We do not sell personal information. Aggregated insights may inform trends we publish.",
  },
  {
    title: "Your Controls",
    body: "You can request data exports or deletion at any time by contacting privacy@geekageddon.com. We honor EU/EEA, UK, and California privacy rights without friction.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Compliance</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy (EU)</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          This summary explains how Geekageddon processes and protects personal data when you browse the site, subscribe to updates, or submit
          tips. We comply with GDPR, ePrivacy, and similar frameworks.
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
              <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">{section.title}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-200">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-200/70 bg-slate-50/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          <p>
            For full legal wording, partner data processors, or urgent issues please email{" "}
            <a href="mailto:privacy@geekageddon.com" className="text-cyan-600 underline decoration-dotted dark:text-cyan-300">
              privacy@geekageddon.com
            </a>{" "}
            and we&apos;ll follow up within two business days.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
