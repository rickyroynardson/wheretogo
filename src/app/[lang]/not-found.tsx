"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/client";

export default function NotFound() {
  const { t, path } = useI18n();
  return (
    <div className="flex flex-col items-start gap-2 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t.notFound.title}
      </h1>
      <p className="text-sm text-muted-foreground">{t.notFound.body}</p>
      <Link
        href={path("/")}
        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        {t.notFound.home}
      </Link>
    </div>
  );
}
