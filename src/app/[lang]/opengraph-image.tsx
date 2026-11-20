import { ImageResponse } from "next/og";
import { i18n } from "@/i18n";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/i18n/config";
import { imageSrc, OG_COLORS, OG_SIZE, OgBrand } from "@/lib/og";

// Link preview for the home page and every page without its own
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "WhereToGo";

// Prebuilt at deploy, one per language
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { t } = i18n(isLocale(lang) ? lang : DEFAULT_LOCALE);
  const logo = imageSrc("/logo.svg");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: OG_COLORS.background,
      }}
    >
      <OgBrand logo={logo} />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: -2,
            color: OG_COLORS.foreground,
          }}
        >
          {t.home.title}
        </span>
        <span style={{ fontSize: 40, color: OG_COLORS.mutedForeground }}>
          {t.meta.description}
        </span>
      </div>
      {/* Accent bar in the site's blue */}
      <div
        style={{
          display: "flex",
          width: 160,
          height: 12,
          borderRadius: 6,
          background: OG_COLORS.primary,
        }}
      />
    </div>,
    size,
  );
}
