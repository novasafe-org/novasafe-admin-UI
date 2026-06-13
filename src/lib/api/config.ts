const API_BASE_URL_KEY = "novasafe_api_base_url";
const API_TOKEN_KEY = "novasafe_api_token";

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787/api/v1";

export function getApiBaseUrl(): string {
  const stored = localStorage.getItem(API_BASE_URL_KEY);
  return stored?.trim() || DEFAULT_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(API_BASE_URL_KEY, url.trim());
}

export function getApiToken(): string | null {
  const envToken = import.meta.env.VITE_API_TOKEN;
  if (envToken) return envToken;
  return localStorage.getItem(API_TOKEN_KEY);
}

export function setApiToken(token: string): void {
  localStorage.setItem(API_TOKEN_KEY, token.trim());
}

export function clearApiToken(): void {
  localStorage.removeItem(API_TOKEN_KEY);
}
