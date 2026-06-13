import { createContext, useContext, useState, ReactNode } from "react";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled" | "archived";
  category: string;
  categoryId?: string | null;
  tags: string[];
  tagIds?: string[];
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  author: string;
  views: number;
  readTime: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
