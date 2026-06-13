import type { PostDto } from "@/lib/api/types";
import { blogIndexUrl, blogPostUrl, getSiteConfig } from "./site";

export function buildBlogIndexJsonLd(posts: PostDto[]) {
  const site = getSiteConfig();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
      },
      {
        "@type": "Blog",
        "@id": `${blogIndexUrl()}/#blog`,
        url: blogIndexUrl(),
        name: site.name,
        description: site.description,
        publisher: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          "@id": `${blogPostUrl(post.slug)}/#article`,
          headline: post.title,
          url: blogPostUrl(post.slug),
          datePublished: post.published_at ?? post.created_at,
          dateModified: post.updated_at,
          author: {
            "@type": "Person",
            name: post.author.name,
          },
        })),
      },
    ],
  };
}

export function buildBlogPostJsonLd(post: PostDto) {
  const site = getSiteConfig();
  const url = blogPostUrl(post.slug);
  const image = post.featured_image ?? site.defaultOgImage;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Blog",
            item: blogIndexUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.title,
            item: url,
          },
        ],
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}/#article`,
        headline: post.title,
        description: post.seo_description ?? post.excerpt ?? undefined,
        image,
        url,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.updated_at,
        author: {
          "@type": "Person",
          name: post.author.name,
          ...(post.author.email ? { email: post.author.email } : {}),
        },
        publisher: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
        ...(post.seo_title ? { alternativeHeadline: post.seo_title } : {}),
      },
    ],
  };
}
