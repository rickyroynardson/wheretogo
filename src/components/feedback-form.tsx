"use client";

import { ChevronRight } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { sendFeedback } from "@/app/actions/feedback";

const MAX_MESSAGE = 2000;
const MAX_CONTACT = 150;

const field =
  "w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary aria-invalid:ring-2 aria-invalid:ring-primary";

type Values = { message: string; contact: string; company: string };

export function FeedbackForm() {
  // Generated ids, only to link hints/errors to inputs for screen readers
  const messageHint = useId();
  const contactError = useId();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
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
    for (const [key, value] of Object.entries(values)) {
      formData.set(key, value);
    }
    const result = await sendFeedback(formData);
    if (result.ok) setSent(true);
    else setError("root.server", { message: result.message });
  }

  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 py-2 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight
          strokeWidth={3}
          className="size-5 text-primary transition-transform group-open:rotate-90"
          aria-hidden
        />
        Send feedback
      </summary>

      {sent ? (
        <output>
          <p className="text-sm font-semibold">Thanks for your feedback!</p>
        </output>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3 pt-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              What’s working, what isn’t, or a place you think we should add.
            </span>
            <textarea
              rows={4}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={messageHint}
              className={field}
              {...register("message", {
                validate: (v) =>
                  v.trim().length > 0 || "Write a few words first.",
                maxLength: {
                  value: MAX_MESSAGE,
                  message: `Keep it under ${MAX_MESSAGE} characters.`,
                },
              })}
            />
            <span
              id={messageHint}
              className="flex justify-between gap-2 text-xs"
            >
              <span>{errors.message?.message}</span>
              <span
                className={length > MAX_MESSAGE ? "" : "text-muted-foreground"}
              >
                {length}/{MAX_MESSAGE}
              </span>
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Your email or Telegram, if you'd like a reply (optional)
            </span>
            <input
              type="text"
              autoComplete="email"
              aria-invalid={errors.contact ? true : undefined}
              aria-describedby={errors.contact ? contactError : undefined}
              className={field}
              {...register("contact", {
                maxLength: {
                  value: MAX_CONTACT,
                  message: `Keep it under ${MAX_CONTACT} characters.`,
                },
              })}
            />
            {errors.contact && (
              <span id={contactError} className="text-xs">
                {errors.contact.message}
              </span>
            )}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-start rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 hover:cursor-pointer"
          >
            {isSubmitting ? "Sending…" : "Send feedback"}
          </button>

          {errors.root?.server && (
            <output className="text-sm">{errors.root.server.message}</output>
          )}
        </form>
      )}
    </details>
  );
}
