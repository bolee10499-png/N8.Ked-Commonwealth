import express from "express";
import cors from "cors";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.resolve(__dirname, "../config/constants.json");

const {
  BOT_TOKEN,
  CHANNEL_ID,
  PORT: ENV_PORT,
  ALLOWED_ORIGINS,
} = process.env;

const app = express();
app.disable("x-powered-by");

const allowedOrigins = (ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : undefined,
    credentials: false,
  })
);
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: false }));

const PORT = Number.parseInt(ENV_PORT || "4000", 10);

function loadConstants() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function computeLatencyFactor() {
  const primes = [2, 3, 5, 7, 11];
  const phi = 1.61803398875;
  const latestPrime = primes[primes.length - 1];
  return Number(((Math.log(latestPrime) * phi) / Math.PI).toFixed(4));
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
let botReady = false;

bot.once("ready", () => {
  botReady = true;
  console.log(`Logged in as ${bot.user.tag}`);
});

if (BOT_TOKEN) {
  bot.login(BOT_TOKEN).catch((error) => {
    console.error("Discord login failed", error);
  });
} else {
  console.warn("BOT_TOKEN missing; Discord bridge disabled");
}

app.post("/ping", async (req, res) => {
  try {
    const { content } = req.body ?? {};
    if (!content) {
      return res.status(400).json({ error: "content required" });
    }
    if (!CHANNEL_ID) {
      return res.status(500).json({ error: "CHANNEL_ID not configured" });
    }
    if (!botReady) {
      return res.status(503).json({ error: "bot not ready" });
    }
    const channel = await bot.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased?.()) {
      return res.status(404).json({ error: "channel unavailable" });
    }
    await channel.send(`📡 WebPing >> ${content}`.slice(0, 1800));
    return res.json({ status: "sent" });
  } catch (error) {
    console.error("Ping failed", error);
    return res.status(500).json({ error: error.message || "failed" });
  }
});

app.get("/status", (req, res) => {
  res.json({
    ready: botReady,
    time: Date.now(),
    latencyFactor: computeLatencyFactor(),
    constants: loadConstants(),
  });
});

app.post("/relay", (req, res) => {
  const { data } = req.body || {};
  if (!data) {
    return res.status(400).json({ error: "data required" });
  }
  console.debug("Relay payload received");
  return res.json({ ack: true });
});

app.listen(PORT, () => console.log(`Bridge running on ${PORT}`));

export { app };
