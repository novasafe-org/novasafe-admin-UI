import { Link, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getSiteConfig } from "@/lib/seo/site";

export function BlogLayout() {
  const site = getSiteConfig();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Helmet>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${site.name} RSS`}
          href="/feed.xml"
        />
      </Helmet>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/blog" className="font-semibold text-foreground hover:text-primary transition-colors">
            {site.name}
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/blog" className="hover:text-foreground transition-colors">
              All posts
            </Link>
            <Link to="/" className="hover:text-foreground transition-colors">
              CMS
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {site.name}</p>
        </div>
      </footer>
    </div>
  );
}
