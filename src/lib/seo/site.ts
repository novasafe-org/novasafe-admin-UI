export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  defaultOgImage: string;
  twitterHandle?: string;
};

export function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8080";
}

export function getSiteConfig(): SiteConfig {
  return {
    name: import.meta.env.VITE_SITE_NAME ?? "Lexicon Blog",
    description:
      import.meta.env.VITE_SITE_DESCRIPTION ??
      "Insights, guides, and stories from the Lexicon team.",
    url: getSiteUrl(),
    defaultOgImage:
      import.meta.env.VITE_DEFAULT_OG_IMAGE ?? `${getSiteUrl()}/og-default.png`,
    twitterHandle: import.meta.env.VITE_TWITTER_HANDLE,
  };
}

export function blogPostUrl(slug: string): string {
  return `${getSiteUrl()}/blog/${slug}`;
}

export function blogIndexUrl(): string {
  return `${getSiteUrl()}/blog`;
}
