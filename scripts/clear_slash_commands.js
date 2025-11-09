/**
 * SLASH COMMAND CLEANER
 * Removes all outdated slash commands from Discord's servers
 * Run once to clean up old bot configuration
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = '1431150321542893623'; // Your bot's ID from the terminal output

const rest = new REST({ version: '10' }).setToken(token);

async function clearSlashCommands() {
  try {
    console.log('🧹 Fetching all registered slash commands...');

    // Get global commands
    const globalCommands = await rest.get(
      Routes.applicationCommands(clientId)
    );

    console.log(`Found ${globalCommands.length} global slash commands:`);
    globalCommands.forEach(cmd => {
      console.log(`  - /${cmd.name} (ID: ${cmd.id})`);
    });

    if (globalCommands.length > 0) {
      console.log('\n🗑️  Deleting global slash commands...');
      
      for (const command of globalCommands) {
        await rest.delete(
          Routes.applicationCommand(clientId, command.id)
        );
        console.log(`  ✅ Deleted /${command.name}`);
      }
    }

    // Also clear guild-specific commands if any
    console.log('\n🔍 Checking for guild-specific commands...');
    console.log('💡 Tip: If you see commands in a specific server, provide the Guild ID to clear those too.');
    
    console.log('\n✨ Done! All slash commands cleared.');
    console.log('📝 Your bot now uses ! prefix commands only.');
    
  } catch (error) {
    console.error('❌ Error clearing slash commands:', error);
    
    if (error.code === 50001) {
      console.log('\n💡 Error 50001 means missing access. This is normal if there are no commands.');
    } else if (error.rawError?.message) {
      console.log('Details:', error.rawError.message);
    }
  }
}

clearSlashCommands();
