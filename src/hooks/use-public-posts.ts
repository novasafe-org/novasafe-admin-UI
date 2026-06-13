import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { categoriesService } from "@/services/categories.service";
import { postsService } from "@/services/posts.service";
import type { PostDto } from "@/lib/api/types";

export function usePublicPostsQuery() {
  return useQuery({
    queryKey: [...queryKeys.posts.all, "public"],
    queryFn: async () => {
      const [response, categories] = await Promise.all([
        postsService.listPublic({ perPage: 50 }),
        categoriesService.list().catch(() => []),
      ]);

      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

      return response.data.map((post) => ({
        ...post,
        categoryName: post.category_id ? categoryMap.get(post.category_id) ?? null : null,
      }));
    },
  });
}

export function usePublicPostQuery(slug: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.posts.all, "public", slug],
    queryFn: async () => {
      const [{ post, redirectSlug }, categories] = await Promise.all([
        postsService.getBySlug(slug!),
        categoriesService.list().catch(() => []),
      ]);

      const category = post.category_id
        ? categories.find((c) => c.id === post.category_id)
        : null;

      return {
        ...post,
        categoryName: category?.name ?? null,
        redirectSlug,
      } satisfies PostDto & { categoryName: string | null; redirectSlug?: string };
    },
    enabled: Boolean(slug),
    retry: false,
  });
}
