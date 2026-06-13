/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TOKEN?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_DESCRIPTION?: string;
  readonly VITE_DEFAULT_OG_IMAGE?: string;
  readonly VITE_TWITTER_HANDLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
