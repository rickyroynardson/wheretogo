import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import Script from "next/script";
import { NavigationTracker } from "@/components/back-button";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  // Next has no metrics for this font, so it can't size-match a fallback
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "WhereToGo", template: "%s · WhereToGo" },
  description: "Pick a spot for hangout, date, or food.",
  icons: "/logo.svg",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <NavigationTracker />
        <div className="mx-auto flex w-full max-w-140 flex-1 flex-col px-5">
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </div>
        <Script id="theme" strategy="beforeInteractive">
          {`try{if(localStorage.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
      </body>
    </html>
  );
}
