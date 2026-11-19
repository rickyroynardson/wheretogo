"use server";

import "server-only";
import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { sendTelegramMessage } from "@/lib/telegram";

// Codes, not text: the form words them in the visitor's language
export type FeedbackError =
  | "invalid"
  | "empty"
  | "tooLong"
  | "rateLimited"
  | "failed";
export type FeedbackResult = { ok: true } | { ok: false; error: FeedbackError };

// Form allows 2000; the rest is room for the "[topic] [lang]" tags it adds
const MAX_MESSAGE = 2100;
const MAX_CONTACT = 200;

// FormData values can be File objects; only accept strings
function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendFeedback(
  formData: FormData,
): Promise<FeedbackResult> {
  // Actions are public POST endpoints; the argument can be anything
  if (!(formData instanceof FormData)) {
    return { ok: false, error: "invalid" };
  }

  // Honeypot: hidden from people, bots fill it. Pretend success.
  if (text(formData, "company")) return { ok: true };

  const message = text(formData, "message");
  const contact = text(formData, "contact");

  if (!message) {
    return { ok: false, error: "empty" };
  }
  if (message.length > MAX_MESSAGE || contact.length > MAX_CONTACT) {
    return { ok: false, error: "tooLong" };
  }

  // Vercel sets x-forwarded-for itself, so clients can't spoof it there
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (isRateLimited(ip)) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    await sendTelegramMessage(
      `New feedback\n\n${message}\n\nContact: ${contact || "-"}`,
    );
  } catch (error) {
    console.error(
      "[feedback] delivery failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, error: "failed" };
  }

  return { ok: true };
}
