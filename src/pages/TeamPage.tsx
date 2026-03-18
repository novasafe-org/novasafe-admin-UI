import { motion } from "framer-motion";
import { Users, Shield, Activity } from "lucide-react";

const teamMembers = [
  { id: "1", name: "Alex Chen", email: "alex@lexicon.com", role: "Admin", avatar: "AC", lastActive: "2 minutes ago" },
  { id: "2", name: "Sarah Kim", email: "sarah@lexicon.com", role: "Editor", avatar: "SK", lastActive: "1 hour ago" },
  { id: "3", name: "Jordan Park", email: "jordan@lexicon.com", role: "Editor", avatar: "JP", lastActive: "3 hours ago" },
];

const activityLog = [
  { action: "Published", item: "AI-Powered Content Creation", user: "Sarah Kim", time: "2 hours ago" },
  { action: "Edited", item: "Complete Guide to Modern SEO", user: "Alex Chen", time: "5 hours ago" },
  { action: "Created draft", item: "Building a Personal Brand", user: "Alex Chen", time: "1 day ago" },
  { action: "Uploaded media", item: "hero-banner.jpg", user: "Jordan Park", time: "2 days ago" },
  { action: "Published", item: "Content Strategy Framework", user: "Alex Chen", time: "3 days ago" },
];

export default function TeamPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Users className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Team</h1>
      </div>

      {/* Members */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Members</h2>
        <div className="space-y-3">
          {teamMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">{m.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.role === "Admin" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                <Shield className="w-3 h-3 inline mr-1" />{m.role}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{m.lastActive}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activity */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activity Log
        </h2>
        <div className="space-y-3">
          {activityLog.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{a.user}</span> {a.action.toLowerCase()}{" "}
                  <span className="font-medium">"{a.item}"</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
