'use client';

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

const fallbackSlides: FeaturedSlide[] = [
  {
    id: "fallback-1",
    title: "Quantum Sandboxing 2.0",
    excerpt:
      "Live-coded hardening rituals for devs who prefer their zero-days toasted and annotated.",
    tag: "DevSecOps",
    statLine: "8 min read - 204 comments - 14k views",
    accent: accentPalette[0],
    image: defaultFeatureImage,
  },
  {
    id: "fallback-2",
    title: "AI Wars: Rise of the Agents",
    excerpt:
      "A bootcamp recap on agents chaining with emotion stacks and how to stop them from staging a coup.",
    tag: "AI Systems",
    statLine: "12 min read - 312 comments - 22k views",
    accent: accentPalette[1],
    image: defaultFeatureImage,
  },
  {
    id: "fallback-3",
    title: "Retro Console BIOS Archaeology",
    excerpt:
      "Dumping the vault for cartridge necromancers: brand-new exploits for decade-old kernels.",
    tag: "Hardware Hacks",
    statLine: "6 min read - 119 comments - 9k views",
    accent: accentPalette[2],
    image: defaultFeatureImage,
  },
];

const spotlightPosts = [
  { title: "Google Hackathon", link: "https://geekageddon.com" },
  { title: "Rustlings in the Grid", link: "https://geekageddon.com" },
  { title: "Circuit Sprints #42", link: "https://geekageddon.com" },
  { title: "Kernel Panic Cast", link: "https://geekageddon.com" },
  { title: "Indie Dev HoloJam", link: "https://geekageddon.com" },
];

const blogWidgets = [
  "Widget Slot: Galactic Job Board",
  "Widget Slot: Live Hackathons",
  "Widget Slot: Loot Drops & Swag",
];

const navLinks = ["Headlines", "Field Notes", "Build Logs", "Glitch Arcade"];

const footerPrimary = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
];

const footerCompliance = [
  { label: "Privacy Policy (EU)", href: "#" },
  { label: "Cookie Preferences", href: "#" },
  { label: "Data Processing Addendum", href: "#" },
  { label: "Imprint / Impressum", href: "#" },
];

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

