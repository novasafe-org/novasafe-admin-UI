import { apiClient, publicApiClient } from "@/lib/api/client";
import type {
  ApiSuccess,
  CreatePostRequest,
  ListPostsParams,
  PostDto,
  UpdatePostRequest,
} from "@/lib/api/types";

type ListResponse = ApiSuccess<PostDto[]>;

export type PostBySlugResult = {
  post: PostDto;
  redirectSlug?: string;
};

export const postsService = {
  async list(params: ListPostsParams = {}): Promise<ListResponse> {
    const { data } = await apiClient.get<ListResponse>("/posts", {
      params: {
        page: params.page ?? 1,
        perPage: params.perPage ?? 100,
        status: params.status,
        q: params.q,
      },
    });
    return data;
  },

  async listPublic(params: { page?: number; perPage?: number } = {}): Promise<ListResponse> {
    const { data } = await publicApiClient.get<ListResponse>("/posts", {
      params: {
        page: params.page ?? 1,
        perPage: params.perPage ?? 50,
      },
    });
    return data;
  },

  async getById(id: string): Promise<PostDto> {
    const { data } = await apiClient.get<ApiSuccess<PostDto>>(`/posts/id/${id}`);
    return data.data;
  },

  async getBySlug(slug: string): Promise<PostBySlugResult> {
    const { data } = await publicApiClient.get<ApiSuccess<PostDto>>(`/posts/${slug}`);
    return { post: data.data, redirectSlug: data.meta?.redirect_slug };
  },

  async create(body: CreatePostRequest): Promise<PostDto> {
    const { data } = await apiClient.post<ApiSuccess<PostDto>>("/posts", body);
    return data.data;
  },

  async update(id: string, body: UpdatePostRequest): Promise<PostDto> {
    const { data } = await apiClient.put<ApiSuccess<PostDto>>(`/posts/${id}`, body);
    return data.data;
  },

  async saveDraft(id: string, body: UpdatePostRequest): Promise<PostDto> {
    return this.update(id, { ...body, status: "draft", published_at: null });
  },

  async publish(id: string, publishedAt?: string): Promise<PostDto> {
    return this.update(id, {
      status: "published",
      published_at: publishedAt ?? new Date().toISOString(),
    });
  },

  async unpublish(id: string): Promise<PostDto> {
    return this.update(id, { status: "draft", published_at: null });
  },

  async archive(id: string): Promise<PostDto> {
    return this.update(id, { status: "archived" });
  },

  async schedule(id: string, publishedAt: string): Promise<PostDto> {
    return this.update(id, { status: "scheduled", published_at: publishedAt });
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },
};
