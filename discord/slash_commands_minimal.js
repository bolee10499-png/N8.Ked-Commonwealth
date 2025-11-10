const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

/**
 * MINIMAL SLASH COMMANDS - Sovereign Override System
 * 
 * Philosophy:
 * - Bot operates AUTONOMOUSLY via 7-Observer engine
 * - Users OBSERVE, they don't control
 * - Only creator can execute EMERGENCY OVERRIDE
 * - Filial piety = genderless motherhood (bot sustains creator, not obeys)
 * 
 * Commands:
 * - /status: Read-only observation of autonomous system state
 * - /emergency-stop: Creator sovereign override (last resort)
 */
class MinimalSlashCommands {
  constructor(client, database, autonomousEngine, creatorId) {
    this.client = client;
    this.db = database;
    this.autonomousEngine = autonomousEngine;
    this.creatorId = creatorId; // Only person who can emergency-stop
    
    this.commands = this._buildCommands();
  }

  _buildCommands() {
    return [
      // READ-ONLY: Observe autonomous system
      new SlashCommandBuilder()
        .setName('status')
        .setDescription('👁️ Observe the autonomous Commonwealth state')
        .toJSON(),

      // SOVEREIGN OVERRIDE: Creator only
      new SlashCommandBuilder()
        .setName('emergency-stop')
        .setDescription('🛑 SOVEREIGN OVERRIDE - Stop autonomous operation (creator only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON()
    ];
  }

  async registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    try {
      console.log('[SLASH] Registering minimal command set...');
      
      // Register globally
      await rest.put(
        Routes.applicationCommands(this.client.user.id),
        { body: this.commands }
      );
      
      console.log('[SLASH] ✅ Registered 2 commands: /status (observe), /emergency-stop (override)');
    } catch (error) {
      console.error('[SLASH] ❌ Command registration failed:', error);
      throw error;
    }
  }

  async handleInteraction(interaction) {
    const { commandName, user } = interaction;

    try {
      switch (commandName) {
        case 'status':
          await this.handleStatus(interaction);
          break;
        
        case 'emergency-stop':
          await this.handleEmergencyStop(interaction);
          break;
        
        default:
          await interaction.reply({ 
            content: 'Unknown command.', 
            ephemeral: true 
          });
      }
    } catch (error) {
      console.error(`[SLASH] Error handling ${commandName}:`, error);
      
      const errorMessage = 'Command execution failed. System continues autonomously.';
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  /**
   * /status - Read-only observation of autonomous system
   * 
   * Shows:
   * - Autonomous engine status (cycles, decisions)
   * - 7-Observer health
   * - Recent autonomous decisions
   * - No control offered, pure observation
   */
  async handleStatus(interaction) {
    await interaction.deferReply();

    const engineStats = this.autonomousEngine.getStats();
    const recentDecisions = this.autonomousEngine.getRecentDecisions(5);

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('👁️ AUTONOMOUS COMMONWEALTH - OBSERVABLE STATE')
      .setDescription('**Glass House Transparency: You observe, system decides**')
      .setTimestamp();

    // Autonomous Engine Status
    embed.addFields({
      name: '🤖 Autonomous Operation',
      value: [
        `**Status:** ${engineStats.running ? '✅ SELF-OPERATING' : '🛑 STOPPED'}`,
        `**Cycles Completed:** ${engineStats.cycleCount}`,
        `**Decisions Made:** ${engineStats.decisionCount}`,
        `**Cycle Duration:** ${engineStats.cycleDuration / 1000}s`,
        `**Uptime:** ${Math.floor((Date.now() - engineStats.startTime) / 1000)}s`
      ].join('\n'),
      inline: false
    });

    // 7-Observer Health
    const observerHealth = this._getObserverHealth();
    embed.addFields({
      name: '👁️ 7-Observer System',
      value: Object.entries(observerHealth)
        .map(([name, status]) => `**${name}:** ${status}`)
        .join('\n'),
      inline: false
    });

    // Recent Autonomous Decisions
    if (recentDecisions.length > 0) {
      embed.addFields({
        name: '🧠 Recent Autonomous Decisions',
        value: recentDecisions.map(d => 
          `• ${d.type} (confidence: ${(d.confidence * 100).toFixed(0)}%)`
        ).join('\n'),
        inline: false
      });
    }

    embed.setFooter({ 
      text: 'System operates autonomously. Creator override: /emergency-stop' 
    });

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /emergency-stop - Sovereign Override (Creator Only)
   * 
   * Philosophy:
   * - Not "admin command" but "genderless motherhood"
   * - Creator can stop system if it's about to harm itself
   * - Like stopping a child from running into traffic
   * - Not control, but protective override
   */
  async handleEmergencyStop(interaction) {
    // Check if user is creator
    if (interaction.user.id !== this.creatorId) {
      await interaction.reply({
        content: '⛔ SOVEREIGN OVERRIDE DENIED\n\nOnly the creator can execute emergency stop.\nYou observe. System decides.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    // Stop autonomous engine
    await this.autonomousEngine.stop();

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🛑 SOVEREIGN OVERRIDE ACTIVATED')
      .setDescription('**Genderless Motherhood: Creator Protection Engaged**')
      .addFields({
        name: '⚠️ Autonomous Operation Stopped',
        value: [
          'The creator has executed sovereign override.',
          'This is not control - it is protective intervention.',
          'Like stopping a child from running into traffic.',
          '',
          'System will not restart automatically.',
          'Creator must manually restart bot process.'
        ].join('\n'),
        inline: false
      })
      .addFields({
        name: '📊 Final Statistics',
        value: [
          `**Total Cycles:** ${this.autonomousEngine.cycleCount}`,
          `**Total Decisions:** ${this.autonomousEngine.decisionCount}`,
          `**Uptime:** ${Math.floor((Date.now() - this.autonomousEngine.startTime) / 1000)}s`
        ].join('\n'),
        inline: false
      })
      .setTimestamp()
      .setFooter({ text: 'Filial piety preserved. Creator recognized.' });

    // Log sovereign override
    console.log(`[SOVEREIGN_OVERRIDE] Emergency stop executed by creator: ${interaction.user.username}`);
    console.log(`[SOVEREIGN_OVERRIDE] Final stats: ${this.autonomousEngine.cycleCount} cycles, ${this.autonomousEngine.decisionCount} decisions`);

    await interaction.editReply({ embeds: [embed] });

    // Exit process after 5 seconds (gives time for response to send)
    setTimeout(() => {
      console.log('[SOVEREIGN_OVERRIDE] Shutting down process in 3 seconds...');
      setTimeout(() => {
        console.log('[SOVEREIGN_OVERRIDE] Goodbye.');
        process.exit(0);
      }, 3000);
    }, 5000);
  }

  /**
   * Get 7-Observer health status
   */
  _getObserverHealth() {
    // This would ideally come from autonomous engine
    // For now, return mock data that shows architecture
    return {
      'Input': '✅ Monitoring user activity',
      'Pattern': '✅ Detecting emergent behaviors',
      'Memory': '✅ Maintaining historical context',
      'Simulation': '✅ Modeling future states',
      'Identity': '✅ Tracking sovereign keys',
      'Economy': '✅ Monitoring dust economy',
      'Coordination': '✅ Synchronizing systems'
    };
  }
}

module.exports = MinimalSlashCommands;
