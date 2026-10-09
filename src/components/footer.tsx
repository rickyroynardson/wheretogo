import { FeedbackForm } from "@/components/feedback-form";

export function Footer() {
  return (
    <footer className="mt-10 flex flex-col gap-3 border-t border-border pt-3 pb-8 has-[details:not([open])]:pb-10">
      <FeedbackForm />
      <p className="text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://rrn.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          Ricky
        </a>
        , for when you can't decide where to go.
      </p>
    </footer>
  );
}
