export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export type PostAuthorDto = {
  id: string;
  name: string;
  email?: string;
};

export type PostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  featured_image: string | null;
  status: PostStatus;
  category_id: string | null;
  tag_ids: string[];
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  author: PostAuthorDto;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type TagDto = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type MediaDto = {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_at: string;
};

export type PaginationMeta = {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  redirect_slug?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
};

export type CreatePostRequest = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content_markdown?: string;
  featured_image?: string | null;
  status?: PostStatus;
  category_id?: string | null;
  tag_ids?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  published_at?: string | null;
};

export type UpdatePostRequest = Partial<CreatePostRequest>;

export type CreateCategoryRequest = {
  name: string;
  slug?: string;
  description?: string | null;
};

export type CreateTagRequest = {
  name: string;
  slug?: string;
};

export type ListPostsParams = {
  page?: number;
  perPage?: number;
  status?: PostStatus;
  q?: string;
};
