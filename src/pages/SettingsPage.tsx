import { useApp } from "@/context/AppContext";
import { getApiBaseUrl, getApiToken, setApiBaseUrl, setApiToken } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import type { ApiSuccess } from "@/lib/api/types";
import { motion } from "framer-motion";
import { Settings, Globe, Moon, Sun, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useApp();
  const [siteName, setSiteName] = useState("Lexicon Blog");
  const [defaultMetaTitle, setDefaultMetaTitle] = useState("Lexicon | Content Platform");
  const [defaultMetaDesc, setDefaultMetaDesc] = useState("A modern content operating system for creators and teams.");
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl);
  const [apiToken, setApiTokenState] = useState(getApiToken() ?? "");
  const [apiEmail, setApiEmail] = useState("");
  const [apiPassword, setApiPassword] = useState("");

  const save = () => {
    setApiBaseUrl(apiBaseUrl);
    setApiToken(apiToken);
    toast.success("Settings saved");
  };

  const login = async () => {
    try {
      const { data } = await apiClient.post<ApiSuccess<{ accessToken: string }>>("/auth/login", {
        email: apiEmail,
        password: apiPassword,
      });
      const token = data.data.accessToken;
      setApiToken(token);
      setApiTokenState(token);
      toast.success("Signed in — API token saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <Settings className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-card-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> General</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Site Name</label>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Default Meta Title</label>
          <input value={defaultMetaTitle} onChange={(e) => setDefaultMetaTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Default Meta Description</label>
          <textarea value={defaultMetaDesc} onChange={(e) => setDefaultMetaDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl shadow-card p-5">
        <h2 className="font-semibold text-card-foreground mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <button onClick={toggleDarkMode} className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${darkMode ? "bg-primary" : "bg-muted"}`}>
            <motion.div animate={{ x: darkMode ? 20 : 0 }} transition={{ duration: 0.2 }} className="w-5 h-5 rounded-full bg-card shadow-card flex items-center justify-center">
              {darkMode ? <Moon className="w-3 h-3 text-primary" /> : <Sun className="w-3 h-3 text-muted-foreground" />}
            </motion.div>
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-card-foreground flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Blog API</h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">API Base URL</label>
          <input
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrlState(e.target.value)}
            placeholder="http://localhost:8787/api/v1"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">JWT Token (or sign in below)</label>
          <input
            value={apiToken}
            onChange={(e) => setApiTokenState(e.target.value)}
            placeholder="Bearer token for admin API"
            type="password"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground font-mono"
          />
        </div>
        <div className="pt-2 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground">Sign in to fetch a token automatically</p>
          <input
            value={apiEmail}
            onChange={(e) => setApiEmail(e.target.value)}
            placeholder="Admin email"
            type="email"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground"
          />
          <input
            value={apiPassword}
            onChange={(e) => setApiPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground"
          />
          <button onClick={login} className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors">
            Sign in
          </button>
        </div>
      </motion.div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save} className="px-6 py-2.5 rounded-md gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:shadow-primary-hover transition-shadow">
        Save Settings
      </motion.button>
    </div>
  );
}
