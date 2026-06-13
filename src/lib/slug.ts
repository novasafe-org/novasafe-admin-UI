/** Match backend slugify behavior. */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  format?: "webp" | "avif" | "jpeg" | "png" | "auto";
  quality?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
};

export function optimizedMediaUrl(url: string, transform?: ImageTransformOptions): string {
  if (!transform) return url;
  const parsed = new URL(url);
  if (transform.width) parsed.searchParams.set("w", String(transform.width));
  if (transform.height) parsed.searchParams.set("h", String(transform.height));
  if (transform.format) parsed.searchParams.set("format", transform.format);
  if (transform.quality) parsed.searchParams.set("q", String(transform.quality));
  if (transform.fit) parsed.searchParams.set("fit", transform.fit);
  return parsed.toString();
}
