// Server-only helper (deliberately NOT a "use server" module: exports there
// become endpoints the browser can call).
export async function notifyTelegram(text: string): Promise<boolean> {
  const telegramBotId = process.env.TELEGRAM_BOT_API;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotId || !telegramChatId) {
    console.error("Missing Telegram bot credentials");
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotId}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "cache-control": "no-cache" },
      body: JSON.stringify({ chat_id: telegramChatId, text }),
    });
    if (!response.ok) throw new Error(`Telegram API Error: ${response.statusText}`);
    return true;
  } catch (error) {
    console.error("Failed to send telegram message:", error);
    return false;
  }
}
