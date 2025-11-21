"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { SiteShell } from "../components/SiteShell";
type OpeningHours = {
  openNow?: boolean;
  weekdayDescriptions?: string[];
};

type GeekSeekPlace = {
  name?: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  businessStatus?: string;
  openNow?: boolean;
  isOpenNow?: boolean;
  currentOpeningHours?: OpeningHours;
  regularOpeningHours?: OpeningHours;
  formattedPhoneNumber?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  phoneNumber?: string;
  distanceMeters?: number;
  reviewsUrl?: string;
  priceLevel?: number;
  priceRange?: string;
  categories?: string[];
  cuisines?: string[];
  openingHours?: string;
  acceptsCards?: boolean;
  acceptsCash?: boolean;
  hasDelivery?: boolean;
  hasDineIn?: boolean;
  hasFreeParking?: boolean;
  hasTakeout?: boolean;
  hasWheelchairAccessibleParking?: boolean;
  reservable?: boolean;
};
type GeekSeekTableRow = {
  label?: string;
  key?: string;
  values?: Array<string | number | null | undefined>;
  A?: string;
  B?: string;
  a?: string;
  b?: string;
};
type GeekSeekCompare = {
  items?: string[];
  table?: {
    columns?: string[];
    rows?: GeekSeekTableRow[];
    html?: string;
  };
  rows?: GeekSeekTableRow[];
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
  "AWS vs AzureP",
  "MacBook Air vs Dell XPS 13"
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
const EXCLUDED_CATEGORIES = new Set(["food", "restaurant", "establishment", "point_of_interest"]);
const extractComparisonLabels = (query: string) => {
  if (!query) return [];
  const normalized = query.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?:\s+vs\.?\s+|\s+versus\s+|\s+against\s+|,|\/|&)/i)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.slice(0, 2);
};
function GeekSeekClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFromUrl = searchParams.get("type") === "compare" ? "compare" : "places";
  const [activeTab, setActiveTab] = useState<typeof TAB_KEYS[number]>(typeFromUrl);
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
  }, [activeTab]);

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
          timeout: 120000,
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
    const type = activeTab === "places" ? "places" : "compare";
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Geek Seek 🔍</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Query places around the world or compare technologies and products side by side. Powered by AI and real-time data.
            </p>
          </div>
          <div className="mt-4 space-y-6">
            <div className="space-y-1">
              <p className=" text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Select the right mode for best formatted results
              </p>
            </div>
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
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      readOnly
                      checked={activeTab === tab}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <span>{tab === "places" ? "Places" : "Compare Tech/Product (A vs B)"}</span>
                  </span>
                </button>
              ))}
            </div>
            {activeTab === "compare" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Beta note: Please compare only two options at a time while we expand the compare engine.
                    </p>
                  )}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          </header>
          <div className="mt-6" id={`${activeTab}-panel`} role="tabpanel" aria-live="polite">
            {activeTab === "places" ? <PlacesResults items={places} query={query} /> : <CompareResults payload={comparison} query={query} />}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

export default function GeekSeekPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Loading Geekseek…</div>}>
      <GeekSeekClient />
    </Suspense>
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
          typeof place.currentOpeningHours?.openNow === "boolean"
            ? place.currentOpeningHours.openNow
            : typeof place.openNow === "boolean"
            ? place.openNow
            : typeof place.isOpenNow === "boolean"
            ? place.isOpenNow
            : Boolean(place.businessStatus?.toLowerCase().includes("open"));
        const phone =
          place.formattedPhoneNumber ?? place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? place.phoneNumber ?? null;
        const distanceMeters = typeof place.distanceMeters === "number" ? Math.round(place.distanceMeters) : null;
        const reviewsUrl = place.reviewsUrl ?? null;
        const openingText =
          place.currentOpeningHours?.weekdayDescriptions?.join(" · ") ??
          place.regularOpeningHours?.weekdayDescriptions?.join(" · ") ??
          place.openingHours ??
          null;
        const priceLevel = place.priceLevel;
        const priceRange = place.priceRange;
        let priceDisplay: string | null = null;
        if (typeof priceLevel === "number" && priceLevel > 0) {
          priceDisplay = currencySymbol.repeat(Math.min(4, priceLevel));
        } else if (typeof priceRange === "string" && priceRange.trim()) {
          priceDisplay = priceRange.trim();
        }
        const categories = Array.isArray(place.categories)
          ? place.categories.filter(
              (category) => category && !EXCLUDED_CATEGORIES.has(category.toLowerCase().trim())
            )
          : [];
        const cuisines = Array.isArray(place.cuisines)
          ? place.cuisines.filter((cuisine) => cuisine && cuisine.trim())
          : [];
        const boolBadges: Array<{ label: string; value: boolean }> = [
          { label: "Accepts Card", value: Boolean(place.acceptsCards) },
          { label: "Accepts Cash", value: Boolean(place.acceptsCash) },
          { label: "Delivery Available", value: Boolean(place.hasDelivery) },
          { label: "Dine In", value: Boolean(place.hasDineIn) },
          { label: "Free Parking", value: Boolean(place.hasFreeParking) },
          { label: "Offers Takeout", value: Boolean(place.hasTakeout) },
          { label: "Wheelchair Accessible Parking", value: Boolean(place.hasWheelchairAccessibleParking) },
          { label: "Reservation Possible", value: Boolean(place.reservable) },
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
  query: string;
};

