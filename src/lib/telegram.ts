import "server-only";

// Plain text only (no parse_mode), so user input can't inject Telegram markup.
export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  // Never include the URL in errors: it contains the token
  if (!res.ok) throw new Error(`Telegram responded ${res.status}`);
}
