// Some API responses return raw R2 storage keys (e.g. "avatars/abc.png") instead
// of full URLs. These helpers absolutize such keys against the CDN base so the
// browser can load them, while leaving already-absolute URLs untouched.

/** CDN base derived from the configured API host (production only). */
export function cdnBase(): string {
  const api = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  if (api.includes("api.anonwork.site")) return "https://cdn.anonwork.site";
  return "";
}

/** Turn a relative storage key into an absolute URL; pass through full URLs. */
export function toAbsoluteMediaUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const base = cdnBase();
  return base ? `${base.replace(/\/$/, "")}/${value.replace(/^\//, "")}` : value;
}
