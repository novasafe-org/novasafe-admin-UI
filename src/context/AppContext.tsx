import { createContext, useContext, useState, ReactNode } from "react";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  tags: string[];
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
  posts: BlogPost[];
  media: MediaItem[];
  setPosts: (posts: BlogPost[]) => void;
  setMedia: (media: MediaItem[]) => void;
  addPost: (post: BlogPost) => void;
  updatePost: (id: string, updates: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const defaultPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Complete Guide to Modern SEO in 2026",
    slug: "complete-guide-modern-seo-2026",
    content: "Search engine optimization continues to evolve...",
    excerpt: "Master the latest SEO strategies that actually work in 2026.",
    status: "published",
    category: "SEO",
    tags: ["seo", "marketing", "strategy"],
    featuredImage: "",
    metaTitle: "Complete Guide to Modern SEO | Lexicon",
    metaDescription: "Learn the latest SEO techniques and strategies for 2026. Comprehensive guide covering technical SEO, content optimization, and more.",
    keywords: ["seo", "search optimization", "google ranking"],
    author: "Alex Chen",
    views: 12840,
    readTime: 8,
    wordCount: 2400,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-10T14:30:00Z",
    publishedAt: "2026-02-20T09:00:00Z",
  },
  {
    id: "2",
    title: "Content Strategy Framework for Startups",
    slug: "content-strategy-framework-startups",
    content: "Building a content strategy from scratch...",
    excerpt: "A practical framework for building your startup's content engine.",
    status: "published",
    category: "Strategy",
    tags: ["content", "startup", "framework"],
    featuredImage: "",
    metaTitle: "Content Strategy for Startups | Lexicon",
    metaDescription: "Build a scalable content strategy for your startup with this proven framework.",
    keywords: ["content strategy", "startup marketing"],
    author: "Alex Chen",
    views: 8920,
    readTime: 6,
    wordCount: 1800,
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-03-05T11:00:00Z",
    publishedAt: "2026-01-25T09:00:00Z",
  },
  {
    id: "3",
    title: "AI-Powered Content Creation: Best Practices",
    slug: "ai-powered-content-creation-best-practices",
    content: "Artificial intelligence is transforming how we create content...",
    excerpt: "Learn how to leverage AI tools effectively for content creation.",
    status: "published",
    category: "AI",
    tags: ["ai", "content creation", "automation"],
    featuredImage: "",
    metaTitle: "AI Content Creation Best Practices | Lexicon",
    metaDescription: "Discover best practices for using AI in content creation without losing authenticity.",
    keywords: ["ai content", "artificial intelligence", "writing"],
    author: "Sarah Kim",
    views: 15200,
    readTime: 10,
    wordCount: 3100,
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
    publishedAt: "2026-03-05T08:00:00Z",
  },
  {
    id: "4",
    title: "Building a Personal Brand Through Blogging",
    slug: "building-personal-brand-blogging",
    content: "Your personal brand is your most valuable asset...",
    excerpt: "Step-by-step guide to building a personal brand with consistent blogging.",
    status: "draft",
    category: "Branding",
    tags: ["personal brand", "blogging", "growth"],
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    author: "Alex Chen",
    views: 0,
    readTime: 5,
    wordCount: 1200,
    createdAt: "2026-03-12T16:00:00Z",
    updatedAt: "2026-03-16T10:00:00Z",
  },
  {
    id: "5",
    title: "Technical Writing for Developer Audiences",
    slug: "technical-writing-developer-audiences",
    content: "Writing for developers requires precision...",
    excerpt: "How to write technical content that developers actually want to read.",
    status: "scheduled",
    category: "Writing",
    tags: ["technical writing", "developers", "documentation"],
    featuredImage: "",
    metaTitle: "Technical Writing for Developers | Lexicon",
    metaDescription: "Master the art of writing technical content for developer audiences.",
    keywords: ["technical writing", "developer content"],
    author: "Sarah Kim",
    views: 0,
    readTime: 7,
    wordCount: 2000,
    createdAt: "2026-03-14T09:00:00Z",
    updatedAt: "2026-03-17T15:00:00Z",
    publishedAt: "2026-03-25T09:00:00Z",
  },
];

const defaultMedia: MediaItem[] = [
  { id: "1", name: "hero-banner.jpg", url: "/placeholder.svg", type: "image/jpeg", size: 245000, createdAt: "2026-03-10T10:00:00Z" },
  { id: "2", name: "seo-diagram.png", url: "/placeholder.svg", type: "image/png", size: 180000, createdAt: "2026-03-08T14:00:00Z" },
  { id: "3", name: "team-photo.jpg", url: "/placeholder.svg", type: "image/jpeg", size: 320000, createdAt: "2026-03-05T09:00:00Z" },
  { id: "4", name: "infographic.png", url: "/placeholder.svg", type: "image/png", size: 520000, createdAt: "2026-03-01T11:00:00Z" },
];

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(defaultPosts);
  const [media, setMedia] = useState<MediaItem[]>(defaultMedia);
  const [darkMode, setDarkMode] = useState(false);

  const addPost = (post: BlogPost) => setPosts((prev) => [post, ...prev]);
  const updatePost = (id: string, updates: Partial<BlogPost>) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  const deletePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ posts, media, setPosts, setMedia, addPost, updatePost, deletePost, darkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
