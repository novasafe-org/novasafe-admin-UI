import { apiClient } from "@/lib/api/client";
import type {
  ApiSuccess,
  CategoryDto,
  CreateCategoryRequest,
} from "@/lib/api/types";

export const categoriesService = {
  async list(): Promise<CategoryDto[]> {
    const { data } = await apiClient.get<ApiSuccess<CategoryDto[]>>("/categories");
    return data.data;
  },

  async create(body: CreateCategoryRequest): Promise<CategoryDto> {
    const { data } = await apiClient.post<ApiSuccess<CategoryDto>>("/categories", body);
    return data.data;
  },

  async findOrCreate(name: string): Promise<CategoryDto> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Category name is required");

    const existing = (await this.list()).find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return existing;

    return this.create({ name: trimmed });
  },
};
