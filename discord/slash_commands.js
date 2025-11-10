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
const ServerArchitect = require('./server_architect');

class SlashCommandSystem {
  constructor(client, db, herald, dustEconomy, securityValidator) {
    this.client = client;
    this.db = db;
    this.herald = herald;
    this.dustEconomy = dustEconomy;
    this.security = securityValidator;
    this.architect = new ServerArchitect(client, herald, securityValidator);
    this.autonomousEngine = null; // Set later by bot_core
    
    this.commands = this.buildCommands();
  }

  /**
   * SET AUTONOMOUS ENGINE
   * Called by bot_core after autonomous engine is initialized
   */
  setAutonomousEngine(engine) {
    this.autonomousEngine = engine;
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
        ),

      // /architect [action] - Server structure management (OWNER ONLY)
      new SlashCommandBuilder()
        .setName('architect')
        .setDescription('Manage server structure (channels/categories) - OWNER ONLY')
        .addStringOption(option =>
          option.setName('action')
            .setDescription('Action to perform')
            .setRequired(true)
            .addChoices(
              { name: 'Build Commonwealth Structure', value: 'build_structure' },
              { name: 'Create Category', value: 'create_category' },
              { name: 'Create Text Channel', value: 'create_text' },
              { name: 'Create Voice Channel', value: 'create_voice' },
              { name: 'Analyze Structure', value: 'analyze' }
            )
        )
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Name for new channel/category')
            .setRequired(false)
        )
        .addChannelOption(option =>
          option.setName('category')
            .setDescription('Parent category (for channel creation)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('topic')
            .setDescription('Channel topic/description')
            .setRequired(false)
        ),

      // /emergency-stop - Sovereign override to stop autonomous operation
      new SlashCommandBuilder()
        .setName('emergency-stop')
        .setDescription('⚠️ Stop autonomous operation (SOVEREIGN OVERRIDE)')
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
        case 'architect':
          await this.handleArchitect(interaction);
          break;
        case 'emergency-stop':
          await this.handleEmergencyStop(interaction);
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
   * 
   * Connects Inner World exploration to Blender 3D visualization
   * Phase 14: Integration complete
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

    // Get Inner World exploration data
    const { InnerWorld } = require('../lib/inner_world');
    const innerWorld = new InnerWorld();
    const exploration = innerWorld.explore(userId, location);

    if (!exploration) {
      return interaction.editReply({
        content: `❌ Location "${location}" not found. Use /help to see available locations.`,
        ephemeral: true
      });
    }

    // Get system metrics for 3D visualization
    const aiObserver = require('../lib/ai_observer');
    const observer = new aiObserver(this.db);
    const systemMetrics = observer.getCompleteSnapshot();

    // Generate 3D visualization using Blender integration
    const BlenderIntegration = require('../lib/blender_integration');
    const blender = new BlenderIntegration();
    
    let imageBuffer = null;
    let visualizationNote = '';
    
    try {
      // Check if Blender service is available
      const isAvailable = await blender.checkHealth();
      
      if (isAvailable) {
        console.log('[EXPLORE] Generating 3D scene...');
        imageBuffer = await blender.generateExplorationScene(exploration, systemMetrics);
        
        // Save render to disk for historical record
        const timestamp = Date.now();
        const filename = `explore_${location}_${userId}_${timestamp}.png`;
        await blender.saveRender(imageBuffer, filename);
        
        console.log('[EXPLORE] 3D scene generated successfully');
      } else {
        console.log('[EXPLORE] Blender service offline, using fallback');
        visualizationNote = '\n\n' + blender.generateFallbackScene(exploration);
      }
    } catch (error) {
      console.error('[EXPLORE] Blender visualization failed:', error.message);
      const blenderFallback = new BlenderIntegration();
      visualizationNote = '\n\n' + blenderFallback.generateFallbackScene(exploration);
    }

    // Record in database
    this.db.prepare(`
      INSERT INTO game_actions (user_id, action_type, details, timestamp)
      VALUES (?, 'explore', ?, ?)
    `).run(userId, location, Date.now());

    // Herald testimony
    const testimony = this.herald.observe('exploration_complete', {
      sovereign_id: userId,
      location,
      depth: exploration.depth,
      lore: exploration.lore,
      dust_spent: 10,
      visualization: imageBuffer ? '3D_rendered' : 'ASCII_fallback',
      timestamp: new Date().toISOString()
    });

    // Build response embed
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🌀 ${exploration.location.replace(/_/g, ' ').toUpperCase()} - Depth ${exploration.depth}`)
      .setDescription(exploration.lore + visualizationNote)
      .addFields(
        { name: 'Tutorial', value: exploration.tutorial_fragment || 'None', inline: true },
        { name: 'Dust Spent', value: '10', inline: true },
        { name: 'New Balance', value: (balance - 10).toString(), inline: true },
        { name: 'Exits', value: exploration.exits.join(', ') || 'None', inline: false }
      )
      .setFooter({ text: 'Herald Testimony: ' + testimony })
      .setTimestamp();

    if (imageBuffer) {
      embed.setImage('attachment://topology.png');
    }

    const replyOptions = {
      embeds: [embed]
    };

    if (imageBuffer) {
      replyOptions.files = [{ attachment: imageBuffer, name: 'topology.png' }];
    }

    await interaction.editReply(replyOptions);
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
      );

    // Add autonomous engine status if available
    if (this.autonomousEngine) {
      const autonomousStatus = this.autonomousEngine.getStatus();
      const recentDecisions = autonomousStatus.recent_decisions.slice(-3);
      
      embed.addFields({
        name: '🤖 Autonomous Operation',
        value: autonomousStatus.is_running 
          ? `✅ ACTIVE (${autonomousStatus.total_cycles} cycles)` 
          : '❌ INACTIVE',
        inline: false
      });

      if (recentDecisions.length > 0) {
        const decisionSummary = recentDecisions
          .map(d => `• ${d.type} (cycle ${d.cycle})`)
          .join('\n');
        
        embed.addFields({
          name: '🎯 Recent Decisions',
          value: decisionSummary || 'No recent decisions',
          inline: false
        });
      }

      const activeObservers = autonomousStatus.observer_status.filter(o => o.active).length;
      embed.addFields({
        name: '👁️ Observer Health',
        value: `${activeObservers}/7 active`,
        inline: true
      });
    }

    embed.setTimestamp();

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

  /**
   * HANDLE /architect COMMAND - Server structure management
   */
  async handleArchitect(interaction) {
    const action = interaction.options.getString('action');
    const name = interaction.options.getString('name');
    const categoryChannel = interaction.options.getChannel('category');
    const topic = interaction.options.getString('topic');

    // OWNER-ONLY CHECK
    const ownerId = process.env.OWNER_ID;
    if (interaction.user.id !== ownerId) {
      return interaction.editReply({
        content: '❌ **Access Denied:** Only the bot owner can manage server structure.',
        ephemeral: true
      });
    }

    const guild = interaction.guild;

    switch (action) {
      case 'build_structure':
        // Build complete Commonwealth structure
        const buildResult = await this.architect.buildCommonwealthStructure(guild);
        
        if (buildResult.success) {
          const embed = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle('🏛️ Commonwealth Structure Built')
            .setDescription('Complete N8.KED server architecture deployed')
            .addFields(
              { name: '📜 Categories Created', value: `${buildResult.categories}`, inline: true },
              { name: '📝 Channels Created', value: `${buildResult.channels}`, inline: true },
              { name: '⚖️ Herald Testimony', value: `${buildResult.testimony.message.substring(0, 100)}...` }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.editReply({
            content: `❌ Structure build failed: ${buildResult.error}`,
            ephemeral: true
          });
        }
        break;

      case 'create_category':
        if (!name) {
          return interaction.editReply({
            content: '❌ Please provide a category name',
            ephemeral: true
          });
        }

        const catResult = await this.architect.createCategory(guild, name);
        
        if (catResult.success) {
          await interaction.editReply({
            content: `✅ **Created category:** ${catResult.category.name}`
          });
        } else {
          await interaction.editReply({
            content: `❌ Failed: ${catResult.error}`,
            ephemeral: true
          });
        }
        break;

      case 'create_text':
        if (!name) {
          return interaction.editReply({
            content: '❌ Please provide a channel name',
            ephemeral: true
          });
        }

        const textResult = await this.architect.createTextChannel(guild, name, {
          categoryId: categoryChannel?.id || null,
          topic: topic || '' // Empty by default - configure via chat
        });
        
        if (textResult.success) {
          await interaction.editReply({
            content: `✅ **Created:** ${textResult.channel.toString()}\n💬 Set description by editing channel settings or chatting in the channel`
          });
        } else {
          await interaction.editReply({
            content: `❌ Failed: ${textResult.error}`,
            ephemeral: true
          });
        }
        break;

      case 'create_voice':
        if (!name) {
          return interaction.editReply({
            content: '❌ Please provide a channel name',
            ephemeral: true
          });
        }

        const voiceResult = await this.architect.createVoiceChannel(guild, name, {
          categoryId: categoryChannel?.id || null
        });
        
        if (voiceResult.success) {
          await interaction.editReply({
            content: `✅ **Created:** ${voiceResult.channel.toString()}`
          });
        } else {
          await interaction.editReply({
            content: `❌ Failed: ${voiceResult.error}`,
            ephemeral: true
          });
        }
        break;

      case 'analyze':
        const structure = await this.architect.analyzeServerStructure(guild);
        
        let analysisText = `**Server:** ${structure.guild_name}\n\n`;
        analysisText += `**Statistics:**\n`;
        analysisText += `📂 Categories: ${structure.total_categories}\n`;
        analysisText += `💬 Text Channels: ${structure.total_text_channels}\n`;
        analysisText += `🎙️ Voice Channels: ${structure.total_voice_channels}\n\n`;
        
        analysisText += `**Structure:**\n`;
        structure.categories.forEach(cat => {
          analysisText += `\n📁 **${cat.name}** (${cat.channels.length} channels)\n`;
          cat.channels.forEach(ch => {
            const icon = ch.type === 'text' ? '💬' : '🎙️';
            analysisText += `  ${icon} ${ch.name}\n`;
          });
        });

        // Split if too long
        if (analysisText.length > 2000) {
          const chunks = analysisText.match(/[\s\S]{1,1900}/g) || [];
          await interaction.editReply({ content: chunks[0] });
          for (let i = 1; i < chunks.length; i++) {
            await interaction.followUp({ content: chunks[i] });
          }
        } else {
          await interaction.editReply({ content: analysisText });
        }
        break;

      default:
        await interaction.editReply({
          content: '❌ Unknown architect action',
          ephemeral: true
        });
    }
  }

  /**
   * /EMERGENCY-STOP HANDLER
   * Sovereign override - user takes manual control
   */
  async handleEmergencyStop(interaction) {
    if (!this.autonomousEngine) {
      return interaction.editReply({
        content: '❌ Autonomous engine not available',
        ephemeral: true
      });
    }

    const status = this.autonomousEngine.getStatus();
    
    if (!status.is_running) {
      return interaction.editReply({
        content: '⚠️ Autonomous operation is already stopped',
        ephemeral: true
      });
    }

    // Stop autonomous operation
    await this.autonomousEngine.stop();

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🛑 EMERGENCY STOP ACTIVATED')
      .setDescription('**Sovereign Override Executed**')
      .addFields(
        { name: 'Total Cycles Completed', value: status.total_cycles.toString(), inline: true },
        { name: 'Total Decisions Made', value: status.recent_decisions.length.toString(), inline: true },
        { name: 'Status', value: '❌ MANUAL CONTROL', inline: false }
      )
      .setFooter({ text: 'Commonwealth awaits your command, Sovereign' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // Herald testifies to sovereign override
    await this.herald.testifyToEvent({
      eventType: 'SOVEREIGN_OVERRIDE',
      description: `Emergency stop executed by ${interaction.user.username}`,
      metadata: {
        user_id: interaction.user.id,
        cycles_completed: status.total_cycles
      }
    });
  }
}

module.exports = SlashCommandSystem;

