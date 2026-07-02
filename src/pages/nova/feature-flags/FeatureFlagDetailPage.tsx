import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/nova/ui";

/** Placeholder until NS-65 (flag editor, toggles, audit history). */
export default function FeatureFlagDetailPage() {
  const { key } = useParams();

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="Platform"
        title={key ?? "Feature flag"}
        description="Per-environment toggles and change history arrive in the next story (NS-65)."
      />
      <Link to="/feature-flags" className="text-sm text-primary hover:underline">
        ← Back to feature flags
      </Link>
    </div>
  );
}
