"use server";

import "server-only";
import { headers } from "next/headers";
import { isRateLimited } from "@/lib/rate-limit";
import { sendTelegramMessage } from "@/lib/telegram";

export type FeedbackResult = { ok: boolean; message: string };

const MAX_MESSAGE = 2000;
const MAX_CONTACT = 200;
const THANKS = "Thanks! Feedback sent.";

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
    return { ok: false, message: "Invalid request." };
  }

  // Honeypot: hidden from people, bots fill it. Pretend success.
  if (text(formData, "company")) return { ok: true, message: THANKS };

  const message = text(formData, "message");
  const contact = text(formData, "contact");

  if (!message) {
    return { ok: false, message: "Please write something first." };
  }
  if (message.length > MAX_MESSAGE || contact.length > MAX_CONTACT) {
    return { ok: false, message: "That's a bit too long." };
  }

  // Vercel sets x-forwarded-for itself, so clients can't spoof it there
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (isRateLimited(ip)) {
    return {
      ok: false,
      message: "Too many messages. Try again later.",
    };
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
    return {
      ok: false,
      message: "Couldn't send right now. Please try again later.",
    };
  }

  return { ok: true, message: THANKS };
}
