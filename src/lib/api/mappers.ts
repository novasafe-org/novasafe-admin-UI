import type { BlogPost } from "@/context/AppContext";
import type { CategoryDto, MediaDto, PostDto, TagDto } from "./types";

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function toBlogPost(
  post: PostDto,
  categories: CategoryDto[] = [],
  tags: TagDto[] = [],
): BlogPost {
  const category = categories.find((c) => c.id === post.category_id);
  const postTags = tags.filter((t) => post.tag_ids.includes(t.id));
  const words = wordCount(post.content_markdown);

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content_markdown,
    excerpt: post.excerpt ?? post.content_markdown.slice(0, 150),
    status: post.status,
    category: category?.name ?? "",
    categoryId: post.category_id,
    tags: postTags.map((t) => t.name),
    tagIds: post.tag_ids,
    featuredImage: post.featured_image ?? "",
    metaTitle: post.seo_title ?? "",
    metaDescription: post.seo_description ?? "",
    keywords: [],
    author: post.author.name,
    views: 0,
    readTime: Math.max(1, Math.ceil(words / 200)),
    wordCount: words,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    publishedAt: post.published_at ?? undefined,
  };
}

export function toMediaItem(media: MediaDto) {
  return {
    id: media.id,
    name: media.original_name,
    url: media.url,
    type: media.mime_type,
    size: media.size,
    createdAt: media.uploaded_at,
  };
}
