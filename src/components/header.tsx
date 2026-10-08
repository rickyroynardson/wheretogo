import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background/80 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <Image src="/logo.svg" alt="" width={26} height={26} priority />
        WhereToGo
      </Link>
      <ThemeToggle />
    </header>
  );
}
