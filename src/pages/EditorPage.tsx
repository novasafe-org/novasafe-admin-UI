import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Loader2,
  Archive,
  Calendar,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  usePublishPostMutation,
  useSaveDraftMutation,
  useUnpublishPostMutation,
  useArchivePostMutation,
  useSchedulePostMutation,
  type PostEditorInput,
} from "@/hooks/use-posts";
import { FeaturedImageField } from "@/components/editor/ImageUpload";
import { useUploadMediaMutation } from "@/hooks/use-media";
import { optimizedMediaUrl } from "@/lib/slug";
import { slugify } from "@/lib/slug";
import type { PostStatus } from "@/lib/api/types";

export default function EditorPage() {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: existingPost, isLoading: isLoadingPost } = usePostQuery(id);

  const createMutation = useCreatePostMutation();
  const updateMutation = useUpdatePostMutation();
  const saveDraftMutation = useSaveDraftMutation();
  const publishMutation = usePublishPostMutation();
  const unpublishMutation = useUnpublishPostMutation();
  const archiveMutation = useArchivePostMutation();
  const scheduleMutation = useSchedulePostMutation();
  const uploadMutation = useUploadMediaMutation();

  const [postId, setPostId] = useState<string | undefined>(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saved, setSaved] = useState(true);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [initialized, setInitialized] = useState(!id);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    saveDraftMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    scheduleMutation.isPending;

  useEffect(() => {
    if (existingPost && !initialized) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
      setSlug(existingPost.slug);
      setSlugManual(true);
      setCategory(existingPost.category);
      setTags(existingPost.tags.join(", "));
      setStatus(existingPost.status);
      setMetaTitle(existingPost.metaTitle);
      setMetaDesc(existingPost.metaDescription);
      setFeaturedImage(existingPost.featuredImage);
      setScheduledAt(
        existingPost.publishedAt
          ? new Date(existingPost.publishedAt).toISOString().slice(0, 16)
          : "",
      );
      setPostId(existingPost.id);
      setInitialized(true);
      setSaved(true);
    }
  }, [existingPost, initialized]);

  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const buildInput = useCallback(
    (): PostEditorInput => ({
      title,
      slug,
      slugManual,
      content,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      metaTitle,
      metaDescription: metaDesc,
      featuredImage,
      publishedAt: scheduledAt ? new Date(scheduledAt).toISOString() : existingPost?.publishedAt,
    }),
    [title, slug, slugManual, content, category, tags, status, metaTitle, metaDesc, featuredImage, scheduledAt, existingPost?.publishedAt],
  );

  const persist = useCallback(
    async (silent = false, overrides?: Partial<PostEditorInput>) => {
      if (!title.trim()) return;

      const input = { ...buildInput(), ...overrides };

      try {
        if (postId) {
          await updateMutation.mutateAsync({ id: postId, input });
        } else {
          const created = await createMutation.mutateAsync(input);
          setPostId(created.id);
          setSlug(created.slug);
          navigate(`/editor/${created.id}`, { replace: true });
        }
        setSaved(true);
        if (!silent) toast.success("Post saved");
      } catch (err) {
        setSaved(false);
        toast.error(err instanceof Error ? err.message : "Failed to save post");
        throw err;
      }
    },
    [title, buildInput, postId, createMutation, updateMutation, navigate],
  );

  const handleSaveDraft = async () => {
    if (!title.trim()) return;
    try {
      if (!postId) {
        const created = await createMutation.mutateAsync({ ...buildInput(), status: "draft" });
        setPostId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
        setSaved(true);
        toast.success("Draft created");
        return;
      }
      await saveDraftMutation.mutateAsync({ id: postId, input: buildInput() });
      setStatus("draft");
      setSaved(true);
      toast.success("Draft saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft");
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Add a title before publishing");
      return;
    }
    try {
      if (!postId) {
        const created = await createMutation.mutateAsync({
          ...buildInput(),
          status: "published",
        });
        setPostId(created.id);
        navigate(`/editor/${created.id}`, { replace: true });
      } else {
        await publishMutation.mutateAsync({ id: postId });
      }
      setStatus("published");
      setSaved(true);
      toast.success("Post published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  const handleUnpublish = async () => {
    if (!postId) return;
    try {
      await unpublishMutation.mutateAsync(postId);
      setStatus("draft");
      toast.success("Post unpublished");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unpublish");
    }
  };

  const handleArchive = async () => {
    if (!postId) return;
    try {
      await archiveMutation.mutateAsync(postId);
      setStatus("archived");
      toast.success("Post archived");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive");
    }
  };

  const handleSchedule = async () => {
    if (!postId || !scheduledAt) {
      toast.error("Set a schedule date and time");
      return;
    }
    try {
      await scheduleMutation.mutateAsync({
        id: postId,
        input: buildInput(),
        publishedAt: new Date(scheduledAt).toISOString(),
      });
      setStatus("scheduled");
      toast.success("Post scheduled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule");
    }
  };

  useEffect(() => {
    if (!initialized || !title || status === "archived") return;
    setSaved(false);
    const timer = setTimeout(() => persist(true).catch(() => undefined), 2000);
    return () => clearTimeout(timer);
  }, [title, content, category, tags, metaTitle, metaDesc, featuredImage, slug, slugManual, initialized, status]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSaveDraft]);

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = prefix + (selected || "text") + suffix;
    insertAtCursor(replacement);
  };

  const uploadAndInsertImage = async (file: File) => {
    try {
      const media = await uploadMutation.mutateAsync({ file });
      const url = optimizedMediaUrl(media.url, { width: 1400, format: "webp", quality: 85 });
      const alt = media.alt_text ?? file.name.replace(/\.[^.]+$/, "");
      insertAtCursor(`\n![${alt}](${url})\n`);
      toast.success("Image inserted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  const onEditorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) uploadAndInsertImage(file);
  };

  if (id && isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading post...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate("/posts")} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums truncate">
              {isSaving ? "Saving..." : saved ? "Saved" : "Unsaved"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-xs text-muted-foreground tabular-nums hidden lg:inline">
              {wordCount} words · {readTime} min
            </span>

            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveDraft} disabled={isSaving} className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground font-medium text-xs flex items-center gap-1 disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> Draft
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handlePublish} disabled={isSaving} className="px-2.5 py-1.5 rounded-md gradient-primary text-primary-foreground font-medium text-xs disabled:opacity-50">
              Publish
            </motion.button>
            {postId && status === "published" && (
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleUnpublish} disabled={isSaving} className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs flex items-center gap-1 disabled:opacity-50">
                <EyeOff className="w-3.5 h-3.5" /> Unpublish
              </motion.button>
            )}
            {postId && (
              <>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSchedule} disabled={isSaving || !scheduledAt} className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs flex items-center gap-1 disabled:opacity-50">
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleArchive} disabled={isSaving} className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs flex items-center gap-1 disabled:opacity-50">
                  <Archive className="w-3.5 h-3.5" /> Archive
                </motion.button>
              </>
            )}
          </div>
        </div>

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
            {
              icon: ImageIcon,
              action: () => imageInputRef.current?.click(),
              label: "Image",
            },
          ].map((tool) => (
            <button key={tool.label} onClick={tool.action} title={tool.label} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAndInsertImage(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-6 md:p-8" onDragOver={(e) => e.preventDefault()} onDrop={onEditorDrop}>
          <div className="max-w-[720px] mx-auto space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full text-3xl font-semibold bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground/50"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <input type="checkbox" checked={slugManual} onChange={(e) => setSlugManual(e.target.checked)} className="rounded" />
                Custom slug
              </label>
              {slugManual ? (
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="flex-1 px-2 py-1 rounded border border-input bg-background text-xs font-mono"
                  placeholder="my-post-slug"
                />
              ) : (
                <p className="text-xs text-muted-foreground font-mono">/{slug || "your-slug-here"}</p>
              )}
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing... (drag & drop images here)"
              className="w-full min-h-[400px] bg-transparent border-0 outline-none resize-none editor-prose text-foreground placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border p-5 space-y-5 bg-card overflow-y-auto max-h-[calc(100vh-7rem)]">
          <FeaturedImageField value={featuredImage} onChange={setFeaturedImage} />

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Schedule for</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. SEO" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="seo, marketing" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Meta Title</label>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Meta Description</label>
            <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
