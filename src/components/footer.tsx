import { FeedbackForm } from "@/components/feedback-form";
import { getI18n } from "@/i18n/server";

export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer className="mt-10 flex flex-col gap-3 border-t border-border pt-3 pb-8 has-[details:not([open])]:pb-10">
      <FeedbackForm />
      <p className="text-sm text-muted-foreground">
        {t.footer.builtBy}{" "}
        <a
          href="https://rrn.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          Ricky
        </a>
        {t.footer.tagline}
      </p>
    </footer>
  );
}
