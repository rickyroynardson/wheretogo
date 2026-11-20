import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NavigationTracker } from "@/components/back-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { I18nProvider } from "@/i18n/client";
import { isLocale, LOCALES } from "@/i18n/config";
import { pageMetadata } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { SITE_NAME, siteUrl } from "@/lib/site";
import "../globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  // Next has no metrics for this font, so it can't size-match a fallback
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

// One prebuilt copy of every page per language
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  // "WhereToGo" alone is too short for search results and previews
  const title = `${SITE_NAME} · ${t.meta.title}`;
  return {
    // Defaults for every page; pages override path, title and description
    ...pageMetadata({
      locale,
      path: "/",
      title,
      description: t.meta.description,
    }),
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${SITE_NAME}` },
    icons: "/logo.svg",
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <I18nProvider locale={lang}>
          <NavigationTracker />
          <div className="mx-auto flex w-full max-w-140 flex-1 flex-col px-5">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
        <Script id="theme" strategy="beforeInteractive">
          {`try{if(localStorage.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
      </body>
    </html>
  );
}
