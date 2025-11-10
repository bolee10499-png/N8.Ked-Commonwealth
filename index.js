require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

// Autonomous sovereign bot - observers watch, creator can override
const N8KedMinimalBot = require('./discord/bot_minimal');

async function bootstrap() {
  // Initialize database
  const db = new Database(path.join(__dirname, 'data', 'commonwealth.db'));
  db.pragma('journal_mode = WAL');

  // Initialize minimal autonomous bot
  const bot = new N8KedMinimalBot({
    database: db,
    creatorId: process.env.CREATOR_DISCORD_ID // For sovereign override + filial piety
  });

  await bot.start(process.env.DISCORD_BOT_TOKEN);
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap n8.ked:', error);
  process.exitCode = 1;
});
