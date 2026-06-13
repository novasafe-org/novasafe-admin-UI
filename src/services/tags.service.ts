import { apiClient } from "@/lib/api/client";
import type { ApiSuccess, CreateTagRequest, TagDto } from "@/lib/api/types";

export const tagsService = {
  async list(): Promise<TagDto[]> {
    const { data } = await apiClient.get<ApiSuccess<TagDto[]>>("/tags");
    return data.data;
  },

  async create(body: CreateTagRequest): Promise<TagDto> {
    const { data } = await apiClient.post<ApiSuccess<TagDto>>("/tags", body);
    return data.data;
  },

  async resolveTagIds(names: string[]): Promise<string[]> {
    const trimmed = names.map((n) => n.trim()).filter(Boolean);
    if (trimmed.length === 0) return [];

    const existing = await this.list();
    const ids: string[] = [];

    for (const name of trimmed) {
      const match = existing.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (match) {
        ids.push(match.id);
      } else {
        const created = await this.create({ name });
        existing.push(created);
        ids.push(created.id);
      }
    }

    return ids;
  },
};
