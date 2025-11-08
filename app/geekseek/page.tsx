"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SiteShell } from "../components/SiteShell";
type GeekSeekPlace = {
  name?: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
};
type GeekSeekCompare = {
  items?: string[];
  table?: { html?: string };
  description?: string;
  highlights?: Array<{ item?: string; summary?: string }>;
  links?: Array<{ url: string; label?: string }>;
  summary?: string;
};
const TAB_KEYS = ["places", "compare"] as const;
const placePlaceholders = [
  "Restaurants near me",
  "Pharmacies in Alexanderplatz 10178 Berlin",
  "Coworking spaces in New York",
  "Vegan brunch in Austin",
  "Retro arcades in Tokyo",
];
const comparePlaceholders = [
  "Iphone 15 vs Samsung Galaxy S25+",
  "NextJs vs Svelte",
  "Tesla Model 3 vs BMW i4",
  "AWS vs Azure vs GCP",
  "MacBook Air vs Dell XPS 13"
];
const compareModes = [
  { value: "compare.tech", label: "Compare Tech" },
  { value: "compare.product", label: "Compare Product" },
];
export default function GeekSeekPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") === "compare" ? "compare" : "places";
  const [activeTab, setActiveTab] = useState<typeof TAB_KEYS[number]>(typeFromUrl);
  const [compareMode, setCompareMode] = useState<(typeof compareModes)[number]["value"]>("compare.tech");
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [places, setPlaces] = useState<GeekSeekPlace[]>([]);
  const [comparison, setComparison] = useState<GeekSeekCompare | null>(null);

  useEffect(() => {
    setActiveTab(typeFromUrl);
  }, [typeFromUrl]);
  
  useEffect(() => {
    setPlaceholderIndex(0);
    setQuery("");
    setError(null);
    setPlaces([]);
    setComparison(null);
  }, [activeTab, compareMode]);
  
  useEffect(() => {
    const source = activeTab === "places" ? placePlaceholders : comparePlaceholders;
    const interval = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % source.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [activeTab]);
  
  const placeholder = useMemo(() => {
    return activeTab === "places" ? placePlaceholders[placeholderIndex % placePlaceholders.length] : comparePlaceholders[placeholderIndex % comparePlaceholders.length];
  }, [activeTab, placeholderIndex]);
  
  const handleTabChange = (tab: typeof TAB_KEYS[number]) => {
    setActiveTab(tab);
    router.replace(`/geekseek?type=${tab}`, { scroll: false });
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      setError("Enter a query to start.");
      return;
    }

    const trimmed = query.trim();
    const type = activeTab === "places" ? "places" : compareMode;

    setLoading(true);
    setError(null);

    if (activeTab === "places") {
      setComparison(null);
    } else {
      setPlaces([]);
    }

    try {
      const params = new URLSearchParams({ type, q: trimmed });
      const response = await fetch(`/api/geekseek?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (activeTab === "places") {
        const list = payload.items ?? payload.results ?? [];
        setPlaces(Array.isArray(list) ? list : []);
      } else {
        setComparison(payload as GeekSeekCompare);
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Geekageddon API</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Geekseek</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Explore the multi-mode Geekseek endpoint. Query places around the world or compare technologies and products without leaving the cockpit.
          </p>
        </div>
        <div className="mt-4 space-y-6">
          <div
            className="flex flex-wrap gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-2 text-sm shadow-inner dark:border-slate-800/70 dark:bg-slate-900/40"
            role="tablist"
            aria-label="Geekseek modes"
          >
            {TAB_KEYS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`flex-1 rounded-2xl border px-4 py-3 font-semibold uppercase tracking-[0.2em] transition shadow-sm ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-800 border-cyan-400 dark:from-cyan-400/20 dark:text-cyan-100 dark:border-cyan-300"
                    : "border-transparent text-slate-500 hover:border-cyan-200 hover:text-cyan-600 dark:text-slate-400"
                }`}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`${tab}-panel`}
              >
                {tab === "places" ? "Places" : "Compare Tech/Product"}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "compare" && (
              <div className="space-y-2 text-sm max-w-xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Compare mode</p>
                <div className="space-y-2">
                  {compareModes.map((mode) => (
                    <label
                      key={mode.value}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        compareMode === mode.value
                          ? "border-cyan-500 bg-white text-cyan-700 shadow-sm dark:border-cyan-300 dark:bg-slate-900 dark:text-cyan-200"
                          : "border-slate-200 text-slate-600 hover:border-cyan-200 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-semibold">{mode.label}</span>
                      <input
                        type="radio"
                        value={mode.value}
                        checked={compareMode === mode.value}
                        onChange={(event) => setCompareMode(event.target.value as typeof compareMode)}
                        className="sr-only"
                      />
                      <span
                        className={`relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                          compareMode === mode.value ? "border-cyan-500 bg-cyan-500/10" : "border-slate-400"
                        }`}
                        aria-hidden
                      >
                        {compareMode === mode.value && <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-300" />}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                {activeTab === "compare" ? (
                  <textarea
                    className="flex-1 rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={placeholder}
                    rows={4}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="flex-1 rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={placeholder}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                )}
                <button
                  type="submit"
                  className="inline-flex self-start items-center rounded-full border border-cyan-500/70 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/70 dark:text-cyan-200"
                  disabled={loading}  
                >
                  {loading ? "Searching..." : "Submit"}
                </button>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
          </form>
        </div>
      </section>
      <section className="rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Results</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{activeTab === "places" ? "Places" : "Comparisons"}</h2>
        </header>
        <div className="mt-6" id={`${activeTab}-panel`} role="tabpanel" aria-live="polite">
          {activeTab === "places" ? <PlacesResults items={places} /> : <CompareResults payload={comparison} />}
        </div>
      </section>
    </SiteShell>
  );
}

type PlacesResultsProps = {
  items: GeekSeekPlace[];
};

function PlacesResults({ items }: PlacesResultsProps) {
  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Run a search to populate nearby places.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.slice(0, 12).map((place, index) => {
        const href = place.googleMapsUri || place.websiteUri || "#";
        return (
          <article key={`${place.name}-${index}`} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{place.name ?? "Untitled spot"}</h3>
            <p className="text-slate-500 dark:text-slate-400">{place.address ?? "Address unavailable"}</p>
            {typeof place.rating === "number" && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                ★ {place.rating.toFixed(1)} · {place.userRatingCount ?? 0} reviews
              </p>
            )}
            {href !== "#" && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
              >
                Open map/site →
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}

type CompareResultsProps = {
  payload: GeekSeekCompare | null;
};

function CompareResults({ payload }: CompareResultsProps) {
  if (!payload) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Please submit a prompt query.</p>;
  }

  const pills = payload.items ?? [];
  const highlights = payload.highlights ?? [];
  const links = payload.links ?? [];
  
  return (
    <article className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-sm dark:border-slate-700 dark:bg-slate-900/70">
      {pills.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {pills.map((pill) => (
            <span key={pill} className="rounded-full border border-cyan-200/70 px-3 py-1 text-cyan-700 dark:border-cyan-700/60 dark:text-cyan-200">
              {pill}
            </span>
          ))}
        </div>
      )}
      {payload.table?.html ? (
        <div className="overflow-auto rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40" dangerouslySetInnerHTML={{ __html: payload.table.html }} />
      ) : payload.description ? (
        <p className="text-slate-600 dark:text-slate-200">{payload.description}</p>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">No structured table provided.</p>
      )}
      {highlights.length > 0 && (
        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div key={`${highlight.item}-${index}`}>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{highlight.item ?? "Highlight"}</p>
              <p className="text-slate-600 dark:text-slate-200">{highlight.summary ?? ""}</p>
            </div>
          ))}
        </div>
      )}
      {payload.summary && <p className="text-slate-700 dark:text-slate-200">{payload.summary}</p>}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs">
          {links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline decoration-dotted dark:text-cyan-300">
              {link.label ?? link.url}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}