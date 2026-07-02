const API_BASE = (import.meta.env.VITE_ADMIN_API_URL || "http://localhost:3130/api/v1").replace(/\/$/, "");

export type PermissionAction = "manage" | "read" | "none";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("nova:auth") || sessionStorage.getItem("nova:auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(json.message || res.statusText || "Request failed");
  }

  return json.data as T;
}

async function blogRequest<T>(path: string, options: RequestInit = {}): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.message ||
      (typeof json?.error === "string" ? json.error : null) ||
      "Request failed";
    throw new Error(msg);
  }
  return { data: (json?.data ?? json) as T, meta: json?.meta };
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: AuthUserDto; permissions: Record<string, PermissionAction> }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),

  me: () => request<{ user: AuthUserDto; permissions: Record<string, PermissionAction> }>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; resetUrl?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  validateInvite: (token: string) =>
    request<{ email: string; roleKey: string; expiresAt: string }>(`/auth/invite/${encodeURIComponent(token)}`),

  acceptInvite: (body: { token: string; name: string; password: string }) =>
    request<{ accessToken: string; user: AuthUserDto; permissions: Record<string, PermissionAction> }>(
      "/auth/accept-invite",
      { method: "POST", body: JSON.stringify(body) },
    ),

  rbacMatrix: () =>
    request<{
      roles: Array<{ key: string; name: string; description: string }>;
      permissions: Array<{ key: string; module: string; label: string; description: string }>;
      matrix: Record<string, Record<string, PermissionAction>>;
    }>("/rbac/matrix"),

  updatePermission: (roleKey: string, permissionKey: string, action: PermissionAction) =>
    request<void>(`/rbac/matrix/${roleKey}/${permissionKey}`, {
      method: "PUT",
      body: JSON.stringify({ action }),
    }),

  teamMembers: () =>
    request<Array<{ id: string; email: string; name: string; role: string; status: string; lastLogin: string | null }>>(
      "/team/members",
    ),

  createInvite: (email: string, roleKey: string) =>
    request<{ token: string; expiresAt: string; inviteUrl: string; emailSent: boolean }>("/team/invites", {
      method: "POST",
      body: JSON.stringify({ email, roleKey }),
    }),

  changelogList: async () => {
    const data = await request<ChangelogRelease[] | null | undefined>("/changelog");
    return (Array.isArray(data) ? data : []).map(normalizeChangelogRelease);
  },

  changelogGet: async (id: string) => {
    const data = await request<ChangelogRelease | null | undefined>(`/changelog/${encodeURIComponent(id)}`);
    if (!data) throw new Error("Release not found");
    return normalizeChangelogRelease(data);
  },

  createChangelog: async (body: ChangelogInput) =>
    normalizeChangelogRelease(await request<ChangelogRelease>("/changelog", { method: "POST", body: JSON.stringify(body) })),

  updateChangelog: async (id: string, body: Partial<ChangelogInput>) =>
    normalizeChangelogRelease(
      await request<ChangelogRelease>(`/changelog/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    ),

  deleteChangelog: (id: string) =>
    request<void>(`/changelog/${encodeURIComponent(id)}`, { method: "DELETE" }),

  statusOverview: () => request<StatusOverview>("/status/overview"),

  statusServices: () => request<StatusService[]>("/status/services"),

  statusIncidents: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    const token = getToken();
    const res = await fetch(`${API_BASE}/status/incidents${qs}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Failed to load incidents");
    return {
      items: (json.data ?? []) as StatusIncident[],
      pagination: json.pagination as { page: number; limit: number; total: number; hasNext: boolean } | undefined,
    };
  },

  statusIncident: (slug: string) => request<StatusIncidentDetail>(`/status/incidents/${encodeURIComponent(slug)}`),

  createStatusIncident: (body: StatusIncidentInput) =>
    request<StatusIncident>("/status/incidents", { method: "POST", body: JSON.stringify(body) }),

  updateStatusIncident: (id: string, body: Partial<StatusIncidentInput>) =>
    request<StatusIncident>(`/status/incidents/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  resolveStatusIncident: (id: string) =>
    request<StatusIncident>(`/status/incidents/${encodeURIComponent(id)}/resolve`, { method: "POST" }),

  createStatusService: (body: { key: string; name: string; description?: string }) =>
    request<StatusService>("/status/services", { method: "POST", body: JSON.stringify(body) }),

  listUsers: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    return request<{ items: CustomerUser[]; total: number; page: number; limit: number }>(
      `/users${qs ? `?${qs}` : ""}`,
    );
  },

  getUser: (id: string) => request<CustomerUser>(`/users/${encodeURIComponent(id)}`),

  blogPosts: async (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    const [postsRes, catsRes] = await Promise.all([
      blogRequest<BlogPostDto[]>(`/posts${qs ? `?${qs}` : ""}`),
      blogRequest<BlogCategoryDto[]>("/categories").catch(() => ({ data: [] as BlogCategoryDto[] })),
    ]);
    const catMap = new Map(catsRes.data.map((c) => [c.id, c.name]));
    return {
      items: postsRes.data.map((p) =>
        normalizePost(p, p.category_id ? catMap.get(p.category_id) ?? "—" : "—"),
      ),
      total: Number(postsRes.meta?.total ?? postsRes.data.length),
    };
  },

  blogPost: async (id: string) => {
    const [postRes, catsRes] = await Promise.all([
      blogRequest<BlogPostDto>(`/posts/id/${encodeURIComponent(id)}`),
      blogRequest<BlogCategoryDto[]>("/categories").catch(() => ({ data: [] as BlogCategoryDto[] })),
    ]);
    const categoryName = postRes.data.category_id
      ? catsRes.data.find((c) => c.id === postRes.data.category_id)?.name ?? "—"
      : "—";
    return normalizePost(postRes.data, categoryName);
  },

  createBlogPost: async (body: BlogPostInput) => {
    const { data } = await blogRequest<BlogPostDto>("/posts", { method: "POST", body: JSON.stringify(body) });
    return normalizePost(data);
  },

  updateBlogPost: async (id: string, body: Partial<BlogPostInput>) => {
    const { data } = await blogRequest<BlogPostDto>(`/posts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return normalizePost(data);
  },

  deleteBlogPost: (id: string) =>
    blogRequest<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" }),

  blogCategories: async () => {
    const { data } = await blogRequest<BlogCategoryDto[]>("/categories");
    return { items: data.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) };
  },

  createBlogCategory: async (name: string) => {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const { data } = await blogRequest<BlogCategoryDto>("/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), slug: slug || undefined }),
    });
    return { id: data.id, name: data.name, slug: data.slug };
  },

  blogTags: async () => {
    const { data } = await blogRequest<BlogTagDto[]>("/tags");
    return { items: data.map((t) => ({ id: t.id, name: t.name, slug: t.slug })) };
  },

  createBlogTag: async (name: string) => {
    const { data } = await blogRequest<BlogTagDto>("/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return { id: data.id, name: data.name, slug: data.slug };
  },

  blogMedia: async (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    const { data, meta } = await blogRequest<BlogMediaDto[]>(`/media${qs ? `?${qs}` : ""}`);
    return { items: data, total: Number(meta?.total ?? data.length) };
  },

  uploadBlogMedia: async (file: File, altText?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (altText) form.append("altText", altText);
    const { data } = await blogRequest<BlogMediaDto>("/media/upload", { method: "POST", body: form });
    return data;
  },

  deleteBlogMedia: (id: string) =>
    blogRequest<void>(`/media/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listFeatureFlags: (params?: { environment?: string }) => {
    const qs = params?.environment ? `?environment=${encodeURIComponent(params.environment)}` : "";
    return request<FeatureFlagRow[]>(`/feature-flags${qs}`);
  },

  listFeatureFlagMatrix: async (): Promise<FeatureFlagMatrixRow[]> => {
    const [production, staging, development] = await Promise.all([
      request<FeatureFlagRow[]>("/feature-flags?environment=production"),
      request<FeatureFlagRow[]>("/feature-flags?environment=staging"),
      request<FeatureFlagRow[]>("/feature-flags?environment=development"),
    ]);

    const byKey = new Map<string, FeatureFlagMatrixRow>();

    const mergeEnv = (
      rows: FeatureFlagRow[],
      env: "production" | "staging" | "development",
    ) => {
      for (const row of rows) {
        let entry = byKey.get(row.key);
        if (!entry) {
          entry = {
            key: row.key,
            displayName: row.displayName,
            description: row.description,
            owner: row.owner || "—",
            category: row.category,
            tier: row.tier,
            lifecycle: row.lifecycle,
            production: false,
            staging: false,
            development: false,
            lastChanged: null,
            lastChangedBy: null,
          };
          byKey.set(row.key, entry);
        }
        entry[env] = row.enabled;
        if (row.owner) entry.owner = row.owner;
        if (row.updatedAt && (!entry.lastChanged || row.updatedAt > entry.lastChanged)) {
          entry.lastChanged = row.updatedAt;
          entry.lastChangedBy = row.updatedByEmail ?? row.updatedBy;
        }
      }
    };

    mergeEnv(production, "production");
    mergeEnv(staging, "staging");
    mergeEnv(development, "development");

    return Array.from(byKey.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  },
};

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  lastLogin?: string;
};

export type StatusService = {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: "operational" | "degraded" | "major";
  uptime: {
    last24Hours: number;
    last30Days: number;
    last90Days: number;
  };
};

export type StatusIncident = {
  id: string;
  serviceId: string;
  serviceKey: string;
  serviceName: string;
  title: string;
  slug: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "maintenance" | "degraded" | "major";
  description?: string;
  publicMessage?: string;
  startedAt: string;
  resolvedAt: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StatusIncidentDetail = StatusIncident & {
  affectedServices: string[];
  durationMinutes: number | null;
  timeline: Array<{
    status: StatusIncident["status"];
    label: string;
    at: string;
    description?: string;
  }>;
};

export type StatusIncidentInput = {
  serviceKey: string;
  title: string;
  severity: StatusIncident["severity"];
  description?: string;
  publicMessage?: string;
  status?: StatusIncident["status"];
  startedAt?: string;
  isPublic?: boolean;
};

export type StatusOverview = {
  overallStatus: "operational" | "degraded" | "major";
  services: StatusService[];
  activeIncidents: StatusIncident[];
  scheduledMaintenance: StatusIncident[];
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMarkdown: string;
  featuredImage: string | null;
  status: string;
  categoryId: string | null;
  categoryName: string;
  tagIds: string[];
  author?: { name?: string } | string;
  viewCount?: number;
  views?: number;
  updatedAt?: string;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type BlogCategory = { id: string; name: string; slug: string };
export type BlogTag = { id: string; name: string; slug: string };

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  country: string;
  devices: number;
  vaultItems: number;
  twoFA: boolean;
  securityScore: number;
  lastLogin: string | null;
  createdAt: string;
};

export type FeatureFlagRow = {
  key: string;
  displayName: string;
  description: string;
  owner?: string;
  category: string;
  tier: string;
  lifecycle: string;
  clientSurfaces: string[];
  environment: string;
  enabled: boolean;
  catalogDefault: boolean;
  version: number;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByEmail: string | null;
};

export type FeatureFlagMatrixRow = {
  key: string;
  displayName: string;
  description: string;
  owner: string;
  category: string;
  tier: string;
  lifecycle: string;
  production: boolean;
  staging: boolean;
  development: boolean;
  lastChanged: string | null;
  lastChangedBy: string | null;
};

type BlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  featured_image: string | null;
  status: string;
  category_id: string | null;
  tag_ids: string[];
  author: { id: string; name: string; email?: string };
  published_at: string | null;
  view_count?: number;
  unique_view_count?: number;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
};

type BlogCategoryDto = { id: string; name: string; slug: string };
type BlogTagDto = { id: string; name: string; slug: string };
export type BlogMediaDto = {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  mime_type: string;
  size: number;
  alt_text: string | null;
  uploaded_at: string;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content_markdown?: string;
  featured_image?: string | null;
  status?: string;
  category_id?: string | null;
  tag_ids?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
};

function normalizePost(dto: BlogPostDto, categoryName = "—"): BlogPost {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    excerpt: dto.excerpt,
    contentMarkdown: dto.content_markdown,
    featuredImage: dto.featured_image,
    status: dto.status,
    categoryId: dto.category_id,
    categoryName,
    tagIds: dto.tag_ids ?? [],
    author: dto.author,
    viewCount: dto.view_count ?? 0,
    views: dto.view_count ?? 0,
    updatedAt: dto.updated_at,
    publishedAt: dto.published_at,
    seoTitle: dto.seo_title,
    seoDescription: dto.seo_description,
  };
}

export type ChangelogCategory = "feature" | "improvement" | "security" | "bugfix" | "performance";
export type ChangelogStatus = "draft" | "published" | "scheduled";

export type ChangelogRelease = {
  id: string;
  version: string;
  title: string;
  category: ChangelogCategory;
  summary: string;
  notes: string[];
  content_markdown: string;
  tags: string[];
  status: ChangelogStatus;
  publishedAt: string | null;
  isPublic: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type ChangelogInput = {
  version: string;
  title: string;
  category?: ChangelogCategory;
  summary?: string;
  notes?: string[];
  content_markdown?: string;
  tags?: string[];
  status?: ChangelogStatus;
  publishedAt?: string | null;
  isPublic?: boolean;
};

/** Normalize API / legacy Mongo shapes so UI never reads undefined arrays. */
export function normalizeChangelogRelease(raw: Partial<ChangelogRelease> & { id?: string }): ChangelogRelease {
  const notes = Array.isArray(raw.notes) ? raw.notes : [];
  const contentMarkdown = raw.content_markdown ?? notes.join("\n");
  const category = normalizeChangelogCategory(raw.category);
  const status: ChangelogStatus =
    raw.status === "draft" || raw.status === "published" || raw.status === "scheduled"
      ? raw.status
      : raw.isPublic === false
        ? "draft"
        : "published";

  return {
    id: String(raw.id ?? ""),
    version: String(raw.version ?? ""),
    title: String(raw.title ?? ""),
    category,
    summary: String(raw.summary ?? ""),
    notes,
    content_markdown: contentMarkdown,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    status,
    publishedAt: raw.publishedAt ?? null,
    isPublic: raw.isPublic !== false,
    slug: String(raw.slug ?? ""),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeChangelogCategory(value: unknown): ChangelogCategory {
  const raw = String(value ?? "feature").toLowerCase();
  if (raw === "bug fix" || raw === "bugfix") return "bugfix";
  if (raw === "feature" || raw === "improvement" || raw === "security" || raw === "performance") {
    return raw;
  }
  return "feature";
}

export { normalizePost };

export { API_BASE, getToken };
