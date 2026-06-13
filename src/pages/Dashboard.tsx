import { usePostsQuery } from "@/hooks/use-posts";
import { BlogPost } from "@/context/AppContext";
import { StatCard } from "@/components/StatCard";
import { MiniChart } from "@/components/MiniChart";
import { FileText, Eye, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data } = usePostsQuery();
  const posts = data?.posts ?? [];
  const published = posts.filter((p) => p.status === "published");
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const avgReadTime = posts.length
    ? (posts.reduce((s, p) => s + p.readTime, 0) / posts.length).toFixed(1)
    : "0";

  const topPosts = [...published].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentPosts = [...posts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your content overview.</p>
        </div>
        <Link to="/editor">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:shadow-primary-hover transition-shadow"
          >
            New Post
          </motion.button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={posts.length} change="+3 this week" positive icon={<FileText className="w-4 h-4" />} chart={<MiniChart data={[2, 4, 3, 5, 4, 6, 5]} />} />
        <StatCard title="Total Views" value={totalViews.toLocaleString()} change="+12.5%" positive icon={<Eye className="w-4 h-4" />} chart={<MiniChart data={[800, 1200, 950, 1400, 1100, 1600, 1350]} />} />
        <StatCard title="Published" value={published.length} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard title="Avg. Read Time" value={`${avgReadTime} min`} icon={<Clock className="w-4 h-4" />} />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Top Performing Posts</h2>
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <PostRow key={post.id} post={post} rank={i + 1} />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PostRow({ post, rank }: { post: BlogPost; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground w-5 tabular-nums">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{post.title}</p>
        <p className="text-xs text-muted-foreground">{post.views.toLocaleString()} views · {post.readTime} min read</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-success/10 text-success",
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-primary/10 text-primary",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}
