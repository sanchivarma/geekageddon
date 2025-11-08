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
const currencyHints = [
  { keywords: ["india", "mumbai", "delhi", "bangalore", "₹", "rs", "rupee"], symbol: "₹" },
  { keywords: ["europe", "berlin", "paris", "madrid", "euro", "€"], symbol: "€" },
  { keywords: ["uk", "london", "britain", "pound", "£"], symbol: "£" },
  { keywords: ["japan", "tokyo", "yen", "¥"], symbol: "¥" },
  { keywords: ["canada", "toronto", "cad"], symbol: "C$" },
];
const detectCurrencySymbol = (query: string) => {
  const lowerQuery = query.toLowerCase();
  for (const hint of currencyHints) {
    if (hint.keywords.some((keyword) => lowerQuery.includes(keyword))) return hint.symbol;
  }
  if (query.includes("$")) return "$";
  return Intl.NumberFormat(undefined, { style: "currency", currency: "USD" })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? "$";
};
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
  const [geoPoint, setGeoPoint] = useState<{ lat: number; lng: number } | null>(null);

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
  
  const requestUserLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error instanceof Error ? error : new Error("Location permission denied."));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
        }
      );
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!query.trim()) {
      setError("Enter a query to start.");
      return;
    }

    const trimmed = query.trim();
    const type = activeTab === "places" ? "places" : compareMode;
    const lowerQuery = trimmed.toLowerCase();
    const needsLocation =
      activeTab === "places" &&
      (lowerQuery.includes("near me") ||
        lowerQuery.includes("around me") ||
        lowerQuery.includes("nearby") ||
        lowerQuery.includes("close to me"));

    setLoading(true);
    setError(null);

    if (activeTab === "places") {
      setComparison(null);
    } else {
      setPlaces([]);
    }

    try {
      let lat = geoPoint?.lat;
      let lng = geoPoint?.lng;

      if (needsLocation && (lat == null || lng == null)) {
        try {
          const coords = await requestUserLocation();
          setGeoPoint(coords);
          lat = coords.lat;
          lng = coords.lng;
        } catch (geoError) {
          const message =
            geoError instanceof Error
              ? geoError.message
              : "Location permission is required for 'near me' queries.";
          throw new Error(message);
        }
      }

      const params = new URLSearchParams({ type, q: trimmed });
      if (lat != null && lng != null) {
        params.set("lat", String(lat));
        params.set("lng", String(lng));
      }

      const response = await fetch(`https://geekageddon-api.vercel.app/api/geekseek?${params.toString()}`, {
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-3 pb-12 pt-4 sm:px-4 lg:px-0">
        <section className="w-full rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80 sm:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-300">Geekageddon API</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Geekseek</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Explore the multi-mode Geekseek endpoint. Query places around the world or compare technologies and products without leaving the cockpit.
            </p>
          </div>
          <div className="mt-4 space-y-6">
            <div
              className="flex flex-col gap-2 rounded-3xl border border-slate-200/80 bg-white/80 p-2 text-sm shadow-inner dark:border-slate-800/70 dark:bg-slate-900/40 sm:flex-row sm:flex-wrap sm:gap-3"
              role="tablist"
              aria-label="Geekseek modes"
            >
              {TAB_KEYS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`w-full rounded-2xl border px-4 py-3 font-semibold uppercase tracking-[0.2em] transition shadow-sm sm:flex-1 ${
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
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {activeTab === "compare" && (
                <div className="space-y-2 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Compare mode</p>
                  <div className="flex flex-wrap gap-2">
                    {compareModes.map((mode) => (
                      <label
                        key={mode.value}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          compareMode === mode.value
                            ? "border-cyan-500 bg-white text-cyan-700 shadow-sm dark:border-cyan-300 dark:bg-slate-900 dark:text-cyan-200"
                            : "border-slate-200 text-slate-600 hover:border-cyan-200 dark:border-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{mode.label}</span>
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
                  <textarea
                    className="min-h-[160px] w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder={placeholder}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full border border-cyan-500/70 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/70 dark:text-cyan-200 sm:w-auto"
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
        <section className="w-full rounded-[2.5rem] border border-slate-200/70 bg-white/95 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80 sm:p-8">
          <header className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Results</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{activeTab === "places" ? "Places" : "Comparisons"}</h2>
          </header>
          <div className="mt-6" id={`${activeTab}-panel`} role="tabpanel" aria-live="polite">
            {activeTab === "places" ? <PlacesResults items={places} query={query} /> : <CompareResults payload={comparison} />}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

type PlacesResultsProps = {
  items: GeekSeekPlace[];
  query: string;
};

function PlacesResults({ items, query }: PlacesResultsProps) {
  if (!items.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Please submit a query.</p>;
  }
  const currencySymbol = detectCurrencySymbol(query);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.slice(0, 12).map((place, index) => {
        const href = place.googleMapsUri || place.websiteUri || "#";
        const openNow =
          typeof (place as any)?.currentOpeningHours?.openNow === "boolean"
            ? (place as any).currentOpeningHours.openNow
            : typeof (place as any)?.openNow === "boolean"
            ? (place as any).openNow
            : typeof (place as any)?.isOpenNow === "boolean"
            ? (place as any).isOpenNow
            : Boolean(place.businessStatus?.toLowerCase().includes("open"));
        const phone =
          (place as any)?.formattedPhoneNumber ||
          (place as any)?.nationalPhoneNumber ||
          (place as any)?.internationalPhoneNumber ||
          (place as any)?.phoneNumber ||
          null;
        const distanceMeters = typeof (place as any)?.distanceMeters === "number" ? Math.round((place as any).distanceMeters) : null;
        const reviewsUrl = (place as any)?.reviewsUrl;
        const openingText =
          (place as any)?.currentOpeningHours?.weekdayDescriptions?.join(" · ") ||
          (place as any)?.regularOpeningHours?.weekdayDescriptions?.join(" · ") ||
          (place as any)?.openingHours ||
          null;
        const priceLevel = (place as any)?.priceLevel;
        const priceRange = (place as any)?.priceRange;
        let priceDisplay: string | null = null;
        if (typeof priceLevel === "number" && priceLevel > 0) {
          priceDisplay = currencySymbol.repeat(Math.min(4, priceLevel));
        } else if (typeof priceRange === "string" && priceRange.trim()) {
          priceDisplay = priceRange.trim();
        }
        const excludedCategories = new Set(["food", "restaurant", "establishment", "point_of_interest"]);
        const categories = Array.isArray((place as any)?.categories)
          ? (place as any).categories.filter(
              (category: string) => category && !excludedCategories.has(category.toLowerCase().trim())
            )
          : [];
        const cuisines = Array.isArray((place as any)?.cuisines)
          ? (place as any).cuisines.filter((cuisine: string) => cuisine && cuisine.trim())
          : [];
        const boolBadges: Array<{ label: string; value: boolean }> = [
          { label: "Accepts Card", value: Boolean((place as any)?.acceptsCards) },
          { label: "Accepts Cash", value: Boolean((place as any)?.acceptsCash) },
          { label: "Delivery Available", value: Boolean((place as any)?.hasDelivery) },
          { label: "Dine In", value: Boolean((place as any)?.hasDineIn) },
          { label: "Free Parking", value: Boolean((place as any)?.hasFreeParking) },
          { label: "Offers Takeout", value: Boolean((place as any)?.hasTakeout) },
          { label: "Wheelchair Accessible Parking", value: Boolean((place as any)?.hasWheelchairAccessibleParking) },
          { label: "Reservation Possible", value: Boolean((place as any)?.reservable) },
        ];
        return (
          <article key={`${place.name}-${index}`} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm dark:border-slate-700 dark:bg-slate-900/70">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{place.name ?? "Untitled spot"}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  openNow
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200"
                }`}
              >
                {openNow ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {place.address ?? "Address unavailable"}
              {distanceMeters !== null && <span className="text-xs text-slate-400"> ({distanceMeters} m)</span>}
            </p>
            {phone && (
              <p>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-300"
                >
                  {phone}
                </a>
              </p>
            )}
            {typeof place.rating === "number" && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                ★ {place.rating.toFixed(1)} ·{" "}
                {reviewsUrl ? (
                  <a
                    href={reviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 underline decoration-dotted dark:text-amber-300"
                  >
                    {place.userRatingCount ?? 0} reviews
                  </a>
                ) : (
                  `${place.userRatingCount ?? 0} reviews`
                )}
              </p>
            )}
            {openingText && <p className="text-xs text-slate-500 dark:text-slate-400">{openingText}</p>}
            {priceDisplay && (
              <p className="text-xs text-slate-400">
                {priceDisplay.split("").map((char, idx) => (
                  <span key={`${char}-${idx}`} className="font-semibold text-slate-600 dark:text-slate-200">
                    {char}
                  </span>
                ))}
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
            <div className="mt-3 flex flex-wrap gap-2">
              {boolBadges
                .filter((badge) => badge.value)
                .map((badge) => (
                  <span
                    key={`${place.name}-${badge.label}`}
                    className="rounded-full border border-slate-200/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {badge.label}
                  </span>
                ))}
              {categories.slice(0, 4).map((category) => (
                <span
                  key={`${place.name}-${category}-category`}
                  className="rounded-full border border-slate-200/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {category}
                </span>
              ))}
              {cuisines.slice(0, 4).map((cuisine) => (
                <span
                  key={`${place.name}-${cuisine}-cuisine`}
                  className="rounded-full border border-slate-200/70 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  {cuisine}
                </span>
              ))}
            </div>
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
    return <p className="text-sm text-slate-500 dark:text-slate-400">Please submit a query.</p>;
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
