import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, MediaDto } from "@/lib/api/types";
import type { ImageTransformOptions } from "@/lib/slug";
import { optimizedMediaUrl } from "@/lib/slug";

type ListResponse = ApiSuccess<MediaDto[]>;

export type UploadProgressHandler = (percent: number) => void;

export const mediaService = {
  async list(params: { page?: number; perPage?: number } = {}): Promise<ListResponse> {
    const { data } = await apiClient.get<ListResponse>("/media", {
      params: {
        page: params.page ?? 1,
        perPage: params.perPage ?? 100,
      },
    });
    return data;
  },

  async upload(
    file: File,
    options?: { altText?: string; onProgress?: UploadProgressHandler },
  ): Promise<MediaDto> {
    const form = new FormData();
    form.append("file", file);
    if (options?.altText) form.append("altText", options.altText);

    const { data } = await apiClient.post<ApiSuccess<MediaDto>>("/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (!options?.onProgress || !event.total) return;
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data.data;
  },

  async delete(id: string, force = false): Promise<void> {
    await apiClient.delete(`/media/${id}`, { params: force ? { force: "true" } : undefined });
  },

  async deleteUnused(): Promise<number> {
    const { data } = await apiClient.delete<ApiSuccess<{ removed: number }>>("/media/unused");
    return data.data.removed;
  },

  optimizedUrl(url: string, transform?: ImageTransformOptions): string {
    return optimizedMediaUrl(url, transform);
  },
};
