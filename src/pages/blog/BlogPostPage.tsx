import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { BlogPostSeo } from "@/components/blog/BlogSeo";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { usePublicPostQuery } from "@/hooks/use-public-posts";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = usePublicPostQuery(slug);

  useEffect(() => {
    if (post?.redirectSlug && post.redirectSlug !== slug) {
      navigate(`/blog/${post.redirectSlug}`, { replace: true });
    }
  }, [post?.redirectSlug, slug, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading article...</span>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="text-muted-foreground">This article may have been removed or is not published yet.</p>
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
      </div>
    );
  }

  const published = post.published_at ?? post.created_at;

  return (
    <>
      <BlogPostSeo post={post} />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>

        <header className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {post.categoryName && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {post.categoryName}
              </span>
            )}
            <time dateTime={published}>{format(new Date(published), "MMMM d, yyyy")}</time>
            <span>·</span>
            <span>{post.author.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            {post.title}
          </h1>

          {(post.excerpt || post.seo_description) && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.excerpt || post.seo_description}
            </p>
          )}
        </header>

        {post.featured_image && (
          <figure className="mb-10">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-xl border border-border shadow-card"
            />
          </figure>
        )}

        <MarkdownContent content={post.content_markdown} />
      </article>
    </>
  );
}
