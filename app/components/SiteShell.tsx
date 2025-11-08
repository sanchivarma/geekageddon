'use client';

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

const navLinks = [
  { label: "Geek Peek", href: "#" },
  { label: "Geek Seek", href: "#" },
  { label: "Geek Ventures", href: "#" },
  { label: "Geekverse", href: "#" },
  { label: "Contact", href: "/contact" },
];

const sidebarSpotlight = [
  { 
    title: "Wall St reacts to Musk's $1 trillion pay plan approval by Tesla investors", 
    link: "https://www.reuters.com/sustainability/boards-policy-regulation/wall-st-reacts-musks-1-trillion-pay-plan-approval-by-tesla-investors-2025-11-07/" 
  },
  { 
    title: "IFA 2025: the biggest tech and gadget announcements", 
    link: "https://www.theverge.com/news/767912/ifa-2025-news-tech-gadgets-products-updates-highlights" 
  },
  { 
    title: "100 things we announced at Google I/O 2025", 
    link: "https://blog.google/technology/ai/google-io-2025-all-our-announcements/" 
  },
  { 
    title: "Tech Weekly: Cloud providers, tech stocks outperform", 
    link: "https://investingnews.com/top-tech-news/" 
  },
  { 
    title: "Governor Newsom partners with world’s leading tech companies to prepare Californians for AI future", 
    link: "https://www.gov.ca.gov/2025/08/07/governor-newsom-partners-with-worlds-leading-tech-companies-to-prepare-californians-for-ai-future/" 
  }
];
const sidebarWidgets = [
  {
    title: "TechCrunch",
    link: "https://techcrunch.com",
    description: "Startup scoops, venture whispers, and big tech deal flow.",
  },
  {
    title: "The Verge",
    link: "https://www.theverge.com",
    description: "Design-forward reporting where gadgets meet culture.",
  },
  {
    title: "Wired",
    link: "https://www.wired.com",
    description: "Deep dives on science, security, and frontier tech shifts.",
  },
  {
    title: "Engadget",
    link: "https://www.engadget.com",
    description: "Hands-on gadget coverage for gearheads and tinkerers.",
  },
  {
    title: "CNET",
    link: "https://www.cnet.com",
    description: "Service journalism to help you choose everyday tech.",
  },
];

const podcastWidgets = [
  {
    title: "The Vergecast",
    link: "https://www.theverge.com/the-vergecast",
    description: "Nilay & crew unpack gadgets, policy, and future tech.",
  },
  {
    title: "Hard Fork",
    link: "https://www.nytimes.com/column/hard-fork",
    description: "NYT hosts debate AI, markets, and internet shifts.",
  },
  {
    title: "This Week in Tech (TWiT)",
    link: "https://twit.tv/shows/this-week-in-tech",
    description: "Leo Laporte's roundtable on the week's biggest tech news.",
  },
  {
    title: "Accidental Tech Podcast",
    link: "https://atp.fm",
    description: "Marco, Casey, and John riff on Apple, software, and dev life.",
  },
  {
    title: "Daily Tech News Show",
    link: "https://dailytechnewsshow.com",
    description: "Tom Merritt delivers global tech headlines every weekday.",
  },
];

const footerPrimary = [
  { label: "About", href: "#" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
];

const footerCompliance = [
  { label: "Privacy Policy (EU)", href: "#" },
  { label: "Cookie Preferences", href: "#" },
  { label: "Data Processing Addendum", href: "#" },
  { label: "Imprint / Impressum", href: "#" },
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

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
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
    mediaQuery.addEventListener?.("change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      mediaQuery.removeEventListener?.("change", syncTheme);
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
    <div className="relative min-h-screen bg-white text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="noise-layer" aria-hidden />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/90 text-slate-700 shadow-[0_4px_20px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-200">
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl font-semibold border border-cyan-500/60 bg-gradient-to-br from-white via-white to-slate-50 px-3 py-2 text-xs uppercase tracking-[0.4em] text-cyan-600 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:text-cyan-200">
              Geekageddon
            </div>
            <p className="hidden text-[0.65rem] tracking-[0.3em] text-cyan-500 dark:text-cyan-300 sm:block">
              The Armageddon of the Tech World
            </p>
          </div>
          <div className="hidden flex-1 items-center justify-center gap-2 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full border border-transparent px-3 py-1 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:text-slate-200 dark:hover:text-white"
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
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/60 bg-white/90 text-amber-500 transition hover:scale-105 hover:text-amber-400 dark:border-amber-300/40 dark:bg-slate-950/60 dark:text-amber-200"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
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
                  className="rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900/70"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="border-t border-dashed border-slate-200/80 bg-white/90 px-4 py-1 text-center text-xs font-semibold tracking-[0.2em] text-slate-600 dark:border-slate-800/70 dark:bg-slate-950/70 dark:text-slate-300">
          Beta mode &middot; We welcome your feedback and feature ideas
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setDrawerOpen((prev) => !prev)}
        className="fixed left-3 top-[88px] z-50 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/60 bg-white/90 text-cyan-600 shadow-lg transition hover:scale-105 hover:text-cyan-700 dark:border-cyan-400/60 dark:bg-slate-900/80 dark:text-cyan-100 sm:left-2 sm:top-24 lg:left-1"
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

      <div
        className={`flex w-full gap-6 pb-20 pt-24 px-4 sm:px-6 md:flex-row md:gap-10 lg:pr-10 ${desktopPaddingClass}`}>
        <aside
        className={`sidebar-tech fixed inset-y-20 left-0 z-30 w-72 overflow-y-auto border border-slate-200/70 bg-white/95 px-6 pb-8 pt-4 text-sm shadow-2xl backdrop-blur transition-transform duration-500 ease-out dark:border-slate-800/70 dark:bg-slate-950/95 ${sidebarTransform}`}
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
                    {/* <span className="text-cyan-600/80 dark:text-cyan-300/70">0{index + 1}</span> */}
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

      <footer className="border-t border-slate-200/80 bg-white/95 px-4 py-4 text-sm text-slate-500 shadow-[0_-4px_20px_rgba(15,23,42,0.05)] dark:border-slate-800/70 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {footerPrimary.map((item) => (
              <Link key={item.label} href={item.href} className="text-slate-600 transition hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            {footerCompliance.map((item) => (
              <Link key={item.label} href={item.href} className="text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Geekageddon. Crafted in compliance with EU Digital Services, GDPR, and Cookie directives.
        </p>
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
