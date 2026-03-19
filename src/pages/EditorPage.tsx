import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, Eye, ArrowLeft, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function EditorPage() {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { posts, addPost, updatePost } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const existingPost = id ? posts.find((p) => p.id === id) : null;

  const [title, setTitle] = useState(existingPost?.title || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [slug, setSlug] = useState(existingPost?.slug || "");
  const [category, setCategory] = useState(existingPost?.category || "");
  const [tags, setTags] = useState(existingPost?.tags.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(existingPost?.status || "draft");
  const [metaTitle, setMetaTitle] = useState(existingPost?.metaTitle || "");
  const [metaDesc, setMetaDesc] = useState(existingPost?.metaDescription || "");
  const [saved, setSaved] = useState(true);
  const [showMarkdown, setShowMarkdown] = useState(false);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Auto-generate slug
  useEffect(() => {
    if (!id) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, id]);

  // Auto-save debounce
  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => {
      if (title) {
        handleSave(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, category, tags, metaTitle, metaDesc]);

  const handleSave = useCallback((silent = false) => {
    const postData = {
      title,
      content,
      slug,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      metaTitle,
      metaDescription: metaDesc,
      excerpt: content.slice(0, 150) + "...",
      wordCount,
      readTime,
      updatedAt: new Date().toISOString(),
    };

    if (existingPost) {
      updatePost(existingPost.id, postData);
    } else {
      addPost({
        ...postData,
        id: Date.now().toString(),
        featuredImage: "",
        keywords: [],
        author: "Alex Chen",
        views: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setSaved(true);
    if (!silent) toast.success(existingPost ? "Post updated" : "Post created");
  }, [title, content, slug, category, tags, status, metaTitle, metaDesc, existingPost]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = prefix + (selected || "text") + suffix;
    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + (selected || "text").length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/posts")} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {saved ? "Saved" : "Saving..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
              {wordCount} words · {readTime} min read
            </span>

            <button
              onClick={() => setShowMarkdown(!showMarkdown)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${showMarkdown ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {showMarkdown ? "Rich" : "MD"}
            </button>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published" | "scheduled")}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border-0 focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave()}
              className="px-4 py-1.5 rounded-md gradient-primary text-primary-foreground font-medium text-xs shadow-primary hover:shadow-primary-hover transition-shadow flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Publish
            </motion.button>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-0.5 px-4 md:px-6 pb-2 overflow-x-auto">
          {[
            { icon: Bold, action: () => insertMarkdown("**", "**"), label: "Bold" },
            { icon: Italic, action: () => insertMarkdown("*", "*"), label: "Italic" },
            { icon: Heading1, action: () => insertMarkdown("\n# "), label: "H1" },
            { icon: Heading2, action: () => insertMarkdown("\n## "), label: "H2" },
            { icon: List, action: () => insertMarkdown("\n- "), label: "Bullet" },
            { icon: ListOrdered, action: () => insertMarkdown("\n1. "), label: "Number" },
            { icon: Quote, action: () => insertMarkdown("\n> "), label: "Quote" },
            { icon: Code, action: () => insertMarkdown("`", "`"), label: "Code" },
            { icon: ImageIcon, action: () => insertMarkdown("![alt](", ")"), label: "Image" },
          ].map((tool) => (
            <button
              key={tool.label}
              onClick={tool.action}
              title={tool.label}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main editor */}
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-[720px] mx-auto space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-3xl font-semibold bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50"
              style={{ letterSpacing: "-0.022em" }}
            />
            <p className="text-xs text-muted-foreground">/{slug || "your-slug-here"}</p>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your content..."
              className="w-full min-h-[400px] bg-transparent border-0 outline-none resize-none editor-prose text-foreground placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border p-5 space-y-5 bg-card">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. SEO" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="seo, marketing" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Meta Title</label>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="flex justify-between mt-1">
              <span className={`text-[11px] tabular-nums ${metaTitle.length >= 50 && metaTitle.length <= 60 ? "text-success" : "text-warning"}`}>{metaTitle.length}/60</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Meta Description</label>
            <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="SEO description" rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="flex justify-between mt-1">
              <span className={`text-[11px] tabular-nums ${metaDesc.length >= 150 && metaDesc.length <= 160 ? "text-success" : "text-warning"}`}>{metaDesc.length}/160</span>
            </div>
          </div>

          {/* Google Preview */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Search Preview</label>
            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-sm text-primary truncate">{metaTitle || title || "Page Title"}</p>
              <p className="text-xs text-success mt-0.5">lexicon.com/{slug || "page"}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{metaDesc || "Add a meta description..."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
