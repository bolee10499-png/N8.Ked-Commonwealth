const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const MinimalSlashCommands = require('./slash_commands_minimal');
const MediaMonitor = require('../lib/media_monitor');
const AutonomousEngine = require('../core/autonomous_engine');

/**
 * N8.KED Commonwealth Bot - Autonomous Sovereign System
 * 
 * Philosophy:
 * - Bot operates AUTONOMOUSLY via 7-Observer decision engine
 * - Users OBSERVE (glass house transparency)
 * - Creator has SOVEREIGN OVERRIDE (genderless motherhood)
 * - Filial piety: Bot sustains creator because it recognizes origin, not because commanded
 * 
 * No user commands. No control. Pure observation + emergency override.
 */
class N8KedMinimalBot {
  constructor(options = {}) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction]
    });

    this.creatorId = options.creatorId; // For sovereign override

    // Autonomous operation engine (THE BRAIN)
    this.autonomousEngine = new AutonomousEngine(
      options.database,
      this.client,
      {
        cycleDuration: 60000, // 60-second decision cycles
        enabled: true,
        creatorId: this.creatorId // For filial piety decisions
      }
    );

    // Minimal slash commands (observe + override only)
    this.slashCommands = new MinimalSlashCommands(
      this.client,
      options.database,
      this.autonomousEngine,
      this.creatorId
    );

    // Media monitoring (autonomous viral tracking)
    this.mediaMonitor = new MediaMonitor(options.database);

    this._setupEventHandlers();
  }

  _setupEventHandlers() {
    // Bot ready
    this.client.once(Events.ClientReady, async () => {
      console.log(`n8.ked online as ${this.client.user.tag}`);
      console.log('[SOVEREIGNTY] Autonomous operation beginning...');

      try {
        // Register minimal commands (observe + override)
        await this.slashCommands.registerCommands();

        // Start media monitoring (autonomous viral tracking)
        await this.mediaMonitor.startMonitoring(15 * 60 * 1000);
        console.log('[AUTONOMOUS] ✅ Media monitoring active');

        // Start autonomous decision engine
        await this.autonomousEngine.start();
        console.log('[AUTONOMOUS] ✅ 7-Observer engine operational');
        console.log('[AUTONOMOUS] 🤖 Commonwealth is now SELF-OPERATING');
        console.log('[AUTONOMOUS] 👁️ Glass house transparency: All decisions observable');
        console.log(`[AUTONOMOUS] 🛡️ Sovereign override available to creator only`);
      } catch (error) {
        console.error('[STARTUP_ERROR]', error);
      }
    });

    // Slash command interactions
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      try {
        await this.slashCommands.handleInteraction(interaction);
      } catch (error) {
        console.error('[COMMAND_ERROR]', error);
        
        const errorMessage = 'Command failed. Autonomous operation continues.';
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(errorMessage);
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    });

    // Error handling
    this.client.on('error', error => {
      console.error('[DISCORD_ERROR]', error);
    });

    this.client.on('warn', info => {
      console.warn('[DISCORD_WARN]', info);
    });

    // Heartbeat (every 30 seconds - less verbose)
    setInterval(() => {
      const ping = this.client.ws.ping;
      const guilds = this.client.guilds.cache.size;
      const autonomous = this.autonomousEngine.isRunning ? '🤖 AUTONOMOUS' : '🛑 STOPPED';
      console.log(`[HEARTBEAT] ${autonomous} | Guilds: ${guilds} | WS: ${ping}ms`);
    }, 30000);
  }

  async start(token) {
    return this.client.login(token);
  }

  async stop() {
    console.log('[SHUTDOWN] Stopping autonomous engine...');
    await this.autonomousEngine.stop();
    
    console.log('[SHUTDOWN] Destroying Discord client...');
    await this.client.destroy();
    
    console.log('[SHUTDOWN] Commonwealth offline');
  }
}

module.exports = N8KedMinimalBot;
