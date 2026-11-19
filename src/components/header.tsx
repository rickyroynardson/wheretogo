import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { getI18n } from "@/i18n/server";

export async function Header() {
  const { path } = await getI18n();
  return (
    <header className="flex h-16 items-center justify-between">
      <Link
        href={path("/")}
        className="flex items-center gap-2 font-bold text-lg"
      >
        <Image src="/logo.svg" alt="" width={26} height={26} priority />
        WhereToGo
      </Link>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