type NormalizedTableRow = { label: string; values: string[] };

const sanitizeCell = (value: unknown, fallback = "--") => {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
};

const normalizeComparisonTable = (payload: GeekSeekCompare | null, query: string): { columns: string[]; rows: NormalizedTableRow[] } => {
  if (!payload) return { columns: [], rows: [] };
  const normalizedItems = (payload.items ?? []).map((item) => sanitizeCell(item)).filter((item) => item !== "--");
  const queryLabels = extractComparisonLabels(query).map((label) => sanitizeCell(label));
  const fallbackOptions = normalizedItems.length ? normalizedItems : queryLabels;
  const finalFallbackOptions = fallbackOptions.length ? fallbackOptions : ["Item 1", "Item 2"];
  const rawColumns =
    Array.isArray(payload.table?.columns) && payload.table?.columns.length
      ? payload.table.columns.map((column) => sanitizeCell(column, "--"))
      : ["Factor", ...finalFallbackOptions.slice(0, 2)];

  const displayColumns = rawColumns.map((column, index) => {
    if (index === 0) return column === "--" ? "Factor" : column;
    const replacement = finalFallbackOptions[index - 1];
    if (!replacement) return column === "--" ? `Choice ${index}` : column;
    if (/^(?:option|choice)?\s*(?:a|b|1|2)$/i.test(column)) {
      return replacement;
    }
    return column === "--" ? replacement : column;
  });

  const expectedValueCount = Math.max(1, displayColumns.length - 1);
  const sourceRows = (payload.table?.rows ?? payload.rows ?? []) as GeekSeekTableRow[];
  const intermediate: Array<NormalizedTableRow & { labelMeta: string }> = sourceRows
    .map((row) => {
      const originalLabel = row?.label ?? row?.key ?? "";
      let label = sanitizeCell(originalLabel);
      let forcedColumnIndex: number | null = null;
      if (/^when to cho(?:ose|se)\b/i.test(label || originalLabel)) {
        label = "When to Choose";
        if (/(?:\b|_)(?:b|second|2)\b/i.test(originalLabel ?? "")) {
          forcedColumnIndex = 1;
        } else if (/(?:\b|_)(?:a|first|1)\b/i.test(originalLabel ?? "")) {
          forcedColumnIndex = 0;
        }
      }
      const rawValues = Array.isArray(row?.values) && row.values.length > 0 ? row.values : [row?.A ?? row?.a, row?.B ?? row?.b];
      const values = rawValues.map((value) => sanitizeCell(value));
      while (values.length < expectedValueCount) values.push("--");
      if (values.length > expectedValueCount) values.length = expectedValueCount;
      if (forcedColumnIndex !== null) {
        const nonEmpty = values.filter((value) => value !== "--");
        if (nonEmpty.length === 1) {
          const adjusted = Array(expectedValueCount).fill("--");
          adjusted[forcedColumnIndex] = nonEmpty[0];
          return { label, values: adjusted, labelMeta: originalLabel };
        }
      }
      return { label, values, labelMeta: originalLabel };
    })
    .filter((row) => row.label !== "--" || row.values.some((value) => value !== "--"));

  const mergedRows: NormalizedTableRow[] = [];
  const whenAccumulator = Array(expectedValueCount).fill("--");
  let hasWhenRow = false;

  for (const row of intermediate) {
    if (row.label === "When to Choose") {
      row.values.forEach((value, index) => {
        if (value !== "--") {
          whenAccumulator[index] = value;
          hasWhenRow = true;
        }
      });
    } else {
      mergedRows.push({ label: row.label, values: row.values });
    }
  }

  if (hasWhenRow) {
    mergedRows.push({ label: "When to Choose", values: whenAccumulator });
  }

  return { columns: displayColumns, rows: mergedRows };
};

function CompareResults({ payload, query }: CompareResultsProps) {
  if (!payload) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Please submit a query.</p>;
  }

  const pills = payload.items ?? [];
  const highlights = payload.highlights ?? [];
  const links = payload.links ?? [];
  const { columns, rows } = normalizeComparisonTable(payload, query);
  const hasStructuredTable = rows.length > 0;
  
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
      {hasStructuredTable ? (
        <div className="overflow-auto rounded-2xl border border-slate-200/70 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
          <table className="min-w-full table-auto text-left text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-2 font-semibold uppercase tracking-wide text-cyan-700 dark:from-slate-900/30 dark:to-slate-900/10 dark:text-cyan-700"
                  >
                    {column}  
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={`${row.label}-${rowIndex}`}
                  className={
                    rowIndex % 2 === 0
                      ? "bg-white/95 dark:bg-slate-900/30"
                      : "bg-slate-200/60 dark:bg-slate-900/60"
                  }
                >
                  <th scope="row" className="px-4 py-2 text-slate-900 dark:text-slate-100">
                    {row.label}
                  </th>
                  {row.values.map((value, cellIndex) => (
                    <td key={`${row.label}-${cellIndex}`} className="px-4 py-2">
                      {row.label.toLowerCase() === "link" && value !== "--" ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline decoration-dotted dark:text-cyan-300">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
