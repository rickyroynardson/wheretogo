import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-2 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">Nothing here</h1>
      <p className="text-sm text-muted-foreground">This page doesn't exist.</p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to home
      </Link>
    </div>
  );
}
