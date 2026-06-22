import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/nova/ui";
import { adminApi, type BlogCategory, type BlogPost } from "@/lib/api";
import { useNova } from "@/context/NovaContext";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useNova();
  const canEdit = can("content.manage");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"body" | "featured">("body");

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState<string | undefined>(id);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    adminApi.blogCategories().then((r) => setCategories(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .blogPost(id)
      .then((post: BlogPost) => {
        setPostId(post.id);
        setTitle(post.title);
        setSlug(post.slug);
        setSlugManual(true);
        setContent(post.contentMarkdown || "");
        setExcerpt(post.excerpt || "");
        setCategoryId(post.categoryId || "");
        setCategoryName(post.categoryName !== "—" ? post.categoryName : "");
        setStatus(post.status);
        setFeaturedImage(post.featuredImage || "");
        setSeoTitle(post.seoTitle || "");
        setSeoDescription(post.seoDescription || "");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load post"))
      .finally(() => setLoading(false));
  }, [id]);

  const resolveCategoryId = useCallback(async (): Promise<string | null> => {
    if (categoryId) return categoryId;
    const name = categoryName.trim();
    if (!name) return null;
    const existing = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = await adminApi.createBlogCategory(name);
    setCategories((prev) => [...prev, created]);
    setCategoryId(created.id);
    return created.id;
  }, [categoryId, categoryName, categories]);

  const resolveTagIds = useCallback(async (): Promise<string[]> => {
    const names = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!names.length) return [];
    const allTags = (await adminApi.blogTags()).items;
    const ids: string[] = [];
    for (const name of names) {
      const found = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (found) ids.push(found.id);
      else {
        const created = await adminApi.createBlogTag(name);
        ids.push(created.id);
        allTags.push(created);
      }
    }
    return ids;
  }, [tags]);

  const buildPayload = useCallback(
    async (nextStatus: string, publishedAt?: string | null) => ({
      title,
      slug: slug || slugify(title),
      excerpt: excerpt || content.slice(0, 200) || null,
      content_markdown: content,
      featured_image: featuredImage || null,
      status: nextStatus,
      category_id: await resolveCategoryId(),
      tag_ids: await resolveTagIds(),
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      published_at:
        nextStatus === "published"
          ? publishedAt ?? new Date().toISOString()
          : nextStatus === "scheduled"
            ? publishedAt ?? null
            : null,
    }),
    [title, slug, excerpt, content, featuredImage, seoTitle, seoDescription, resolveCategoryId, resolveTagIds],
  );

  const save = async (nextStatus: string) => {
    if (!canEdit) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const body = await buildPayload(nextStatus);
      if (postId) {
        await adminApi.updateBlogPost(postId, body);
      } else {
        const created = await adminApi.createBlogPost(body);
        setPostId(created.id);
        setSlug(created.slug);
        navigate(`/content/edit/${created.id}`, { replace: true });
      }
      setStatus(nextStatus);
      toast.success(nextStatus === "published" ? "Post published" : "Post saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, target: "body" | "featured") => {
    try {
      const media = await adminApi.uploadBlogMedia(file);
      if (target === "featured") {
        setFeaturedImage(media.url);
      } else {
        const alt = file.name.replace(/\.[^.]+$/, "");
        setContent((c) => `${c}\n\n![${alt}](${media.url})\n`);
      }
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading editor…
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <Link to="/content" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <PageHeader
        eyebrow="Content"
        title={postId ? "Edit post" : "New post"}
        description="Write in Markdown. Published posts appear on the marketing site."
        actions={
          canEdit ? (
            <>
              <Badge tone={status === "published" ? "success" : "muted"}>{status}</Badge>
              <Button variant="secondary" disabled={saving} onClick={() => void save("draft")}>
                <Save className="w-4 h-4" />
                Save draft
              </Button>
              <Button disabled={saving} onClick={() => void save("published")}>
                Publish
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <Card className="p-5 space-y-4">
          <input
            className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
          />
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground shrink-0 pt-2">Slug</span>
            <input
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              disabled={!canEdit}
            />
          </div>
          <textarea
            className="w-full min-h-[360px] rounded-lg border border-input bg-background p-4 font-mono text-sm leading-relaxed resize-y"
            placeholder="Write your post in Markdown…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!canEdit}
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadImage(f, uploadTarget);
            e.target.value = "";
          }} />
          {canEdit && (
            <Button type="button" variant="secondary" size="sm" onClick={() => {
              setUploadTarget("body");
              fileRef.current?.click();
            }}>
              <ImageIcon className="w-4 h-4" />
              Insert image
            </Button>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Excerpt</label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2 text-sm min-h-[80px]"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={!canEdit}
            />
          </Card>
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
            <input
              list="blog-categories"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Engineering, Product…"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setCategoryId("");
              }}
              disabled={!canEdit}
            />
            <datalist id="blog-categories">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</label>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="security, design"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={!canEdit}
            />
          </Card>
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured image</label>
            {featuredImage ? (
              <img src={featuredImage} alt="" className="w-full rounded-md border border-border object-cover max-h-32" />
            ) : null}
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
              placeholder="Image URL"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              disabled={!canEdit}
            />
            {canEdit && (
              <Button type="button" variant="secondary" size="sm" onClick={() => {
                setUploadTarget("featured");
                fileRef.current?.click();
              }}>
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            )}
          </Card>
          <Card className="p-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO title</label>
            <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} disabled={!canEdit} />
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO description</label>
            <textarea className="w-full rounded-md border border-input bg-background p-2 text-sm min-h-[72px]" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} disabled={!canEdit} />
          </Card>
        </div>
      </div>
    </div>
  );
}
