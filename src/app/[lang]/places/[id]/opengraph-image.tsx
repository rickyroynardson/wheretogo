import { ImageResponse } from "next/og";
import { PLACES } from "@/data/places";
import { i18n } from "@/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { imageSrc, OG_COLORS, OG_SIZE, OgBrand } from "@/lib/og";

// Link preview for one place: its photo on the left, name and area right
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "WhereToGo";

// Prebuilt at deploy, one per place (and language, from the layout)
export function generateStaticParams() {
  return PLACES.map((place) => ({ id: String(place.id) }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const { t } = i18n(isLocale(lang) ? lang : DEFAULT_LOCALE);
  const place = PLACES.find((p) => String(p.id) === id);
  const logo = await imageSrc("/logo.svg");
  const photo = place?.image ? await imageSrc(place.image) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: OG_COLORS.background,
      }}
    >
      {photo ? (
        // biome-ignore lint/performance/noImgElement: next/og renders plain <img>
        <img
          src={photo}
          width={540}
          height={630}
          alt=""
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            width: 540,
            height: 630,
            background: OG_COLORS.primary,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
        }}
      >
        <OgBrand logo={logo} />
        {place && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: OG_COLORS.primary,
              }}
            >
              {place.categories.map((c) => t.categories[c].label).join(" · ")}
            </span>
            <span
              style={{
                fontSize: place.name.length > 22 ? 60 : 76,
                fontWeight: 700,
                letterSpacing: -1.5,
                lineHeight: 1.05,
                color: OG_COLORS.foreground,
              }}
            >
              {place.name}
            </span>
            {place.address && (
              <span
                style={{
                  fontSize: 26,
                  lineHeight: 1.35,
                  color: OG_COLORS.mutedForeground,
                }}
              >
                {place.address}
              </span>
            )}
          </div>
        )}
        <span style={{ fontSize: 26, color: OG_COLORS.mutedForeground }}>
          Batam
        </span>
      </div>
    </div>,
    size,
  );
}
