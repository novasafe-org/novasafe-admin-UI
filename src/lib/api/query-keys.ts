export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (params?: Record<string, unknown>) => ["posts", "list", params] as const,
    detail: (id: string) => ["posts", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  tags: {
    all: ["tags"] as const,
  },
  media: {
    all: ["media"] as const,
    list: (params?: Record<string, unknown>) => ["media", "list", params] as const,
  },
};
