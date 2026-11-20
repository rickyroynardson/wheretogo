import "server-only";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

// Shared bits for the generated link previews (opengraph-image.tsx files).
// next/og renders a subset of CSS: flexbox only, inline styles.
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  background: "#ffffff",
  foreground: "#171717",
  primary: "#3f73a6",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
};

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// A public/ path ("/images/places/1.jpg") as a data URL; remote https URLs
// pass through, the renderer fetches them itself
export async function imageSrc(src: string) {
  if (src.startsWith("https://")) return src;
  const mime = MIME[extname(src).toLowerCase()];
  if (!mime) return null;
  const data = await readFile(join(process.cwd(), "public", src), "base64");
  return `data:${mime};base64,${data}`;
}

// Logo and name, as in the site header
export function OgBrand({ logo }: { logo: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {logo && (
        // biome-ignore lint/performance/noImgElement: next/og renders plain <img>
        <img src={logo} width={56} height={56} alt="" />
      )}
      <span
        style={{ fontSize: 36, fontWeight: 700, color: OG_COLORS.foreground }}
      >
        WhereToGo
      </span>
    </div>
  );
}
