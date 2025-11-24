import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://geekageddon.com";
  const routes = [
    "",
    "/geekseek",
    "/geeklaunch",
    "/geekreach",
    "/about",
    "/privacy-policy",
    "/data-processing-addendum",
    "/imprint",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}
