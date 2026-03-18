import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
  chart?: ReactNode;
}

export function StatCard({ title, value, change, positive, icon, chart }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-card p-5 hover:shadow-elevated transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {chart && <div className="w-20 h-8">{chart}</div>}
      </div>
      <p className="text-2xl font-semibold tabular-nums text-card-foreground">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        {change && (
          <span className={`text-xs font-medium ${positive ? "text-success" : "text-destructive"}`}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
