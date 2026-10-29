"use client";

import {
  Check,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Send,
} from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { sendFeedback } from "@/app/actions/feedback";

const MAX_MESSAGE = 2000;
const MAX_CONTACT = 150;
// Show the counter only when it starts to matter
const COUNTER_FROM = MAX_MESSAGE - 300;

const TOPICS = [
  "Suggest a place",
  "Something's wrong",
  "Idea",
  "Other",
] as const;

// 16px text: iOS Safari zooms the page into any focused field smaller than that
const field =
  "w-full rounded-xl border border-transparent bg-muted text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background aria-invalid:border-primary";

const rise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
} as const;

type Values = { message: string; contact: string; company: string };

export function FeedbackForm() {
  const [open, setOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <details
        className="group"
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 py-2 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
          <ChevronRight
            strokeWidth={3}
            className="size-5 text-primary transition-transform group-open:rotate-90"
            aria-hidden
          />
          Send feedback
        </summary>
        {/* Mounted only while open, so it rises in each time */}
        {open && <FeedbackBody />}
      </details>
    </MotionConfig>
  );
}

function FeedbackBody() {
  // Generated ids, only to link hints/errors to inputs for screen readers
  const messageHint = useId();
  const contactHint = useId();
  const [topic, setTopic] = useState<(typeof TOPICS)[number] | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: "onTouched",
    defaultValues: { message: "", contact: "", company: "" },
  });

  const length = watch("message").length;

  // Client checks are for UX only; the server action re-validates everything
  async function onSubmit(values: Values) {
    const formData = new FormData();
    formData.set(
      "message",
      topic ? `[${topic}] ${values.message.trim()}` : values.message,
    );
    formData.set("contact", values.contact);
    formData.set("company", values.company);
    const result = await sendFeedback(formData);
    if (result.ok) setSent(true);
    else setError("root.server", { message: result.message });
  }

  if (sent) {
    return (
      <motion.output {...rise} className="flex items-start gap-3 pt-3 pb-1">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-4" strokeWidth={3} aria-hidden />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">Thanks for the feedback</span>
          <span className="text-sm text-muted-foreground">
            It goes straight to Ricky, and every message gets read.
          </span>
          <button
            type="button"
            onClick={() => {
              reset();
              setTopic(null);
              setSent(false);
            }}
            className="mt-1 cursor-pointer self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Send another
          </button>
        </span>
      </motion.output>
    );
  }

  return (
    <motion.form
      {...rise}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 pt-3"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-sm text-muted-foreground">
          What's it about?
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(topic === t ? null : t)}
              className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-sm transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Your message</span>
        <span className="relative">
          <textarea
            rows={3}
            placeholder="What's working, what isn't, or a place we should add"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={messageHint}
            className={`${field} resize-none px-3 py-2 ${length >= COUNTER_FROM ? "pb-6" : ""}`}
            {...register("message", {
              validate: (v) =>
                v.trim().length > 0 || "Write a few words first.",
              maxLength: {
                value: MAX_MESSAGE,
                message: `Keep it under ${MAX_MESSAGE} characters.`,
              },
            })}
          />
          {length >= COUNTER_FROM && (
            <span
              className={`pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums ${length > MAX_MESSAGE ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {length}/{MAX_MESSAGE}
            </span>
          )}
        </span>
        <FieldError id={messageHint} message={errors.message?.message} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">Where can we reply?</span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </span>
        <input
          type="text"
          autoComplete="email"
          placeholder="Email or Telegram username"
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={contactHint}
          className={`${field} px-3 py-2`}
          {...register("contact", {
            maxLength: {
              value: MAX_CONTACT,
              message: `Keep it under ${MAX_CONTACT} characters.`,
            },
          })}
        />
        <FieldError id={contactHint} message={errors.contact?.message} />
      </label>

      {/* Honeypot: hidden from people, bots fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        {...register("company")}
      />

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-opacity disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden />
              Send feedback
            </>
          )}
        </button>
        {errors.root?.server && (
          <output className="flex items-center justify-center gap-1.5 text-sm">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            {errors.root.server.message}
          </output>
        )}
      </div>
    </motion.form>
  );
}

// Quiet inline error; the id stays mounted so aria-describedby always resolves
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <span id={id} className="min-h-0 text-sm">
      {message && (
        <span className="flex items-center gap-1.5">
          <CircleAlert className="size-4 shrink-0 text-primary" aria-hidden />
          {message}
        </span>
      )}
    </span>
  );
}
