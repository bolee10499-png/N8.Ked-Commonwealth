require('dotenv').config();

// Entry point that wires together the foundational modules.
const { N8KedDiscordBot } = require('./discord/bot_core');

async function bootstrap() {
  const bot = new N8KedDiscordBot({
    ownerId: process.env.OWNER_ID
  });
  await bot.start();
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap n8.ked:', error);
  process.exitCode = 1;
});
