import { useEffect, useState } from "react";

import { fetchBuildMetadata, type BuildMetadata } from "@/lib/build-info";

export function useBuildMetadata() {
  const [meta, setMeta] = useState<BuildMetadata | null>(null);

  useEffect(() => {
    void fetchBuildMetadata().then(setMeta);
  }, []);

  return meta;
}
