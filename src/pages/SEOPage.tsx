import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";

export default function SEOPage() {
  const { posts } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(posts[0]?.id || null);
  const selected = posts.find((p) => p.id === selectedId);

  const getSeoScore = (post: typeof selected) => {
    if (!post) return 0;
    let score = 0;
    if (post.metaTitle && post.metaTitle.length >= 30 && post.metaTitle.length <= 60) score += 25;
    else if (post.metaTitle) score += 10;
    if (post.metaDescription && post.metaDescription.length >= 120 && post.metaDescription.length <= 160) score += 25;
    else if (post.metaDescription) score += 10;
    if (post.slug && post.slug.length > 3) score += 25;
    if (post.keywords && post.keywords.length > 0) score += 25;
    return score;
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Search className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">SEO Optimization</h1>
          <p className="text-sm text-muted-foreground">Analyze and optimize your content for search engines</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Post list */}
        <div className="bg-card rounded-xl shadow-card p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Select a post</p>
          {posts.map((post) => {
            const score = getSeoScore(post);
            return (
              <button
                key={post.id}
                onClick={() => setSelectedId(post.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${selectedId === post.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground"}`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${score >= 75 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive"}`} />
                <span className="truncate flex-1">{post.title}</span>
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Analysis */}
        {selected && (
          <div className="lg:col-span-2 space-y-4">
            {/* Score */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(217, 89%, 55%)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(getSeoScore(selected) / 100) * 175.9} 175.9`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-card-foreground">{getSeoScore(selected)}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-card-foreground">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">SEO Score: {getSeoScore(selected) >= 75 ? "Good" : getSeoScore(selected) >= 50 ? "Needs improvement" : "Poor"}</p>
                </div>
              </div>
            </motion.div>

            {/* Checks */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-card-foreground text-sm">Optimization Checklist</h3>
              {[
                { label: "Meta Title", value: selected.metaTitle, optimal: selected.metaTitle.length >= 50 && selected.metaTitle.length <= 60, detail: `${selected.metaTitle.length}/60 characters` },
                { label: "Meta Description", value: selected.metaDescription, optimal: selected.metaDescription.length >= 150 && selected.metaDescription.length <= 160, detail: `${selected.metaDescription.length}/160 characters` },
                { label: "URL Slug", value: selected.slug, optimal: selected.slug.length > 3 && !selected.slug.includes(" "), detail: `/${selected.slug}` },
                { label: "Keywords", value: selected.keywords.join(", "), optimal: selected.keywords.length > 0, detail: `${selected.keywords.length} keywords` },
              ].map((check) => (
                <div key={check.label} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${check.optimal ? "bg-success" : check.value ? "bg-warning" : "bg-destructive"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{check.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.value || "Not set"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{check.detail}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Google Preview */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-card-foreground text-sm mb-3">Search Result Preview</h3>
              <div className="bg-background rounded-lg p-4 border border-border">
                <p className="text-base text-primary hover:underline cursor-pointer">{selected.metaTitle || selected.title}</p>
                <p className="text-xs text-success mt-1">https://lexicon.com/{selected.slug}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selected.metaDescription || "No description provided."}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
