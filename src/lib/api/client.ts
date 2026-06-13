import axios, { type AxiosError } from "axios";
import { getApiBaseUrl, getApiToken } from "./config";
import type { ApiErrorBody } from "./types";

export const apiClient = axios.create({
  timeout: 30_000,
});

/** Unauthenticated client for public blog routes. */
export const publicApiClient = axios.create({
  timeout: 30_000,
});

function attachBaseUrl(config: Parameters<Parameters<typeof apiClient.interceptors.request.use>[0]>[0]) {
  config.baseURL = getApiBaseUrl();
  return config;
}

apiClient.interceptors.request.use((config) => {
  attachBaseUrl(config);
  const token = getApiToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

publicApiClient.interceptors.request.use(attachBaseUrl);

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      "Request failed";
    return Promise.reject(new Error(message));
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      "Request failed";
    return Promise.reject(new Error(message));
  },
);
