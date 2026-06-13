import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { BlogIndexSeo } from "@/components/blog/BlogSeo";
import { usePublicPostsQuery } from "@/hooks/use-public-posts";
import { getSiteConfig } from "@/lib/seo/site";

export default function BlogIndexPage() {
  const site = getSiteConfig();
  const { data: posts = [], isLoading, isError, error } = usePublicPostsQuery();

  return (
    <>
      <BlogIndexSeo posts={posts} />

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">Blog</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">{site.name}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{site.description}</p>
        </header>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading posts...</span>
          </div>
        )}

        {isError && (
          <p className="text-destructive py-12">
            {error instanceof Error ? error.message : "Failed to load posts"}
          </p>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <p className="text-muted-foreground py-12">No published posts yet.</p>
        )}

        <div className="grid gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                {post.categoryName && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                    {post.categoryName}
                  </span>
                )}
                <time dateTime={post.published_at ?? post.created_at}>
                  {format(new Date(post.published_at ?? post.created_at), "MMMM d, yyyy")}
                </time>
                <span>·</span>
                <span>{post.author.name}</span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight mb-2">
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-foreground group-hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              {(post.excerpt || post.seo_description) && (
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt || post.seo_description}
                </p>
              )}

              <Link
                to={`/blog/${post.slug}`}
                className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
