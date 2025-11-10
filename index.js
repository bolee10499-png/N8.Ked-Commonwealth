require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

// Database initialization
const DatabaseInitializer = require('./database/initializer');

// Autonomous sovereign bot - observers watch, creator can override
const N8KedMinimalBot = require('./discord/bot_minimal');

// Global error handlers - prevent unexpected exit
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT_EXCEPTION]', error);
  console.error('[UNCAUGHT_EXCEPTION] Stack:', error.stack);
  console.error('[UNCAUGHT_EXCEPTION] Process continuing...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason);
  console.error('[UNHANDLED_REJECTION] Promise:', promise);
  console.error('[UNHANDLED_REJECTION] Process continuing...');
});

process.on('SIGTERM', () => {
  console.log('[SIGTERM] Received termination signal');
});

process.on('SIGINT', () => {
  console.log('[SIGINT] Received interrupt signal (Ctrl+C)');
});

process.on('beforeExit', (code) => {
  console.log('[BEFORE_EXIT] Code:', code);
});

process.on('exit', (code) => {
  console.log('[EXIT] Process exiting with code:', code);
});

async function bootstrap() {
  // Initialize database schema
  const dbPath = path.join(__dirname, 'data', 'commonwealth.db');
  const initializer = new DatabaseInitializer(dbPath);
  
  if (!DatabaseInitializer.isInitialized(dbPath)) {
    console.log('[BOOTSTRAP] First run detected - deploying schema...');
    initializer.initialize();
  } else {
    console.log('[BOOTSTRAP] Database already initialized');
  }

  // Open database connection
  const db = new Database(dbPath);
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
