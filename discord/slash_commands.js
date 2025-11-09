/**
 * SLASH COMMAND SYSTEM
 * 
 * Modern Discord slash command infrastructure using Discord.js v14
 * Replaces legacy !command system with native Discord interactions
 * 
 * Commands:
 * - /explore [location] - Generate 3D scene and explore locations
 * - /challenge [opponent] - PVP battle system
 * - /build [circuit] - Construct redstone circuits
 * - /research [topic] - Query AI Observer for patterns
 * - /status - System health and metrics
 * - /reputation [@user] - View reputation and achievements
 * - /dust [action] - Dust economy operations
 * - /link-wallet [chain] [address] [signature] - Multi-wallet federation
 * - /wallet-verify - Get verification message for wallet signing
 * - /my-wallets - View linked wallets and cross-chain dust
 * - /unlink-wallet [chain] [address] - Remove wallet from federation
 * - /federation-stats - Global wallet federation statistics
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  linkWalletCommand,
  walletVerifyCommand,
  myWalletsCommand,
  unlinkWalletCommand,
  federationStatsCommand
} = require('./wallet_commands');

class SlashCommandSystem {
  constructor(client, db, herald, dustEconomy, securityValidator) {
    this.client = client;
    this.db = db;
    this.herald = herald;
    this.dustEconomy = dustEconomy;
    this.security = securityValidator;
    
    this.commands = this.buildCommands();
  }

  /**
   * BUILD COMMAND DEFINITIONS
   */
  buildCommands() {
    return [
      // Wallet Federation Commands
      linkWalletCommand.data,
      walletVerifyCommand.data,
      myWalletsCommand.data,
      unlinkWalletCommand.data,
      federationStatsCommand.data,
      
      // /explore [location]
      new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explore a location and generate 3D visualization')
        .addStringOption(option =>
          option.setName('location')
            .setDescription('Location to explore (ancient_ruins, crystal_cave, void_temple, etc.)')
            .setRequired(true)
            .addChoices(
              { name: 'Ancient Ruins', value: 'ancient_ruins' },
              { name: 'Crystal Cave', value: 'crystal_cave' },
              { name: 'Void Temple', value: 'void_temple' },
              { name: 'Quantum Garden', value: 'quantum_garden' },
              { name: 'Dust Mines', value: 'dust_mines' },
              { name: 'Herald Chamber', value: 'herald_chamber' }
            )
        ),

      // /challenge [opponent]
      new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('Challenge another sovereign to PVP battle')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('Opponent to challenge')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('wager')
            .setDescription('Dust amount to wager')
            .setRequired(false)
        ),

      // /build [circuit]
      new SlashCommandBuilder()
        .setName('build')
        .setDescription('Construct a redstone circuit')
        .addStringOption(option =>
          option.setName('circuit_type')
            .setDescription('Type of circuit to build')
            .setRequired(true)
            .addChoices(
              { name: 'Control Dial', value: 'control_dial' },
              { name: 'Data Pipe', value: 'data_pipe' },
              { name: 'Redstone Node', value: 'redstone_node' },
              { name: 'Logic Gate', value: 'logic_gate' }
            )
        )
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Name for your circuit')
            .setRequired(false)
        ),

      // /research [topic]
      new SlashCommandBuilder()
        .setName('research')
        .setDescription('Query AI Observer for pattern analysis')
        .addStringOption(option =>
          option.setName('topic')
            .setDescription('Topic to research')
            .setRequired(true)
            .addChoices(
              { name: 'Economy Snapshot', value: 'economy' },
              { name: 'Reputation Distribution', value: 'reputation' },
              { name: 'Governance Activity', value: 'governance' },
              { name: 'System Trajectory', value: 'trajectory' },
              { name: 'Emergent Patterns', value: 'patterns' }
            )
        ),

      // /status
      new SlashCommandBuilder()
        .setName('status')
        .setDescription('View system health and performance metrics'),

      // /reputation [@user]
      new SlashCommandBuilder()
        .setName('reputation')
        .setDescription('View reputation and achievements')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to check (leave empty for yourself)')
            .setRequired(false)
        ),

      // /dust [action]
      new SlashCommandBuilder()
        .setName('dust')
        .setDescription('Dust economy operations')
        .addStringOption(option =>
          option.setName('action')
            .setDescription('Action to perform')
            .setRequired(true)
            .addChoices(
              { name: 'Check Balance', value: 'balance' },
              { name: 'Send Dust', value: 'send' },
              { name: 'View History', value: 'history' },
              { name: 'Cooldown Status', value: 'cooldown' }
            )
        )
        .addUserOption(option =>
          option.setName('recipient')
            .setDescription('User to send dust to (for send action)')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount to send')
            .setRequired(false)
            .setMinValue(1)
        )
    ];
  }

  /**
   * REGISTER COMMANDS WITH DISCORD
   */
  async registerCommands() {
    try {
      console.log('[SLASH] Registering slash commands...');
      
      const commandData = this.commands.map(cmd => cmd.toJSON());
      
      // Register globally (takes up to 1 hour to propagate)
      // await this.client.application.commands.set(commandData);
      
      // Register per-guild (instant, for development)
      const guilds = this.client.guilds.cache;
      for (const guild of guilds.values()) {
        await guild.commands.set(commandData);
        console.log(`[SLASH] Registered ${commandData.length} commands in ${guild.name}`);
      }
      
      console.log('[SLASH] ✅ All commands registered');
    } catch (error) {
      console.error('[SLASH] Command registration failed:', error);
      throw error;
    }
  }

  /**
   * HANDLE SLASH COMMAND INTERACTIONS
   */
  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    try {
      // Defer reply for long-running operations
      await interaction.deferReply();

      // Security validation
      const validation = await this.security.validateCommand(
        commandName,
        this.extractCommandArgs(interaction),
        user.id
      );

      if (!validation.approved) {
        return interaction.editReply({
          content: `❌ **Security:** ${validation.reason}`,
          ephemeral: true
        });
      }

      // Route to command handler
      switch (commandName) {
        case 'explore':
          await this.handleExplore(interaction, validation);
          break;
        case 'challenge':
          await this.handleChallenge(interaction, validation);
          break;
        case 'build':
          await this.handleBuild(interaction, validation);
          break;
        case 'research':
          await this.handleResearch(interaction, validation);
          break;
        case 'status':
          await this.handleStatus(interaction);
          break;
        case 'reputation':
          await this.handleReputation(interaction);
          break;
        case 'dust':
          await this.handleDust(interaction, validation);
          break;
        case 'link-wallet':
          await linkWalletCommand.execute(interaction);
          break;
        case 'wallet-verify':
          await walletVerifyCommand.execute(interaction);
          break;
        case 'my-wallets':
          await myWalletsCommand.execute(interaction);
          break;
        case 'unlink-wallet':
          await unlinkWalletCommand.execute(interaction);
          break;
        case 'federation-stats':
          await federationStatsCommand.execute(interaction);
          break;
        default:
          await interaction.editReply('❌ Unknown command');
      }

    } catch (error) {
      console.error(`[SLASH] Command ${commandName} error:`, error);
      
      const errorMsg = interaction.deferred || interaction.replied
        ? interaction.editReply
        : interaction.reply;
      
      await errorMsg.call(interaction, {
        content: `❌ Command failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * EXTRACT COMMAND ARGUMENTS
   */
  extractCommandArgs(interaction) {
    const args = [];
    interaction.options.data.forEach(option => {
      args.push(option.value?.toString() || '');
    });
    return args;
  }

  /**
   * /EXPLORE HANDLER
   */
  async handleExplore(interaction, validation) {
    const location = validation.sanitized[0];
    const userId = interaction.user.id;

    // Check dust balance (exploration costs 10 dust)
    const balance = this.dustEconomy.getBalance(userId);
    if (balance < 10) {
      return interaction.editReply({
        content: `❌ Insufficient dust. You need 10 dust to explore. Current balance: ${balance}`,
        ephemeral: true
      });
    }

    // Deduct dust
    this.dustEconomy.deductDust(userId, 10, 'exploration');

    // Generate Blender scene (requires blender_client)
    const BlenderClient = require('../lib/blender_client');
    const blender = new BlenderClient();
    
    const sceneData = {
      topology: { location },
      user_id: userId,
      timestamp: Date.now()
    };

    const imageBuffer = await blender.generateScene(sceneData);

    // Record in database
    this.db.prepare(`
      INSERT INTO game_actions (user_id, action_type, details, timestamp)
      VALUES (?, 'explore', ?, ?)
    `).run(userId, location, Date.now());

    // Herald testimony
    const testimony = this.herald.observe('exploration_complete', {
      sovereign_id: userId,
      location,
      dust_spent: 10,
      timestamp: new Date().toISOString()
    });

    // Send response
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🗺️ Exploration: ${location.replace('_', ' ').toUpperCase()}`)
      .setDescription(testimony)
      .addFields(
        { name: 'Location', value: location, inline: true },
        { name: 'Dust Spent', value: '10', inline: true },
        { name: 'New Balance', value: balance - 10, inline: true }
      )
      .setImage('attachment://scene.png')
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      files: [{ attachment: imageBuffer, name: 'scene.png' }]
    });
  }

  /**
   * /CHALLENGE HANDLER (PLACEHOLDER)
   */
  async handleChallenge(interaction, validation) {
    const opponent = interaction.options.getUser('opponent');
    const wager = interaction.options.getString('wager') || '0';

    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('⚔️ PVP Challenge Issued')
      .setDescription(`${interaction.user} has challenged ${opponent} to battle!`)
      .addFields(
        { name: 'Wager', value: `${wager} dust`, inline: true },
        { name: 'Status', value: '⏳ Awaiting acceptance', inline: true }
      )
      .setFooter({ text: 'PVP system activation pending Phase 2' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /BUILD HANDLER (PLACEHOLDER)
   */
  async handleBuild(interaction, validation) {
    const circuitType = validation.sanitized[0];
    const name = interaction.options.getString('name') || 'Unnamed Circuit';

    const embed = new EmbedBuilder()
      .setColor('#00AAFF')
      .setTitle('🔧 Circuit Construction')
      .setDescription(`Building ${circuitType.replace('_', ' ')}...`)
      .addFields(
        { name: 'Name', value: name, inline: true },
        { name: 'Type', value: circuitType, inline: true },
        { name: 'Progress', value: '⏳ Under construction', inline: true }
      )
      .setFooter({ text: 'Circuit system activation pending Phase 2' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /RESEARCH HANDLER
   */
  async handleResearch(interaction, validation) {
    const topic = validation.sanitized[0];
    const aiObserver = require('../lib/ai_observer');
    const observer = new aiObserver(this.db);

    let data;
    switch (topic) {
      case 'economy':
        data = observer.getEconomySnapshot();
        break;
      case 'reputation':
        data = observer.getReputationSnapshot();
        break;
      case 'governance':
        data = observer.getGovernanceSnapshot();
        break;
      case 'trajectory':
        data = observer.getSystemTrajectory(7);
        break;
      case 'patterns':
        data = observer.detectEmergentPatterns();
        break;
      default:
        data = { error: 'Unknown topic' };
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`🔮 AI Observer: ${topic.toUpperCase()}`)
      .setDescription('**Pattern Analysis Results**')
      .addFields(
        Object.entries(data).slice(0, 10).map(([key, value]) => ({
          name: key.replace(/_/g, ' ').toUpperCase(),
          value: typeof value === 'object' ? JSON.stringify(value, null, 2).substring(0, 100) : value.toString(),
          inline: true
        }))
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /STATUS HANDLER
   */
  async handleStatus(interaction) {
    const aiObserver = require('../lib/ai_observer');
    const observer = new aiObserver(this.db);
    const snapshot = observer.getCompleteSnapshot();

    const embed = new EmbedBuilder()
      .setColor('#00FF88')
      .setTitle('📊 System Status')
      .setDescription('**Commonwealth Health Metrics**')
      .addFields(
        { name: '👥 Total Sovereigns', value: snapshot.users.totalUsers.toString(), inline: true },
        { name: '💰 Total FRAG', value: snapshot.economy.totalFRAG.toString(), inline: true },
        { name: '⚖️ Active Proposals', value: snapshot.governance.activeProposals.toString(), inline: true },
        { name: '🏆 Avg Reputation', value: snapshot.reputation.average.toFixed(2), inline: true },
        { name: '📈 Transaction Velocity', value: `${snapshot.economy.transactionVelocity}/day`, inline: true },
        { name: '🎨 Total NFTs', value: snapshot.nfts.totalNFTs.toString(), inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /REPUTATION HANDLER
   */
  async handleReputation(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

    const user = this.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(userId);
    if (!user) {
      return interaction.editReply({
        content: '❌ User not found in commonwealth',
        ephemeral: true
      });
    }

    const achievements = this.db.prepare(`
      SELECT COUNT(*) as count FROM identity_achievements WHERE user_id = ?
    `).get(userId).count;

    const percentile = this.calculatePercentile(user.reputation_score);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 Reputation: ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'Score', value: user.reputation_score.toString(), inline: true },
        { name: 'Percentile', value: `${percentile}th`, inline: true },
        { name: 'Achievements', value: achievements.toString(), inline: true },
        { name: 'FRAG Balance', value: user.frag_balance.toString(), inline: true },
        { name: 'Entity Type', value: user.entity_type || 'HUMAN', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  /**
   * /DUST HANDLER
   */
  async handleDust(interaction, validation) {
    const action = validation.sanitized[0];
    const userId = interaction.user.id;

    switch (action) {
      case 'balance':
        const balance = this.dustEconomy.getBalance(userId);
        await interaction.editReply({
          content: `💰 **Your dust balance:** ${balance}`
        });
        break;

      case 'send':
        const recipient = interaction.options.getUser('recipient');
        const amount = interaction.options.getInteger('amount');
        
        if (!recipient || !amount) {
          return interaction.editReply({
            content: '❌ Please specify recipient and amount',
            ephemeral: true
          });
        }

        const result = this.dustEconomy.transfer(userId, recipient.id, amount);
        if (result.success) {
          await interaction.editReply({
            content: `✅ Sent ${amount} dust to ${recipient.username}`
          });
        } else {
          await interaction.editReply({
            content: `❌ Transfer failed: ${result.error}`,
            ephemeral: true
          });
        }
        break;

      case 'history':
        const history = this.dustEconomy.getTransactionHistory(userId, 10);
        const historyText = history.map((tx, i) => 
          `${i + 1}. ${tx.type}: ${tx.amount} dust - ${new Date(tx.timestamp).toLocaleString()}`
        ).join('\n');

        await interaction.editReply({
          content: `📜 **Recent Transactions:**\n\`\`\`\n${historyText || 'No transactions'}\n\`\`\``
        });
        break;

      case 'cooldown':
        const cooldown = this.dustEconomy.checkCooldown(userId, 'bite');
        await interaction.editReply({
          content: cooldown.onCooldown 
            ? `⏳ Next !bite available in ${Math.ceil(cooldown.remaining / 60000)} minutes`
            : `✅ !bite command ready`
        });
        break;
    }
  }

  /**
   * CALCULATE REPUTATION PERCENTILE
   */
  calculatePercentile(score) {
    const allScores = this.db.prepare('SELECT reputation_score FROM users ORDER BY reputation_score ASC').all();
    const lowerCount = allScores.filter(u => u.reputation_score < score).length;
    return Math.round((lowerCount / allScores.length) * 100);
  }
}

module.exports = SlashCommandSystem;