const sanitizeImagePath = (value?: string) => {
  if (!value) return defaultFeatureImage;
  if (/^https?:\/\//i.test(value)) return value;
  const cleaned = value.replace(/^(\.\.\/)+public\//, "/").replace(/^public\//, "/");
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

const deriveImage = (item: GeekFeedItem) =>
  sanitizeImagePath(
    item.image ||
      item.imageUrl ||
      item.heroImage ||
      item.coverImage ||
      item.media?.url ||
      defaultFeatureImage
  );

const buildSlide = (item: GeekFeedItem, accentIndex: number): FeaturedSlide => ({
  id: item.id ?? item.url ?? `feature-${accentIndex}`,
  title: item.title ?? "Geekageddon dispatch",
  excerpt:
    limitWords(item.summary ?? item.description ?? "", 40) ||
    "Fresh drop from the Geekageddon newsroom.",
  tag: item.source?.name ?? "Geekageddon",
  statLine: `${formatDate(item.publishedAt)} - ${item.source?.name ?? "GeekFeed"}`,
  accent: accentPalette[accentIndex % accentPalette.length],
  url: item.url,
  image: deriveImage(item),
});

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredSlides, setFeaturedSlides] = useState<FeaturedSlide[]>(fallbackSlides);
  const [gridPosts, setGridPosts] = useState<GeekFeedItem[]>([]);
  const [feedState, setFeedState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    // Keep the UI in sync with saved preference and OS theme changes.
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const stored = window.localStorage.getItem("geekageddon-theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
      setTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncTheme);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(syncTheme);
    }
    window.addEventListener("storage", syncTheme);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", syncTheme);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(syncTheme);
      }
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    document.body.dataset.theme = theme;
    document.body.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("geekageddon-theme", theme);
  }, [theme]);

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
        const featuredFromApi = items.filter(
          (item) => item.source?.id === "geekageddon-featured"
        );
        const nonFeatured = items.filter(
          (item) => item.source?.id !== "geekageddon-featured"
        );

        setFeaturedSlides(
          featuredFromApi.length
            ? featuredFromApi.map((item, index) => buildSlide(item, index))
            : fallbackSlides
        );
        setGridPosts(nonFeatured);
        setFeedState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setFeedState("error");
        setFeedError(error instanceof Error ? error.message : "Failed to load feed");
        setFeaturedSlides((prev) => (prev.length ? prev : fallbackSlides));
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
    if (currentSlide >= featuredSlides.length) {
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
    setCurrentSlide((prev) =>
      (prev - 1 + Math.max(featuredSlides.length, 1)) %
        Math.max(featuredSlides.length, 1)
    );

  const sidebarTransform = drawerOpen ? "translate-x-0" : "-translate-x-full";
  const desktopPaddingClass = drawerOpen ? "md:pl-[20rem]" : "md:pl-8";

  return (
    <div className="relative min-h-screen bg-white text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="noise-layer" aria-hidden />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/85 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-200">
        <div className="flex w-full justify-between gap-4 pl-3 pr-4 py-3 md:pl-6 md:pr-6 lg:pl-8 lg:pr-10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-500/60 bg-gradient-to-br from-white via-white to-slate-50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-cyan-600 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-200">
              Geekageddon
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {navLinks.map((link) => (
              <button
                key={link}
                className="rounded-full border border-transparent px-3 py-1 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-white"
              >
                {link}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-500 transition hover:scale-105 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
              aria-label="Search Geekageddon"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/60 bg-white/90 text-amber-500 transition hover:scale-105 hover:text-amber-400 dark:border-amber-300/40 dark:bg-slate-950/60 dark:text-amber-200"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span className="sr-only">Toggle color theme</span>
            </button>
            {/* <button className="rounded-full border border-cyan-500/60 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/10 dark:border-cyan-400/60 dark:text-cyan-200 dark:hover:bg-cyan-400/20">
              Join Beta
            </button> */}
          </div>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed left-2 top-32 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/60 bg-white/90 text-cyan-600 shadow-lg transition hover:scale-105 hover:text-cyan-700 dark:border-cyan-400/60 dark:bg-slate-900/80 dark:text-cyan-100"
        aria-label="Toggle control drawer"
      >
        {drawerOpen ? "«" : "»"}
      </button>

      <div
        className={`mx-auto flex w-full max-w-7xl flex-col gap-6 pb-16 pt-36 pl-4 pr-4 md:flex-row md:gap-10 md:pr-6 lg:pr-10 ${desktopPaddingClass}`}
      >
        <aside
          className={`sidebar-tech fixed bottom-0 left-0 top-32 z-30 w-72 overflow-y-auto border border-slate-200/70 bg-white/95 px-6 pb-10 pt-6 font-mono text-sm shadow-2xl backdrop-blur transition-transform duration-500 ease-out dark:border-slate-800/70 dark:bg-slate-950/95 ${sidebarTransform}`}
        >
          <div className="space-y-8">
            <section>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-500 dark:text-cyan-300">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <span>Upcoming Drops</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              </div>
              <ol className="space-y-4">
                {spotlightPosts.map((post) => (
                  <li
                    key={post.title}
                    className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2 transition hover:border-cyan-400/70 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:border-cyan-400/70"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 transition group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <a href={post.link}>{post.link}</a>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-3">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-500 dark:text-cyan-300">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <span>Blog-tastic</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              </div>
              <div className="space-y-3">
                {blogWidgets.map((widget) => (
                  <div
                    key={widget}
                    className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-200/30 via-white/60 to-white/90 p-3 text-xs text-slate-600 dark:from-purple-900/20 dark:via-slate-900/70 dark:to-slate-950/70 dark:text-slate-300"
                  >
                    {widget}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-500 dark:text-cyan-300">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <span>Podcast Pearls</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              </div>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span>☄️</span>
                  <span>Grid Summit livestream</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🛰️</span>
                  <span>Open hardware teardown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎮</span>
                  <span>Neo-arcade code jam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🧬</span>
                  <span>Bio-synth micro lab notes</span>
                </li>
              </ul>
            </section>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-10 text-slate-700 dark:text-slate-200">

          <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/90 px-6 py-10 text-slate-700 shadow-[0_0_50px_rgba(15,23,42,0.12)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-200">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-cyan-600 dark:text-cyan-200">
                  Featured News
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Curated briefings from the Tech World
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {featuredSlides.map((slide) => (
                  <span
                    key={slide.id}
                    className={`h-2 w-10 rounded-full transition ${
                      slide.id === activeSlide?.id
                        ? "bg-cyan-500"
                        : "bg-slate-200 dark:bg-slate-700/60"
                    }`}
                  />
                ))}
              </div>
            </div>
            {activeSlide && (
              <div className="relative px-6">
                <article className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <span className="inline-flex items-center rounded-full border border-cyan-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-200">
                      {activeSlide.tag}
                    </span>
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
                        priority
                      />
                    </div>
                  </div>
                </article>

                <button
                  onClick={handlePrev}
                  className="absolute left-[-12px] top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
                  aria-label="Previous featured post"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-[-12px] top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-white"
                  aria-label="Next featured post"
                >
                  ›
                </button>
              </div>
            )}
          </section>

          <section className="grid gap-6">
            <div className="panel-tech space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-slate-700 shadow-[0_15px_40px_rgba(15,23,42,0.1)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                <p className="text-base font-semibold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-200">
                  Latest in the tech world !
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
                        className="card-tech flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/80 p-6 transition hover:border-cyan-400/70 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/40"
                      >
                        <a
                          href={post.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-1 break-words text-lg font-semibold text-[#1c1f23] transition hover:text-slate-700 dark:text-white dark:hover:text-cyan-200"
                        >
                          <span className="flex-1 leading-tight">
                            {post.title ?? "Untitled dispatch"}
                          </span>
                          <GlobeIcon className="h-4 w-4 shrink-0 text-cyan-600 transition group-hover:text-cyan-400 dark:text-cyan-200" />
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
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-200">
                              More details
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

          <footer className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.1)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-400">
            <div className="flex flex-wrap gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800/60">
              {footerPrimary.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-600 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {footerCompliance.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xs text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Geekageddon. Crafted in compliance with EU Digital Services,
              GDPR, and Cookie directives.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.4-1.4M6.45 6.45l-1.4-1.4m0 14.9 1.4-1.4m12.1-12.1 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
