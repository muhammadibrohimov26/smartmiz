"use server";

export async function sendContactMessage(values: {
  name: string;
  tel: string;
  kurs: string;
}) {
  const telegramBotId = process.env.TELEGRAM_BOT_API;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotId || !telegramChatId) {
    console.error("Missing Telegram bot credentials");
    return { success: false, error: "Server configuration error" };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotId}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `Ism: ${values.name}:\nTelefon nomeri: ${values.tel}:\nKurs nomi: ${values.kurs}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send telegram message:", error);
    return { success: false, error: "Failed to send message" };
  }
}
