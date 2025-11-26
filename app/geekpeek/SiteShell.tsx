'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { podcastWidgets, sidebarSpotlight, sidebarWidgets } from "./sidebarData";

const navLinks = [
  { label: "Geek-Peek", href: "/" },
  { label: "Geek-Seek", href: "/geekseek" },
  { label: "Geek-Launch", href: "/geeklaunch" },
  /* { label: "Geekverse", href: "/geekverse" }, */
  { label: "Geek-Reach", href: "/geekreach" },
];

const footerPrimary = [{ label: "About", href: "/about" }];

const footerCompliance = [
  { label: "Privacy Policy (EU)", href: "/privacy-policy" },
  { label: "Data Processing Addendum", href: "/data-processing-addendum" },
  { label: "Imprint / Impressum", href: "/imprint" },
];

const extractHost = (url?: string) => {
  if (!url) return "Open link";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || "Open link";
  } catch {
    return "Open link";
  }
};

type ThemeMode = "light" | "dark";

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("geekageddon-theme");
  return stored === "light" || stored === "dark" ? stored : null;
};

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "light" : getStoredTheme() ?? getPreferredTheme()
  );
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const bannerTimer = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    const preferred = getStoredTheme() ?? getPreferredTheme();
    const nextTheme = preferred ?? theme;
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    root.classList.toggle("dark", nextTheme === "dark");
    document.body.dataset.theme = nextTheme;
    document.body.classList.toggle("dark", nextTheme === "dark");
    if (nextTheme !== theme) {
      setTheme(nextTheme);
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scheduleHide = () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setBannerVisible(false), 3000);
    };
    const handleActivity = () => {
      setBannerVisible(true);
      scheduleHide();
    };
    handleActivity();
    const events: Array<[keyof WindowEventMap, (e: Event) => void]> = [
      ["scroll", handleActivity],
      ["mousemove", handleActivity],
      ["touchstart", handleActivity],
      ["keydown", handleActivity],
    ];
    events.forEach(([evt, handler]) => window.addEventListener(evt, handler, { passive: true }));
    return () => {
      events.forEach(([evt, handler]) => window.removeEventListener(evt, handler));
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme()) return;
      setTheme(event.matches ? "dark" : "light");
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "geekageddon-theme" && (event.newValue === "light" || event.newValue === "dark")) {
        setTheme(event.newValue);
      }
    };
    mediaQuery.addEventListener?.("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      mediaQuery.removeEventListener?.("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
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
    const syncLayout = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setDrawerOpen(desktop);
      if (desktop) {
        setMobileNavOpen(false);
      }
    };
    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  const sidebarTransform = drawerOpen ? "translate-x-0" : "-translate-x-full";
  const desktopPaddingClass = drawerOpen && isDesktop ? "lg:pl-[20rem]" : "lg:pl-8";
  const shouldShowSidebarOverlay = !isDesktop && drawerOpen;

  return (
    <div className="relative min-h-screen bg-white text-slate-900 transition-colors duration-500 dark:bg-[#0b1220] dark:text-slate-100">
      <div className="noise-layer" aria-hidden />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/90 text-slate-700 shadow-[0_4px_20px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/70 dark:bg-[#0f1a2e]/80 dark:text-slate-200 dark:shadow-[0_0_25px_rgba(56,189,248,0.12)]">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-2xl font-semibold border border-cyan-500/60 bg-gradient-to-br from-white via-white to-slate-50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-cyan-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-200 dark:hover:text-cyan-100"
            >
              Geekageddon
            </Link>
            <p className="hidden text-[0.65rem] tracking-[0.3em] text-cyan-500 dark:text-cyan-300 sm:block">
              The Armageddon of the Tech World
            </p>
          </div>
          <div className="hidden flex-1 items-center justify-center gap-2 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-full px-3 py-1 transition ${
                  (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    ? "border border-cyan-600 bg-cyan-100 text-cyan-800 shadow-sm dark:border-cyan-400/60 dark:bg-cyan-900/30 dark:text-cyan-100"
                    : "border border-transparent text-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-white"
                }`}
                aria-current={
                  (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "page" : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-500 transition hover:scale-105 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            <a
              href="https://geekageddon.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe to Geekageddon Newsletter and Podcast"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/70 bg-white/90 text-orange-500 transition hover:scale-105 hover:text-orange-400 dark:border-orange-200/40 dark:bg-slate-950/60 dark:text-orange-200"
            >
              <SubstackIcon />
            </a>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/60 bg-white/90 text-amber-500 transition hover:scale-105 hover:text-amber-400 dark:border-amber-300/40 dark:bg-slate-950/60 dark:text-amber-200"
            >
              <span aria-hidden="true" suppressHydrationWarning>
                {mounted && (theme === "dark" ? <SunIcon /> : <MoonIcon />)}
                {!mounted && <span className="inline-block h-5 w-5" />}
              </span>
              <span className="sr-only">Toggle color theme</span>
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-600 transition hover:scale-105 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 md:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
          <p className="block text-[0.65rem] tracking-[0.3em] text-cyan-500 dark:text-cyan-300 sm:hidden">
            The Armageddon of the Tech World
          </p>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200/80 bg-white/95 px-4 py-3 text-sm shadow-lg dark:border-slate-800/60 dark:bg-slate-950/90">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                      ? "bg-cyan-100 text-cyan-800 shadow-sm dark:bg-cyan-900/20 dark:text-cyan-100"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/70"
                  }`}
                  aria-current={
                    (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "page" : undefined
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed left-3 top-[110px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-500/60 bg-white/90 text-cyan-600 shadow-lg transition hover:scale-105 hover:text-cyan-700 dark:border-cyan-400/60 dark:bg-slate-900/80 dark:text-cyan-100 sm:left-2 sm:top-24 lg:left-1"
        aria-label="Toggle control drawer"
      >
        {drawerOpen ? <CloseIcon /> : <SidebarIcon />}
      </button>

      {shouldShowSidebarOverlay && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className={`flex w-full gap-6 pb-20 pt-24 px-4 sm:px-6 md:flex-row md:gap-10 lg:pr-10 ${desktopPaddingClass}`}>
        <aside
          className={`sidebar-tech fixed top-12 bottom-30 left-0 z-30 w-72 overflow-y-auto border border-slate-200/70 bg-white/95 px-6 pb-8 pt-4 text-sm shadow-2xl backdrop-blur transition-transform duration-500 ease-out dark:border-slate-800/70 dark:bg-slate-950/95 dark:shadow-[0_0_25px_rgba(56,189,248,0.12)] ${sidebarTransform}`}
        >
          <div className="space-y-8">
            <section>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-500 dark:text-cyan-300">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <span>On the Horizon</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              </div>
              <ol className="space-y-4">
                {sidebarSpotlight.map((post) => (
                  <li
                    key={post.title}
                    className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 transition hover:border-cyan-400/70 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:border-cyan-400/70"
                  >
                    <div className="space-y-1">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-600 underline-offset-4 hover:underline dark:text-cyan-300"
                      >
                        {extractHost(post.link)}
                      </a>
                      <p className=" text-slate-900 transition group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white">
                        {post.title}
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
                {sidebarWidgets.map((widget) => (
                  <div
                    key={widget.title}
                    className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-200/30 via-white/60 to-white/90 p-3 text-xs text-slate-600 dark:from-purple-900/20 dark:via-slate-900/70 dark:to-slate-950/70 dark:text-slate-300"
                  >
                    <a
                      href={widget.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-200"
                    >
                      {widget.title}
                    </a>
                    {widget.description && (
                      <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        {widget.description}
                      </p>
                    )}
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
              <div className="space-y-3">
                {podcastWidgets.map((widget) => (
                  <div
                    key={widget.title}
                    className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-200/30 via-white/60 to-white/90 p-3 text-xs text-slate-600 dark:from-purple-900/20 dark:via-slate-900/70 dark:to-slate-950/70 dark:text-slate-300"
                  >
                    <a
                      href={widget.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-200"
                    >
                      {widget.title}
                    </a>
                    {widget.description && (
                      <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                        {widget.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col gap-10 text-slate-700 dark:text-slate-200">{children}</main>
      </div>

      <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-6 text-sm text-slate-500 shadow-[0_-4px_20px_rgba(15,23,42,0.05)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-400 dark:shadow-[0_-4px_24px_rgba(56,189,248,0.08)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
            {footerPrimary.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-slate-600 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-200"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://geekageddon.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              title="Subscribe to Geekageddon Newsletter and Podcast"
              className="flex items-center gap-1 text-slate-600 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-200"
            >
              <SubstackIcon className="h-4 w-4" />
              <span>Newsletter</span>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:justify-end">
            {footerCompliance.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-200"
              >
                {item.label}
              </Link>
            ))} 
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center gap-2 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>
            In Beta · Please share your valuable feedback via{" "}
            <Link href="/geekreach" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200">
              Geek-Reach
            </Link>
            .
          </p>
          <p>© {new Date().getFullYear()} Geekageddon. Crafted in compliance with EU Digital Services, GDPR, and Cookie directives.</p>
        </div>
      </footer>

    </div>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.4-1.4M6.45 6.45l-1.4-1.4m0 14.9 1.4-1.4m12.1-12.1 1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5h16v14H4z" />
      <path d="M9 5v14" />
    </svg>
  );
}

function SubstackIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M4 5.5h16v2H4zm0 3.25h16v2H4zm0 3.25h16V18l-8-3-8 3z" />
    </svg>
  );
}

