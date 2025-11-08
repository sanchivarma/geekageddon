'use client';

import { SiteShell } from "../components/SiteShell";

const commitments = [
  "Process personal data solely under your documented instructions unless required by law.",
  "Implement administrative, technical, and physical safeguards aligned with ISO 27001 style controls.",
  "Promptly notify you of sub-processor changes and maintain a current roster on request.",
  "Assist with data subject requests, breach notifications, and DPIAs tied to Geekageddon services.",
];

export default function DataProcessingAddendumPage() {
  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Data Processing Addendum</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          This DPA outlines how Geekageddon acts as a processor for customer data. It supplements our Privacy Policy and ensures alignment with
          GDPR Articles 28 &amp; 32 along with comparable global regulations.
        </p>

        <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          {commitments.map((item) => (
            <li key={item} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-200/70 bg-slate-50/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          <p>
            Need a countersigned copy or custom clauses? Reach out to{" "}
            <a href="mailto:contact.geekageddon@gmail.com" className="text-cyan-600 underline decoration-dotted dark:text-cyan-300">
              mailto:contact.geekageddon@gmail.com
            </a>{" "}
            and we&apos;ll coordinate with your counsel.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
