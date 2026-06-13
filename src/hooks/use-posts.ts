import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { toBlogPost } from "@/lib/api/mappers";
import { slugify } from "@/lib/slug";
import type { CreatePostRequest, ListPostsParams, PostStatus, UpdatePostRequest } from "@/lib/api/types";
import { postsService } from "@/services/posts.service";
import { categoriesService } from "@/services/categories.service";
import { tagsService } from "@/services/tags.service";

export function usePostsQuery(params: ListPostsParams = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: async () => {
      const [response, categories, tags] = await Promise.all([
        postsService.list(params),
        categoriesService.list().catch(() => []),
        tagsService.list().catch(() => []),
      ]);
      return {
        posts: response.data.map((p) => toBlogPost(p, categories, tags)),
        meta: response.meta,
      };
    },
  });
}

export function usePostQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id ?? ""),
    queryFn: async () => {
      const [post, categories, tags] = await Promise.all([
        postsService.getById(id!),
        categoriesService.list().catch(() => []),
        tagsService.list().catch(() => []),
      ]);
      return toBlogPost(post, categories, tags);
    },
    enabled: Boolean(id),
  });
}

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: () => tagsService.list(),
  });
}

export type PostEditorInput = {
  title: string;
  slug: string;
  slugManual: boolean;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  publishedAt?: string;
};

async function toApiPayload(input: PostEditorInput): Promise<CreatePostRequest> {
  const category = input.category.trim()
    ? await categoriesService.findOrCreate(input.category)
    : null;
  const tag_ids = await tagsService.resolveTagIds(input.tags);

  const payload: CreatePostRequest = {
    title: input.title,
    content_markdown: input.content,
    excerpt: input.content.slice(0, 150) || null,
    status: input.status,
    category_id: category?.id ?? null,
    tag_ids,
    seo_title: input.metaTitle || null,
    seo_description: input.metaDescription || null,
    featured_image: input.featuredImage || null,
    published_at:
      input.status === "published"
        ? input.publishedAt ?? new Date().toISOString()
        : input.status === "scheduled"
          ? input.publishedAt ?? null
          : null,
  };

  if (input.slugManual && input.slug) {
    payload.slug = slugify(input.slug);
  } else if (!input.slugManual && input.title) {
    payload.slug = slugify(input.title);
  }

  return payload;
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PostEditorInput) => {
      const body = await toApiPayload({ ...input, status: input.status === "archived" ? "draft" : input.status });
      return postsService.create(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PostEditorInput }) => {
      const body = await toApiPayload(input);
      return postsService.update(id, body as UpdatePostRequest);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useSaveDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PostEditorInput }) => {
      const body = await toApiPayload({ ...input, status: "draft" });
      return postsService.saveDraft(id, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
  });
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publishedAt }: { id: string; publishedAt?: string }) =>
      postsService.publish(id, publishedAt),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
  });
}

export function useUnpublishPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsService.unpublish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useArchivePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsService.archive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
    },
  });
}

export function useSchedulePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
      publishedAt,
    }: {
      id: string;
      input: PostEditorInput;
      publishedAt: string;
    }) => {
      const body = await toApiPayload({ ...input, status: "scheduled", publishedAt });
      return postsService.update(id, body as UpdatePostRequest);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
