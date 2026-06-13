import { Helmet } from "react-helmet-async";
import type { PostDto } from "@/lib/api/types";
import { buildBlogIndexJsonLd, buildBlogPostJsonLd } from "@/lib/seo/json-ld";
import { blogIndexUrl, blogPostUrl, getSiteConfig } from "@/lib/seo/site";

type BlogIndexSeoProps = {
  posts: PostDto[];
};

type BlogPostSeoProps = {
  post: PostDto;
};

export function BlogIndexSeo({ posts }: BlogIndexSeoProps) {
  const site = getSiteConfig();
  const title = `${site.name} | Blog`;
  const description = site.description;
  const url = blogIndexUrl();
  const jsonLd = buildBlogIndexJsonLd(posts);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={site.defaultOgImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={site.defaultOgImage} />
      {site.twitterHandle && <meta name="twitter:site" content={site.twitterHandle} />}

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}

export function BlogPostSeo({ post }: BlogPostSeoProps) {
  const site = getSiteConfig();
  const title = post.seo_title || post.title;
  const description =
    post.seo_description || post.excerpt || site.description;
  const url = blogPostUrl(post.slug);
  const image = post.featured_image ?? site.defaultOgImage;
  const published = post.published_at ?? post.created_at;
  const jsonLd = buildBlogPostJsonLd(post);

  return (
    <Helmet>
      <title>{`${title} | ${site.name}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={post.canonical_url ?? url} />

      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="article:published_time" content={published} />
      <meta property="article:modified_time" content={post.updated_at} />
      <meta property="article:author" content={post.author.name} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {site.twitterHandle && <meta name="twitter:site" content={site.twitterHandle} />}

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
