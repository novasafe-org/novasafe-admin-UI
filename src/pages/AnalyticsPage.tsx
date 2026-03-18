import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { BarChart3, Eye, FileText, Clock, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const viewsData = [
  { day: "Mon", views: 1200 },
  { day: "Tue", views: 1900 },
  { day: "Wed", views: 1400 },
  { day: "Thu", views: 2200 },
  { day: "Fri", views: 1800 },
  { day: "Sat", views: 2400 },
  { day: "Sun", views: 2100 },
];

const categoryData = [
  { name: "SEO", posts: 12 },
  { name: "Strategy", posts: 8 },
  { name: "AI", posts: 6 },
  { name: "Writing", posts: 9 },
  { name: "Branding", posts: 4 },
];

export default function AnalyticsPage() {
  const { posts } = useApp();
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const avgReadTime = posts.length ? (posts.reduce((s, p) => s + p.readTime, 0) / posts.length).toFixed(1) : "0";
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, change: "+12.5%" },
          { label: "Total Posts", value: posts.length, icon: FileText },
          { label: "Published", value: published, icon: TrendingUp },
          { label: "Avg Read Time", value: `${avgReadTime}m`, icon: Clock },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-semibold tabular-nums text-card-foreground">{stat.value}</p>
            {stat.change && <span className="text-xs text-success">{stat.change}</span>}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Views This Week</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={viewsData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="views" stroke="hsl(217, 89%, 55%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Posts by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="posts" fill="hsl(217, 89%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Posts Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Top Performing Content</h2>
        <div className="space-y-2">
          {[...posts].sort((a, b) => b.views - a.views).slice(0, 5).map((post, i) => (
            <div key={post.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <span className="text-xs font-medium text-muted-foreground w-5 tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{post.title}</p>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">{post.views.toLocaleString()} views</span>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${(post.views / Math.max(...posts.map((p) => p.views))) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
