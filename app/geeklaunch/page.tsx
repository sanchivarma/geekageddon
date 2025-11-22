"use client";

import { useMemo, useState } from "react";
import { SiteShell } from "../geekpeek/SiteShell";
import ventures from "./data/geekventures.json";

type Venture = {
  name: string;
  website?: string;
  tagline?: string;
  oneline_brief?: string;
  year_founded?: number;
  category?: string;
  tags?: string[];
  funding_round?: string;
  funding_amount?: number | null;
  location?: string;
  description?: string;
  team_size?: number | null;
  valuation?: number | null;
  investors?: string[];
  hiring_status?: string | null;
  reviews?: string[];
  urls?: Record<string, string>;
};

type SortKey = keyof Pick<
  Venture,
  "name" | "year_founded" | "category" | "location"
>;

export default function GeekLaunchPage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("year_founded");
  const [sortAsc, setSortAsc] = useState(false);
  const collator = useMemo(
    () => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }),
    []
  );

  const years = useMemo(() => {
    const unique = new Set<number>();
    ventures.forEach((v) => {
      if (typeof v.year_founded === "number") unique.add(v.year_founded);
    });
    return Array.from(unique).sort((a, b) => a - b);
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    ventures.forEach((v) => {
      if (v.category) unique.add(v.category);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    return ventures.filter((v) => {
      const yearOk = yearFilter === "all" || String(v.year_founded) === yearFilter;
      const catOk = categoryFilter === "all" || v.category === categoryFilter;
      return yearOk && catOk;
    });
  }, [yearFilter, categoryFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortAsc ? 1 : -1;
      if (bVal == null) return sortAsc ? -1 : 1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }

      return sortAsc
        ? collator.compare(String(aVal), String(bVal))
        : collator.compare(String(bVal), String(aVal));
    });
    return copy;
  }, [filtered, sortAsc, sortKey, collator]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "year_founded" ? false : true);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? "↑" : "↓") : "↕";

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-3 pb-12 pt-4 sm:px-4 lg:px-0">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">
            Geek Launch
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            New Tech Launches
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Explore latest curated ventures. Filter by year or category and sort any column.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Year Founded
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="mt-1 w-40 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="all">All</option>
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Category
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-1 w-44 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="all">All</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {sorted.length} of {ventures.length} launches
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/70">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  {[
                    ["name", "Name"],
                    ["year_founded", "Year"],
                    ["category", "Category"],
                    ["location", "Location"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      scope="col"
                      className="cursor-pointer px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-200"
                      onClick={() => handleSort(key as SortKey)}
                    >
                      <span className="flex items-center gap-2">
                        {label}
                        <span className="text-xs">{sortIndicator(key as SortKey)}</span>
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
                    Tagline
                  </th>
                  <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white/70 dark:divide-slate-800 dark:bg-slate-950/40">
                {sorted.map((venture) => (
                  <tr key={venture.name} className="hover:bg-cyan-50/60 align-top dark:hover:bg-cyan-900/20">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {venture.website ? (
                        <a
                          href={venture.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-200"
                        >
                          {venture.name}
                        </a>
                      ) : (
                        venture.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {venture.year_founded ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {venture.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {venture.location ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                      {venture.tagline || venture.oneline_brief || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(venture.tags ?? []).map((tag) => (
                          <span
                            key={`${venture.name}-${tag}`}
                            className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
