export type BuildMetadata = {
  version: string;
  build: string;
  commit: string;
  branch: string;
  environment: string;
  releasedAt: string;
  repository: string;
};

let cached: BuildMetadata | null = null;

function fallback(): BuildMetadata {
  return {
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    build: "local",
    commit: "unknown",
    branch: "unknown",
    environment: import.meta.env.MODE || "development",
    releasedAt: new Date().toISOString(),
    repository: "novasafe-admin-panel",
  };
}

export async function fetchBuildMetadata(): Promise<BuildMetadata> {
  if (cached) return cached;
  try {
    const res = await fetch("/version.json", { cache: "no-store" });
    if (res.ok) {
      cached = (await res.json()) as BuildMetadata;
      return cached;
    }
  } catch {
    /* ignore */
  }
  cached = fallback();
  return cached;
}

export function getBuildMetadataSync(): BuildMetadata {
  return cached ?? fallback();
}
