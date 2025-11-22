"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "../geekpeek/SiteShell";
import ventures from "./data/geekventures.json";
import featuredNews from "./data/featured-news.json";

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

type FeaturedItem = {
  name: string;
  website?: string;
  tagline?: string;
  oneline_brief?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  year_founded?: number;
};

export default function GeekLaunchPage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("year_founded");
  const [sortAsc, setSortAsc] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
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

  const featured = useMemo(() => {
    return [...(featuredNews as FeaturedItem[])]
      .filter((item) => item.name)
      .sort((a, b) => (b.year_founded ?? 0) - (a.year_founded ?? 0));
  }, []);

  useEffect(() => {
    if (!featured.length) return;
    const id = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featured.length);
    }, 7000);
    return () => clearInterval(id);
  }, [featured.length]);

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

        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/80 px-4 py-8 text-slate-700 shadow-[0_15px_40px_rgba(15,23,42,0.1)] sm:px-6 sm:py-10 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-200">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="w-full space-y-2 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-200">
                Featured Launches
              </p>
            </div>
          </div>
          {featured.length > 0 && (
            <div className="relative px-2 sm:px-6">
              {(() => {
                const current = featured[featuredIndex % featured.length];
                const categories = (current.category ?? "")
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean);
                const detailParts = [
                  current.year_founded ? `Founded ${current.year_founded}` : null,
                  current.location || null,
                  current.funding_round || null,
                ].filter(Boolean);
                const statLine =
                  detailParts.join(" • ") || (categories[0] ? categories[0] : "Launch");
                return (
                  <article className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {current.website ? (
                          <a
                            href={current.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:text-cyan-600 dark:hover:text-cyan-200"
                          >
                            {current.name}
                          </a>
                        ) : (
                          current.name
                        )}
                      </h2>
                      <p className="text-base text-slate-600 dark:text-slate-300">
                        {current.tagline || current.oneline_brief || "No tagline provided."}
                      </p>
                      {current.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {current.description}
                        </p>
                      )}
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {statLine}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <span
                            key={`${current.name}-cat-${cat}`}
                            className="rounded-full border border-cyan-500/70 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-300/70 dark:bg-cyan-900/30 dark:text-cyan-100"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                      <div className="feature-frame relative h-64 w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 dark:border-slate-800/70 dark:bg-slate-900/40">
                        <Image
                          src={current.imageUrl || "/geekageddon.png"}
                          alt={current.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="feature-art rounded-[26px] object-cover"
                          unoptimized
                          priority
                        />
                      </div>
                    </div>
                  </article>
                );
              })()}

              <button
                onClick={() =>
                  setFeaturedIndex((prev) => (prev - 1 + featured.length) % featured.length)
                }
                className="absolute left-[-12px] top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 sm:flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
                aria-label="Previous featured launch"
              >
                ‹
              </button>
              <button
                onClick={() => setFeaturedIndex((prev) => (prev + 1) % featured.length)}
                className="absolute right-[-12px] top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 sm:flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
                aria-label="Next featured launch"
              >
                ›
              </button>
            </div>
          )}
          {featured.length > 0 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-slate-400">
              {featured.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setFeaturedIndex(idx)}
                  className={`h-2 w-8 rounded-full cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-10 ${
                    idx === featuredIndex
                      ? "bg-cyan-500"
                      : "bg-slate-200 dark:bg-slate-700/60"
                  }`}
                  aria-label={`Go to featured launch ${item.name}`}
                />
              ))}
            </div>
          )}
        </section>

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
