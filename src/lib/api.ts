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

async function blogRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || json?.message || "Request failed");
  }
  return (json?.data ?? json) as T;
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

  changelogList: () =>
    request<
      Array<{
        id: string;
        version: string;
        title: string;
        category: string;
        summary: string;
        notes: string[];
        publishedAt: string;
        isPublic: boolean;
        slug: string;
      }>
    >("/changelog"),

  createChangelog: (body: Record<string, unknown>) =>
    request<unknown>("/changelog", { method: "POST", body: JSON.stringify(body) }),

  updateChangelog: (id: string, body: Record<string, unknown>) =>
    request<void>(`/changelog/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  deleteChangelog: (id: string) =>
    request<void>(`/changelog/${id}`, { method: "DELETE" }),

  statusOverview: () => request<StatusOverview>("/status/overview"),

  statusServices: () => request<{ services: StatusService[] }>("/status/services"),

  blogPosts: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    return blogRequest<{ items: BlogPost[]; total: number }>(`/posts${qs ? `?${qs}` : ""}`);
  },

  blogCategories: () => blogRequest<{ items: BlogCategory[] }>("/categories"),

  blogTags: () => blogRequest<{ items: BlogTag[] }>("/tags"),
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
  id?: string;
  name: string;
  slug?: string;
  region?: string;
  status: string;
  latencyMs?: number;
  latency?: number;
  uptime90d?: number;
  uptime?: number;
};

export type StatusOverview = {
  status: string;
  services?: StatusService[];
  updatedAt?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  author?: { name?: string } | string;
  category?: { name?: string } | string;
  viewCount?: number;
  views?: number;
  updatedAt?: string;
};

export type BlogCategory = { id: string; name: string; slug: string };
export type BlogTag = { id: string; name: string; slug: string };

export { API_BASE, getToken };
