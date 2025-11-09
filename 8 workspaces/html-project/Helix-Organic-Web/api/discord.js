import fetch from "node-fetch";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

export async function invokeDiscordWebhook(request, response) {
  if (!webhookUrl) {
    response.status(500).json({ error: "Webhook URL missing" });
    return;
  }
  try {
    const payload = await request.json();
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Discord response ${res.status}`);
    }
    response.json({ status: "ok" });
  } catch (error) {
    response.status(500).json({ error: error.message || "Webhook failed" });
  }
}
