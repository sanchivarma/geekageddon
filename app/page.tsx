"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "./components/SiteShell";

type GeekFeedItem = {
  id?: string;
  title?: string;
  url?: string;
  summary?: string;
  description?: string;
  publishedAt?: string;
  source?: {
    id?: string;
    name?: string;
  };
  categories?: string[];
  tags?: string[];
  image?: string;
  imageUrl?: string;
  heroImage?: string;
  coverImage?: string;
  media?: {
    url?: string;
  };
};

type GeekFeedResponse = {
  success?: boolean;
  items?: GeekFeedItem[];
  featuredNews?: GeekFeedItem[];
};

type FeaturedSlide = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  statLine: string;
  accent: string;
  url?: string;
  image?: string;
};

const accentPalette = [
  "from-cyan-400 via-sky-500 to-indigo-500",
  "from-emerald-400 via-teal-400 to-cyan-500",
  "from-fuchsia-500 via-purple-500 to-violet-500",
  "from-amber-400 via-orange-500 to-rose-500",
];

const defaultFeatureImage = "/featured_post.gif";

const limitWords = (text: string | undefined, maxWords = 50) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
};

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isAllowedRemoteImage = (value: string | undefined) => {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
};

const sanitizeImagePath = (value?: string) => {
  if (!value) return defaultFeatureImage;
  if (isAllowedRemoteImage(value)) return value;
  const cleaned = value
    .replace(/^(\.\.\/)+public\//, "/")
    .replace(/^public\//, "/");
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

const deriveImage = (item: GeekFeedItem) => {
  const candidate =
    item.image ||
    item.imageUrl ||
    item.heroImage ||
    item.coverImage ||
    item.media?.url ||
    "";
  return sanitizeImagePath(candidate);
};

const subjectFromItem = (item: GeekFeedItem) => {
  const sourceName = item.source?.name ?? "GeekFeed";
  return `${formatDate(item.publishedAt)} - ${sourceName}`;
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredSlides, setFeaturedSlides] = useState<FeaturedSlide[]>([]);
  const [gridPosts, setGridPosts] = useState<GeekFeedItem[]>([]);
  const [feedState, setFeedState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadFeed = async () => {
      try {
        setFeedState("loading");
        setFeedError(null);

        const response = await fetch(
          "https://geekageddon-api.vercel.app/api/geekfeed?limit=10",
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error(`Feed responded with ${response.status}`);
        }
        const payload = (await response.json()) as GeekFeedResponse;
        if (cancelled) return;

        const items = Array.isArray(payload.items) ? payload.items : [];
        const featuredNews = Array.isArray(payload.featuredNews)
          ? payload.featuredNews
          : [];
        const featuredFromApi = featuredNews.length
          ? featuredNews
          : items.filter((item) => item.source?.id === "geekageddon-featured");
        const nonFeatured = items.filter(
          (item) => item.source?.id !== "geekageddon-featured"
        );

        setFeaturedSlides(
          featuredFromApi.map((item, index) => ({
            id: item.id ?? item.url ?? `feature-${index}`,
            title: item.title ?? "Geekageddon dispatch",
            excerpt:
              limitWords(item.summary ?? item.description ?? "", 40) ||
              "Fresh drop from the Geekageddon newsroom.",
            tag: item.source?.name ?? "Geekageddon",
            statLine: subjectFromItem(item),
            accent: accentPalette[index % accentPalette.length],
            url: item.url,
            image: deriveImage(item),
          }))
        );
        setGridPosts(nonFeatured);
        setFeedState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setFeedState("error");
        setFeedError(
          error instanceof Error ? error.message : "Failed to load feed"
        );
        setFeaturedSlides([]);
        setGridPosts([]);
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (featuredSlides.length && currentSlide >= featuredSlides.length) {
      setCurrentSlide(0);
    }
  }, [featuredSlides.length, currentSlide]);

  const activeSlide = useMemo(() => {
    if (!featuredSlides.length) return null;
    return featuredSlides[currentSlide % featuredSlides.length];
  }, [currentSlide, featuredSlides]);

  const handleNext = () =>
    setCurrentSlide((prev) => (prev + 1) % Math.max(featuredSlides.length, 1));
  const handlePrev = () =>
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(featuredSlides.length, 1)) %
        Math.max(featuredSlides.length, 1)
    );

  useEffect(() => {
    if (featuredSlides.length <= 1) return undefined;
    const timer = setTimeout(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % Math.max(featuredSlides.length, 1)
      );
    }, 10000);
    return () => clearTimeout(timer);
  }, [currentSlide, featuredSlides.length]);

  return (
    <SiteShell>
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/90 px-4 py-8 text-slate-700 shadow-[0_0_50px_rgba(15,23,42,0.12)] sm:px-6 sm:py-10 dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-200">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="w-full space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-200">
              Featured News
            </p>
          </div>
        </div>
        {activeSlide && (
          <div className="relative px-2 sm:px-6">
            <article className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {activeSlide.url ? (
                    <a
                      href={activeSlide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition hover:text-cyan-600 dark:hover:text-cyan-200"
                    >
                      {activeSlide.title}
                    </a>
                  ) : (
                    activeSlide.title
                  )}
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300">
                  {activeSlide.excerpt}
                </p>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {activeSlide.statLine}
                </p>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="feature-frame relative h-64 w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-100 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <Image
                    src={activeSlide.image ?? defaultFeatureImage}
                    alt={activeSlide.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="feature-art rounded-[26px] object-cover"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </article>

            <button
              onClick={handlePrev}
              className="absolute left-[-12px] top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 sm:flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
              aria-label="Previous featured post"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-[-12px] top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 sm:flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
              aria-label="Next featured post"
            >
              ›
            </button>
          </div>
        )}
        {featuredSlides.length > 0 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-slate-400">
            {featuredSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-8 rounded-full cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-10 ${
                  slide.id === activeSlide?.id
                    ? "bg-cyan-500"
                    : "bg-slate-200 dark:bg-slate-700/60"
                }`}
                aria-label={`Go to featured post ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6">
        <div className="panel-tech w-92 sm:w-full space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-slate-700 shadow-[0_15px_40px_rgba(15,23,42,0.1)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
            <p className="text-base font-semibold tracking-[0.1em] text-cyan-600 dark:text-cyan-200">
              Tech moves fast. Stay ahead, stay curious, stay informed.
            </p>
            <span>
              {feedState === "loading" && "Syncing feed..."}
              {feedState === "ready" && `${gridPosts.length} live stories`}
              {feedState === "error" && (feedError ?? "Feed unavailable")}
            </span>
          </div>
          {gridPosts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200/80 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-400">
              {feedState === "loading"
                ? "Calibrating the feed..."
                : "No live items yet. Re-run the uplink shortly."}
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2">
              {gridPosts.map((post) => {
                const categories = (post.categories ?? []).filter(Boolean);
                const tags = (post.tags ?? []).filter(Boolean);
                const showDetails = categories.length > 0 || tags.length > 0;
                return (
                  <article
                    key={post.id ?? post.url}
                    className="card-tech w-82 sm:w-full flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/80 p-6 transition hover:border-cyan-400/70 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/40"
                  >
                    <a
                      href={post.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-1 break-words text-lg font-semibold text-[#1c1f23] transition hover:text-slate-700 dark:text-white dark:hover:text-cyan-200"
                    >
                      <span className="flex-1 leading-tight text-cyan-600 sm:text-cyan-500 group-hover:text-cyan-700">
                        🌐 {post.title ?? "Untitled feed"}
                      </span>
                    </a>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      {formatDate(post.publishedAt)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Source: {post.source?.name ?? "GeekFeed"}
                    </p>
                    <p className="mt-3 text-sm text-slate-600 break-words hyphens-auto dark:text-slate-300">
                      {limitWords(post.summary ?? post.description ?? "", 50) ||
                        "No description supplied."}
                    </p>
                    {showDetails && (
                      <details className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                        <summary className="cursor-pointer text-xs font-semibold tracking-[0.2em] text-cyan-600 dark:text-cyan-200">
                          Tags & Context
                        </summary>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {categories.map((category) => (
                            <span
                              key={`${post.id}-cat-${category}`}
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-200"
                            >
                              {category}
                            </span>
                          ))}
                          {tags.map((tag) => (
                            <span
                              key={`${post.id}-tag-${tag}`}
                              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </details>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

