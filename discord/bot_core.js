const { Client, GatewayIntentBits, Partials, Events, EmbedBuilder } = require('discord.js');
const { CommandSystem } = require('./command_system');
const { GameIntegration } = require('./game_integration');
const { N8KedCore } = require('../core/quantum_engine');
const { CoreMetadataEconomy } = require('../core/metadata_economy');
const { TripleHelixEngine } = require('../core/triple_helix');
const { RedstoneComputationalLayer } = require('../circuits/redstone_nodes');
const { KedsDeclassifiedBrand } = require('../identity/keds_brand');
const ReputationGates = require('../identity/reputation_gates');
const GravityWell = require('../income/gravity_well');
const ExternalAPIClient = require('../core/external_integrations');
const PerformanceMonitor = require('../core/production_monitor');
const NFTSystem = require('../identity/nft_system');
const ResilienceLayer = require('../core/resilience_layer');
const TwitchDataSovereignty = require('../core/twitch_integration');
const AnalyticsEngine = require('../income/analytics_engine');
const SubscriptionModel = require('../income/subscription_model');
const ApexAdaptation = require('../core/apex_adaptation');
const QuantumEscape = require('../core/quantum_escape');
const StressTester = require('../core/stress_tester');
const EvolutionaryObserver = require('../core/evolutionary_observer');
const envMaster = require('../config/env_master');

// PHASE 2: Slash command system
const SlashCommandSystem = require('./slash_commands');
const SecurityValidator = require('../lib/security_validator');

// ARIEUS Color Palette
const ARIEUS_COLORS = {
  twilight_purple: 0x9B59B6,  // Free tier / Default
  blood_orange: 0xE74C3C,     // Professional / Warnings
  pastel_horror: 0xF8BBD0,    // Success / Starter tier
  neon_cyan: 0x00FFFF,        // Enterprise tier
  dusk_gold: 0xFFD700,        // Owner tier
  void_black: 0x1C1C1C        // Errors
};

class N8KedDiscordBot {
  constructor(options = {}) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel]
    });

    this.identity = options.identity ?? 'n8.ked';
    this.brand = new KedsDeclassifiedBrand();
    this.core = new N8KedCore(options.coreConfig);
    this.circuits = new RedstoneComputationalLayer(this.core);
    this.economyBridge = new CoreMetadataEconomy({ enableAutoStreams: false });
    this.evolution = new TripleHelixEngine(this.core);
    this.commands = new CommandSystem(options.commandPrefix ?? '!');
    this.gameIntegration = new GameIntegration();
    
    // Production systems (Step 9-12)
    this.externalAPI = new ExternalAPIClient();
    this.monitor = new PerformanceMonitor();
    this.nftSystem = new NFTSystem();
    this.resilience = new ResilienceLayer();
    this.resilience.initializeTracking(); // Initialize pattern learning
    
    // Step 13: Data Sovereignty Engine
    this.twitch = new TwitchDataSovereignty(this.resilience);
    this.analytics = new AnalyticsEngine();
    this.subscriptions = new SubscriptionModel();
    
    this.ownerId = options.ownerId || null;

    // PHASE 2: Initialize slash commands and security
    this.security = new SecurityValidator();
    const { db, herald } = require('../database/db_service');
    this.slashCommands = new SlashCommandSystem(
      this.client,
      db,
      herald,
      this.brand.dust,
      this.security
    );

    this.setupCommands();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, async (readyClient) => {
      console.log(`n8.ked online as ${readyClient.user.tag}`);
      console.log(`Bot ID: ${readyClient.user.id}`);
      console.log(`Invite URL: https://discord.com/api/oauth2/authorize?client_id=${readyClient.user.id}&permissions=8&scope=bot`);
      console.log('---');
      console.log('Testing console ping every 10 seconds...');
      
      // PHASE 2: Register slash commands
      try {
        await this.slashCommands.registerCommands();
        console.log('[PHASE_2] ✅ Slash commands registered');
      } catch (error) {
        console.error('[PHASE_2] ❌ Slash command registration failed:', error);
      }
      
      // Console ping to verify bot is running
      setInterval(() => {
        const now = new Date().toLocaleTimeString();
        console.log(`[PING] ${now} - Bot alive | Guilds: ${readyClient.guilds.cache.size} | WS: ${this.client.ws.ping}ms`);
      }, 10000);
      
      // Process expired governance proposals every hour
      setInterval(() => {
        const results = this.brand.dust.processExpiredProposals();
        if (results.length > 0) {
          console.log(`[GOVERNANCE] Processed ${results.length} expired proposals:`, results);
        }
      }, 3600000); // 1 hour
      
      // Update external data every 6 hours (Step 9)
      setInterval(async () => {
        try {
          const waterData = await this.externalAPI.getWaterData();
          if (waterData) {
            const liters = this.externalAPI.convertFlowToLiters(waterData, 21600); // 6 hours in seconds
            this.brand.dust.addWater(liters, `Real-world flow: ${waterData.toFixed(0)} ft³/s`);
            console.log(`[EXTERNAL] Water reserves updated: +${liters.toFixed(0)}L from real flow data`);
          }
        } catch (error) {
          console.error(`[EXTERNAL] Failed to update water data: ${error.message}`);
        }
      }, 21600000); // 6 hours
      
      // Health check every 5 minutes (Step 10)
      setInterval(() => {
        const economyData = {
          balances: this.brand.dust.balances,
          assetReserves: this.brand.dust.assetReserves
        };
        const health = this.monitor.performHealthCheck(economyData);
        
        if (health.overall !== 'healthy') {
          console.log(`[HEALTH] System status: ${health.overall}`);
          Object.entries(health.checks).forEach(([name, check]) => {
            if (check.status !== 'healthy') {
              console.log(`[HEALTH] ${name}: ${check.message}`);
            }
          });
        }
      }, 300000); // 5 minutes
      
      // Automated backup every hour (Step 10)
      setInterval(() => {
        const result = this.monitor.createBackup(this.brand.dust.dataFilePath);
        if (result.success) {
          console.log(`[BACKUP] Automated backup created (${result.count} backups retained)`);
        } else {
          console.error(`[BACKUP] Backup failed: ${result.message}`);
        }
      }, 3600000); // 1 hour
    });

    // PHASE 2: Slash command interaction handler
    this.client.on(Events.InteractionCreate, async (interaction) => {
      try {
        await this.slashCommands.handleInteraction(interaction);
      } catch (error) {
        console.error('[PHASE_2] Interaction error:', error);
      }
    });

    this.client.on(Events.MessageCreate, async (message) => {
      console.log(`[MSG] ${message.author.tag}: ${message.content}`);
      
      if (message.author.bot) {
        console.log('[MSG] Ignored (bot message)');
        return;
      }
      
      // Record command for performance monitoring
      if (message.content.startsWith('!')) {
        this.monitor.recordCommand();
      }

      const commandResult = await this.commands.handle(message);
      if (commandResult !== null) {
        console.log('[CMD] Command handled:', message.content);
        return;
      }

      try {
        const processed = await this.core.processMessage(message);
        const income = await this.economyBridge.process(message);
        const circuitOutput = this.circuits.routeMessage(processed);
        const brandedResponse = this.brand.applyVoice(circuitOutput);

        if (brandedResponse && brandedResponse !== 'silence') {
          await message.reply(brandedResponse);
        }

        this.evolution.considerEvolution(processed, income.income);
      } catch (error) {
        console.error('Error handling message:', error);
        this.monitor.recordError('message_processing');
      }
    });
  }

  setupCommands() {
    // Status check command
    this.commands.register('ping', async (message) => {
      const uptime = Math.floor(this.client.uptime / 1000);
      const circuitCount = Object.keys(this.circuits.circuits || {}).length;
      const status = `🜁 **n8.ked is online**\nUptime: ${uptime}s\nLatency: ${this.client.ws.ping}ms\nCore: Active\nCircuits: ${circuitCount} nodes\nDust Economy: Operational`;
      return message.reply(status);
    });

    // MONETIZATION COMMAND - Quantum Pattern Recognition Sessions
    this.commands.register('consult', async (message) => {
      const consultation = {
        title: '🎯 Quantum Pattern Recognition Session',
        description: '30-min consultation to "see the source code" in your domain',
        investment: '$27',
        booking: 'https://calendly.com/kidseatdemons-voice/30min',
        deliverables: [
          '• Your personalized 7-Observer Framework',
          '• System architecture insights for your domain',
          '• Custom pattern recognition techniques',
          '• Live ghost-network debugging session'
        ]
      };

      const response = `${this.brand.applyVoice('Pattern recognition unlocked.')}\n\n` +
        `**${consultation.title}**\n` +
        `${consultation.description}\n\n` +
        `**Investment:** ${consultation.investment}\n` +
        `**Book Now:** ${consultation.booking}\n\n` +
        `**What You'll Get:**\n${consultation.deliverables.join('\n')}\n\n` +
        `*First 3 bookings get bonus: Custom circuit diagram of your system architecture*`;

      return message.reply(response);
    });

    this.commands.register('declassify', async (message, args) => {
      const text = args.join(' ') || message.content.slice(1);
      const parsed = this.core.observers.input.process({ content: text, authorId: message.author.id });
      const insight = this.core.observers.pattern.findConnections(parsed);
      const income = await this.economyBridge.market.recordInsight(JSON.stringify(insight));
      const formatted = this.brand.formatDeclassification(JSON.stringify(insight), income);
      return message.reply(formatted);
    });

    // TIER-BASED HELP SYSTEM (gamified mystery unlocks)
    this.commands.register('help', async (message, args) => {
      const userId = message.author.id;
      const isOwner = userId === this.ownerId;
      
      // Get user's subscription tier
      let userTier = 'FREE';
      if (!isOwner) {
        const subResult = this.subscriptions.getSubscription(userId);
        if (subResult.success) {
          userTier = subResult.subscription.tier;
        }
      } else {
        userTier = 'OWNER'; // Owner sees everything
      }

      // Category filter (optional arg)
      const category = args[0]?.toLowerCase();

      const embed = await this.generateTieredHelpEmbed(userTier, isOwner, category);
      return message.reply({ embeds: [embed] });
    });

    // STEP 1: Enhanced bite with cooldown - ARIEUS Daily Ritual
    this.commands.register('bite', (message) => {
      const cooldownCheck = this.brand.dust.checkCooldown(message.author.id, 'bite');
      
      if (!cooldownCheck.canAct) {
        const hoursRemaining = Math.floor(cooldownCheck.remainingMs / 3600000);
        const minutesRemaining = Math.floor((cooldownCheck.remainingMs % 3600000) / 60000);
        
        const embed = new EmbedBuilder()
          .setColor(ARIEUS_COLORS.blood_orange)
          .setTitle('🌆 The Void Closes at Dawn')
          .setDescription(`Return to the Twilight District in **${hoursRemaining}h ${minutesRemaining}m** to bite again.`)
          .setFooter({ text: 'Daily ritual resets every 24 hours' });
        
        return message.reply({ embeds: [embed] });
      }
      
      this.brand.dust.setCooldown(message.author.id, 'bite');
      const balance = this.brand.dust.credit(message.author.id, 100, '!bite daily ritual');
      
      // Award reputation for daily ritual
      const repResult = ReputationGates.autoAward.dailyBite(message.author.id);
      
      const embed = new EmbedBuilder()
        .setColor(ARIEUS_COLORS.pastel_horror)
        .setTitle('⚡ You Bite Into the Void at Dusk')
        .setDescription(`**+100 FRAG** collected from the fragments\n\n**Balance:** ${balance.toFixed(2)} ⚡FRAG`)
        .addFields({ name: '📊 Reputation', value: repResult.gatesCrossed.length > 0 
          ? repResult.gatesCrossed.map(g => `🎉 **${g.name}** unlocked!`).join('\n')
          : `+1 Rep (${repResult.current} total)`, inline: false })
        .setFooter({ text: '🌌 The void provides for those who seek it' });
      
      return message.reply({ embeds: [embed] });
    });

    this.commands.register('balance', (message) => {
      const balance = this.brand.getDustBalance(message.author.id);
      const recentTxs = this.brand.dust.getUserTransactions(message.author.id, 3);
      const reputation = ReputationGates.getProgress(message.author.id);
      
      const embed = new EmbedBuilder()
        .setColor(ARIEUS_COLORS.twilight_purple)
        .setTitle(`⚡ FRAG Balance`)
        .setDescription(`**${message.author.username}**\n${balance.toFixed(2)} ⚡FRAG`)
        .addFields({ name: '🏆 Reputation', value: `${reputation.score} (${reputation.tier})`, inline: true });
      
      if (recentTxs.length > 0) {
        const txList = recentTxs.map(tx => {
          const timeAgo = Math.floor((Date.now() - tx.timestamp) / 60000);
          return `• ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)} (${timeAgo}m ago)`;
        }).join('\n');
        embed.addFields({ name: '📋 Recent Activity', value: txList, inline: false });
      }
      
      embed.setFooter({ text: '🌆 Fragments of the void economy' });
      
      return message.reply({ embeds: [embed] });
    });

    // Reputation status command
    this.commands.register('reputation', (message) => {
      const userId = message.author.id;
      const progress = ReputationGates.getProgress(userId);
      
      // Gate symbols
      const gateSymbols = {
        TWILIGHT_DISTRICT: '🌆',
        DEMONS_BAZAAR: '👹',
        GOVERNANCE_CHAMBER: '🗳️',
        VOID_COUNCIL: '⚡'
      };
      
      let response = `${gateSymbols[progress.tier]} **${message.author.username}'s Reputation**\n\n`;
      response += `**Current:** ${progress.current} reputation\n`;
      response += `**Tier:** ${progress.tier.replace(/_/g, ' ')}\n\n`;
      
      if (progress.nextGate) {
        const symbol = gateSymbols[progress.nextGate];
        response += `**Next Gate:** ${symbol} ${progress.nextGate.replace(/_/g, ' ')}\n`;
        response += `**Progress:** ${progress.progress}% (${progress.remaining} needed)\n\n`;
        
        const rewards = ReputationGates.getGateRewards(progress.nextGate);
        response += `**Unlocks at ${progress.nextThreshold}:**\n`;
        rewards.forEach(reward => response += `• ${reward}\n`);
      } else {
        response += `✨ **Maximum reputation achieved!**\nYou have unlocked all gates in ARIEUS.`;
      }
      
      return message.reply(response);
    });

    // Alias
    this.commands.register('rep', (message) => {
      return this.commands.execute('reputation', message, []);
    });

    // Alias for backward compatibility
    this.commands.register('dust', (message) => {
      return this.commands.execute('balance', message, []);
    });

    // Gravity Well status command
    this.commands.register('gravity', (message) => {
      const stats = GravityWell.getStats();
      
      let response = `🌌 **Gravity Well Status**\n\n`;
      response += `**Philosophy:** "The void provides for the broken souls."\n\n`;
      response += `**Accumulated Fees:** ${stats.accumulatedFees.toFixed(2)} ⚡FRAG\n`;
      response += `**Qualifying Users:** ${stats.qualifyingUserCount} users (< ${stats.threshold} FRAG)\n`;
      response += `**Next Distribution:** ${stats.nextDistributionMinutes} minutes\n\n`;
      
      if (stats.qualifyingUserCount > 0) {
        response += `📊 When distributed, FRAG will flow to users below the threshold,\n`;
        response += `with more help going to those with less.\n\n`;
        response += `*Passive economic support - no action required.*`;
      } else {
        response += `✨ All users are above the 100 FRAG threshold!\nThe community thrives.`;
      }
      
      return message.reply(response);
    });

    // STEP 2: Transaction ledger command
    this.commands.register('ledger', (message, args) => {
      const limit = parseInt(args[0]) || 5;
      const recentTxs = this.brand.dust.getRecentTransactions(Math.min(limit, 20));
      
      if (recentTxs.length === 0) {
        return message.reply('📝 No transactions yet.');
      }
      
      let response = `📊 **Recent Dust Transactions** (last ${recentTxs.length})\n\n`;
      
      recentTxs.forEach((tx, index) => {
        const timeAgo = Math.floor((Date.now() - tx.timestamp) / 60000);
        const userId = tx.actorId;
        response += `${index + 1}. <@${userId}> - ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount} dust (${timeAgo}m ago)\n`;
        if (tx.note) response += `   Note: ${tx.note}\n`;
      });
      
      return message.reply(response);
    });

    // STEP 3: Asset reserves command
    this.commands.register('reserves', (message) => {
      const status = this.brand.dust.getReserveStatus();
      const statusEmoji = status.isFullyBacked ? '🟢' : '🟡';
      const statusText = status.isFullyBacked ? 'FULLY BACKED' : 'PARTIALLY BACKED';
      
      const response = `💧 **Asset Reserves Status**\n\n` +
        `**Water Backing:** ${status.waterLiters}L → ${status.backedDust.toFixed(0)} dust\n` +
        `**Dust in Circulation:** ${status.totalDust} dust\n` +
        `**Backing Status:** ${statusEmoji} ${statusText} (${status.coveragePercent.toFixed(1)}%)\n` +
        `**Backing Ratio:** 1L water = ${status.backingRatio} dust\n\n` +
        `${status.isFullyBacked ? '✅ Economy is healthy!' : '⚠️ Add more water reserves to fully back circulation.'}`;
      
      return message.reply(response);
    });

    // STEP 3: Water ledger command
    this.commands.register('water', (message, args) => {
      const limit = parseInt(args[0]) || 5;
      const waterHistory = this.brand.dust.getWaterHistory(Math.min(limit, 10));
      
      if (waterHistory.length === 0) {
        return message.reply('💧 No water added yet. Economy awaiting backing.');
      }
      
      let response = `💧 **Water Addition History** (last ${waterHistory.length})\n\n`;
      
      waterHistory.forEach((addition, index) => {
        const timeAgo = Math.floor((Date.now() - addition.timestamp) / 60000);
        response += `${index + 1}. +${addition.liters}L - ${timeAgo}m ago\n`;
        response += `   Source: ${addition.source}\n`;
        response += `   Total: ${addition.totalWater}L\n`;
      });
      
      return message.reply(response);
    });

    // ADMIN: Add water to reserves (owner only)
    // DEPRECATED: Manual water command removed - water now auto-generates from transaction fees
    // See thermodynamic model in dust_economy.js processTransfer()
    // Formula: 1 FRAG burned = 0.001L water backing (emergent asset reserve)

    // STEP 4: Governance Commands
    this.commands.register('propose', (message, args) => {
      const userId = message.author.id;
      
      // Regular proposals need GOVERNANCE_CHAMBER (500 rep)
      // Treasury proposals need VOID_COUNCIL (1000 rep)
      const isTreasuryProposal = args[0]?.toLowerCase() === 'treasury';
      const requiredGate = isTreasuryProposal ? 'VOID_COUNCIL' : 'GOVERNANCE_CHAMBER';
      
      if (!ReputationGates.hasAccess(userId, requiredGate)) {
        return message.reply(ReputationGates.getAccessDeniedMessage(userId, requiredGate));
      }
      
      if (args.length < 2) {
        return message.reply('❌ Usage: !propose <type> <description>\nTypes: change_ratio, add_feature, economic_policy, treasury');
      }
      
      const proposalType = args[0];
      const description = args.slice(1).join(' ');
      
      // Check if user has enough FRAG
      const userBalance = this.brand.dust.balance(userId);
      if (userBalance < this.brand.dust.PROPOSAL_COST) {
        return message.reply(`❌ Need ${this.brand.dust.PROPOSAL_COST} ⚡FRAG to create a proposal. You have ${userBalance.toFixed(2)}.`);
      }
      
      try {
        // Deduct proposal fee
        this.brand.dust.debit(userId, this.brand.dust.PROPOSAL_COST, `Proposal creation: ${proposalType}`);
        
        // Create proposal
        const proposal = this.brand.dust.createProposal(userId, proposalType, description);
        
        // Award reputation for creating proposal
        ReputationGates.autoAward.createProposal(userId);
        
        const response = `🗳️ **New Proposal Created**\n\n` +
          `**ID:** #${proposal.id}\n` +
          `**Type:** ${proposalType}\n` +
          `**Cost:** ${this.brand.dust.PROPOSAL_COST} ⚡FRAG\n` +
          `**Description:** ${description}\n\n` +
          `**Voting:** Use \`!vote ${proposal.id} yes\` or \`!vote ${proposal.id} no\`\n` +
          `Created by ${message.author.username}\n\n` +
          `+10 Reputation (proposal creation)`;
        
        return message.reply(response);
      } catch (error) {
        return message.reply(`❌ Error: ${error.message}`);
      }
    });

    this.commands.register('vote', (message, args) => {
      const userId = message.author.id;
      
      // Check reputation gate
      if (!ReputationGates.hasAccess(userId, 'GOVERNANCE_CHAMBER')) {
        return message.reply(ReputationGates.getAccessDeniedMessage(userId, 'GOVERNANCE_CHAMBER'));
      }
      
      if (args.length < 2) {
        return message.reply('❌ Usage: !vote <proposal_id> <yes/no>');
      }
      
      const proposalId = parseInt(args[0]);
      const voteChoice = args[1].toLowerCase();
      
      try {
        const result = this.brand.dust.castVote(proposalId, userId, voteChoice);
        
        // Award reputation for voting
        ReputationGates.autoAward.voteProposal(userId);
        
        const response = `🗳️ **Vote Cast**\n\n` +
          `**Proposal:** #${proposalId}\n` +
          `**Your Vote:** ${voteChoice.toUpperCase()}\n` +
          `**Voting Power:** ${result.votingPower} ⚡FRAG\n` +
          `**Total Voted:** ${result.totalVoted} ⚡FRAG\n\n` +
          `Current results:\n✅ Yes: ${result.proposal.votes.yes} ⚡FRAG\n❌ No: ${result.proposal.votes.no} ⚡FRAG\n\n` +
          `+3 Reputation (governance participation)`;
        
        return message.reply(response);
      } catch (error) {
        return message.reply(`❌ ${error.message}`);
      }
    });

    this.commands.register('proposals', (message, args) => {
      const status = args[0]?.toLowerCase() || 'active';
      
      let proposals;
      let title;
      
      if (status === 'active') {
        proposals = this.brand.dust.getActiveProposals();
        title = '🗳️ Active Proposals';
      } else {
        proposals = this.brand.dust.getRecentProposals(5);
        title = '🗳️ Recent Proposals';
      }
      
      if (proposals.length === 0) {
        return message.reply('📝 No proposals found.');
      }
      
      let response = `${title}\n\n`;
      
      proposals.slice(0, 3).forEach(proposal => {
        const timeAgo = Math.floor((Date.now() - proposal.createdAt) / 3600000);
        const totalVotes = proposal.votes.yes + proposal.votes.no;
        const yesPct = totalVotes > 0 ? (proposal.votes.yes / totalVotes * 100).toFixed(1) : 0;
        const noPct = totalVotes > 0 ? (proposal.votes.no / totalVotes * 100).toFixed(1) : 0;
        
        response += `**#${proposal.id} - ${proposal.proposalType}** (${timeAgo}h ago)\n`;
        response += `${proposal.description}\n`;
        response += `Status: ${proposal.status}\n`;
        response += `✅ ${yesPct}% | ❌ ${noPct}%\n`;
        response += `\`!vote ${proposal.id} [yes/no]\`\n\n`;
      });
      
      return message.reply(response);
    });

    // STEP 5: Monetization Bridge Commands
    this.commands.register('redeem', (message, args) => {
      if (args.length < 1) {
        return message.reply('❌ Usage: !redeem <offer_type>\nUse `!offers` to see available redemptions.');
      }
      
      const offerType = args[0].toLowerCase();
      const userId = message.author.id;
      
      try {
        const offer = this.brand.dust.getRedemptionOffer(offerType);
        if (!offer) {
          const available = Object.keys(this.brand.dust.redemptionOffers).join(', ');
          return message.reply(`❌ Offer not found. Available: ${available}`);
        }
        
        const redemption = this.brand.dust.processRedemption(userId, offerType);
        const newBalance = this.brand.dust.balance(userId);
        
        const response = `💰 **Redemption Successful!**\n\n` +
          `**Offer:** ${offer.name}\n` +
          `**Cost:** ${offer.dustCost} dust\n` +
          `**Value:** $${offer.realValue.toFixed(2)} USD\n` +
          `**New Balance:** ${newBalance} dust\n\n` +
          `**Next Steps:** DM <@${process.env.OWNER_ID}> to arrange payment/delivery!\n` +
          `Redemption ID: ${redemption.timestamp}`;
        
        return message.reply(response);
      } catch (error) {
        return message.reply(`❌ ${error.message}`);
      }
    });

    this.commands.register('offers', (message) => {
      const offers = this.brand.dust.getAllOffers();
      
      let response = `🛍️ **Redeem Dust for Real Value**\n\n`;
      
      for (const [offerId, offer] of Object.entries(offers)) {
        response += `**${offer.name}** - $${offer.realValue.toFixed(2)}\n`;
        response += `${offer.dustCost} dust - ${offer.description}\n`;
        response += `\`!redeem ${offerId}\`\n\n`;
      }
      
      response += `💎 Your dust now has REAL purchasing power!`;
      
      return message.reply(response);
    });

    this.commands.register('economy', (message) => {
      const status = this.brand.dust.getEconomyStatus();
      const statusEmoji = status.isHealthy ? '🟢' : '🟡';
      const statusText = status.isHealthy ? 'HEALTHY' : 'GROWING';
      
      const response = `🌐 **n8.ked Economy Status**\n\n` +
        `**💰 Total Dust:** ${status.totalDust} in circulation\n` +
        `**👥 Active Users:** ${status.totalUsers} economic entities\n` +
        `**💧 Asset Backing:** ${status.backedDust.toFixed(0)} dust backed (${status.coveragePercent.toFixed(1)}%)\n\n` +
        `**💎 Potential Value:** $${status.potentialValueUSD.toFixed(2)} USD\n` +
        `**🏦 Redemption Offers:** ${status.totalRedemptionOffers} available\n` +
        `**🗳️ Governance:** ${status.totalProposals} total proposals (${status.activeProposals} active)\n` +
        `**📦 Total Redemptions:** ${status.totalRedemptions}\n\n` +
        `**📈 System Status:** ${statusEmoji} ${statusText}`;
      
      return message.reply(response);
    });

    // STEP 7 & 8: Transfer with burn mechanics
    this.commands.register('transfer', (message, args) => {
      if (args.length < 2) {
        return message.reply('❌ Usage: !transfer @user <amount>');
      }
      
      const userId = message.author.id;
      const recipientMention = args[0];
      const amount = parseFloat(args[1]);
      
      // Extract recipient ID from mention
      const recipientMatch = recipientMention.match(/^<@!?(\d+)>$/);
      if (!recipientMatch) {
        return message.reply('❌ Please mention a valid user');
      }
      const recipientId = recipientMatch[1];
      
      // Rate limit check
      const rateLimit = this.brand.dust.checkRateLimit(userId, 'transfer');
      if (!rateLimit.allowed) {
        this.brand.dust.logSecurityEvent('rate_limit_exceeded', userId, 'transfer command', 'medium');
        const minutesRemaining = Math.ceil(rateLimit.resetIn / 60000);
        return message.reply(`🚫 Transfer limit reached. Try again in ${minutesRemaining} minutes.`);
      }
      
      try {
        // Check if user has VOID_COUNCIL status (0% fees)
        const hasVoidCouncil = ReputationGates.hasAccess(userId, 'VOID_COUNCIL');
        
        const result = this.brand.dust.processTransfer(userId, recipientId, amount, hasVoidCouncil);
        
        const embed = new EmbedBuilder()
          .setColor(ARIEUS_COLORS.pastel_horror)
          .setTitle('✅ Transfer Complete')
          .setDescription(`**To:** <@${recipientId}>`)
          .addFields(
            { name: '📤 Sent', value: `${amount.toFixed(2)} ⚡FRAG`, inline: true },
            { name: '📥 Received', value: `${result.netTransfer.toFixed(2)} ⚡FRAG`, inline: true }
          );
        
        if (hasVoidCouncil) {
          embed.addFields({ name: '⚡ Void Council', value: '0% fee (privilege)', inline: false });
        } else {
          embed.addFields({ name: '🔥 Burned', value: `${result.burnAmount.toFixed(2)} ⚡FRAG (${(this.brand.dust.DUST_BURN_RATE * 100)}%)`, inline: true });
          
          // Feed Gravity Well with 1% of burned fees
          if (result.burnAmount > 0) {
            const gravityShare = GravityWell.captureFees(result.burnAmount);
            embed.addFields({ name: '🌌 Gravity Well', value: `${gravityShare.toFixed(4)} ⚡FRAG contributed`, inline: false });
          }
        }
        
        embed.setFooter({ text: '💧 Transaction heat generates water backing' });
        
        return message.reply({ embeds: [embed] });
      } catch (error) {
        this.brand.dust.logSecurityEvent('transfer_failed', userId, error.message, 'low');
        
        const errorEmbed = new EmbedBuilder()
          .setColor(ARIEUS_COLORS.void_black)
          .setTitle('❌ Transfer Failed')
          .setDescription(error.message)
          .setFooter({ text: '🌑 The void rejects this transaction' });
        
        return message.reply({ embeds: [errorEmbed] });
      }
    });

    // STEP 8: Staking commands
    this.commands.register('stake', (message, args) => {
      if (args.length < 1) {
        return message.reply('❌ Usage: !stake <amount>');
      }
      
      const userId = message.author.id;
      const amount = parseFloat(args[0]);
      
      try {
        const stakeInfo = this.brand.dust.stake(userId, amount);
        
        const response = `🔒 **Staked Successfully**\n\n` +
          `**Amount:** ${amount} dust\n` +
          `**Total Staked:** ${stakeInfo.amount} dust\n` +
          `**APR:** ${(this.brand.dust.STAKE_APR * 100)}%\n` +
          `**Expected Annual Yield:** ${(stakeInfo.amount * this.brand.dust.STAKE_APR).toFixed(2)} dust\n\n` +
          `Use \`!unstake <amount>\` to withdraw`;
        
        return message.reply(response);
      } catch (error) {
        return message.reply(`❌ ${error.message}`);
      }
    });

    this.commands.register('unstake', (message, args) => {
      if (args.length < 1) {
        return message.reply('❌ Usage: !unstake <amount>');
      }
      
      const userId = message.author.id;
      const amount = parseFloat(args[0]);
      
      try {
        const result = this.brand.dust.unstake(userId, amount);
        
        const response = `🔓 **Unstaked from ARIEUS**\n\n` +
          `**Principal:** ${amount.toFixed(2)} ⚡FRAG\n` +
          `**10% Exit Fee:** -${result.fee.toFixed(2)} ⚡FRAG → Treasury\n` +
          `**Net Principal:** ${result.amount.toFixed(2)} ⚡FRAG\n` +
          `**Yield Earned:** +${result.yield.toFixed(2)} ⚡FRAG\n` +
          `**Total Returned:** ${(result.amount + result.yield).toFixed(2)} ⚡FRAG`;
        
        return message.reply(response);
      } catch (error) {
        return message.reply(`❌ ${error.message}`);
      }
    });

    this.commands.register('stakeinfo', (message) => {
      const userId = message.author.id;
      const info = this.brand.dust.getStakeInfo(userId);
      
      if (info.staked === 0) {
        return message.reply('You have no active stakes. Use `!stake <amount>` to start earning yield!');
      }
      
      const response = `🔒 **Your Staking Info**\n\n` +
        `**Staked Amount:** ${info.staked} dust\n` +
        `**Pending Yield:** ${info.pendingYield.toFixed(2)} dust\n` +
        `**Stake Duration:** ${info.stakeDays.toFixed(1)} days\n` +
        `**APR:** ${(info.apr * 100)}%\n\n` +
        `Use \`!unstake <amount>\` to withdraw`;
      
      return message.reply(response);
    });

    // STEP 8: Advanced economics dashboard
    this.commands.register('economics', (message) => {
      const stats = this.brand.dust.getAdvancedEconomicStats();
      
      const response = `📊 **Advanced Economics Dashboard**\n\n` +
        `**Supply Metrics:**\n` +
        `• Total Supply: ${stats.totalSupply.toFixed(0)} dust\n` +
        `• Circulating: ${stats.circulatingSupply.toFixed(0)} dust\n` +
        `• Staked: ${stats.totalStaked.toFixed(0)} dust (${(stats.stakingRatio * 100).toFixed(1)}%)\n\n` +
        `**Economic Policies:**\n` +
        `• Inflation Rate: ${(stats.inflationRate * 100)}% APR\n` +
        `• Staking APR: ${(stats.stakingAPR * 100)}%\n` +
        `• Burn Rate: ${(stats.burnRate * 100)}% per transfer\n\n` +
        `**Activity Metrics:**\n` +
        `• Economic Velocity: ${stats.economicVelocity} tx/hour\n` +
        `• Active Stakers: ${stats.activeStakers}\n` +
        `• 24h Burn: ${stats.recentBurn24h.toFixed(2)} dust`;
      
      return message.reply(response);
    });

    // STEP 6: Data management commands (owner only)
    this.commands.register('save', (message) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('🔒 Owner only');
      }
      
      const success = this.brand.dust.saveData();
      const stats = this.brand.dust.getDataFileStats();
      
      if (success) {
        return message.reply(`💾 Economy data saved! File size: ${(stats.size / 1024).toFixed(2)} KB`);
      } else {
        return message.reply('❌ Failed to save data');
      }
    });

    this.commands.register('datastats', (message) => {
      const stats = this.brand.dust.getDataFileStats();
      
      if (!stats.exists) {
        return message.reply('📂 No data file exists yet');
      }
      
      const lastMod = new Date(stats.lastModified).toLocaleString();
      const response = `📊 **Data File Statistics**\n\n` +
        `**File Size:** ${(stats.size / 1024).toFixed(2)} KB\n` +
        `**Last Modified:** ${lastMod}\n` +
        `**Auto-Save:** ✅ Enabled`;
      
      return message.reply(response);
    });

    // STEP 7: Security audit (owner only)
    this.commands.register('security', (message, args) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('🔒 Owner only');
      }
      
      const limit = parseInt(args[0]) || 5;
      const events = this.brand.dust.getSecurityEvents(limit);
      
      if (events.length === 0) {
        return message.reply('🔒 No security events recorded');
      }
      
      let response = `🔍 **Security Audit Log** (last ${events.length})\n\n`;
      
      events.forEach((event, index) => {
        const timeAgo = Math.floor((Date.now() - event.timestamp) / 60000);
        response += `${index + 1}. [${event.severity.toUpperCase()}] ${event.type}\n`;
        response += `   User: <@${event.actorId}> (${timeAgo}m ago)\n`;
        response += `   ${event.details}\n\n`;
      });
      
      return message.reply(response);
    });

    this.commands.register('evolve', async (message) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('Only the overseer can force evolution.');
      }
      const evolution = this.evolution.triggerEvolutionaryLeap();
      return message.reply(`🔬 **Evolutionary Leap Activated**\n${evolution.results}`);
    });

    this.commands.register('metaphor', (message, args) => {
      if (!args.length) {
        return message.reply('Feed me something to bend.');
      }
      const parsed = this.core.observers.input.process({ content: args.join(' '), authorId: message.author.id });
      const insight = this.core.observers.pattern.findConnections(parsed);
      return message.reply(`Metaphor bank pinged: ${insight.metaphoricalHints.join(', ') || 'none yet.'}`);
    });

    this.commands.register('income', async (message) => {
      const stats = this.economyBridge.getIncomeReport();
      return message.reply(
        `💰 **n8.ked Income Report**\nImmediate: $${stats.immediate.toFixed(2)}\nAssets: $${stats.assets.toFixed(2)}\nReinvested: $${stats.reinvested.toFixed(2)}\nTotal Value: $${stats.total.toFixed(2)}`
      );
    });
    
    // ============ STEP 9: EXTERNAL INTEGRATIONS ============
    
    this.commands.register('realworld', async (message) => {
      const status = await this.resilience.executeWithCircuitBreaker(
        'realworld_data',
        async () => await this.externalAPI.getRealWorldStatus(),
        () => this.resilience.getFallbackData('realworld_data', {
          water: { status: 'cached', flow: 0, impact: 1.0 },
          weather: { status: 'cached', temp: 0, impact: 1.0 },
          lastUpdate: Date.now()
        })
      );
      
      let response = `🌍 **Real-World Economic Impact**\n\n`;
      
      // Water data
      if (status.water.flow) {
        response += `💧 **Real Water Flow**\n`;
        response += `Flow: ${status.water.flow.toFixed(0)} ft³/s\n`;
        response += `Economic Impact: ${status.water.impact.toFixed(2)}x\n`;
        response += `Status: ✅ ${status.water.status}\n\n`;
      } else {
        response += `💧 **Water Data:** ❌ ${status.water.status}\n\n`;
      }
      
      // Weather data
      if (status.weather.data) {
        const w = status.weather.data;
        response += `🌤️ **Weather Impact**\n`;
        response += `Temperature: ${w.temperature_2m}°C\n`;
        response += `Rain: ${w.rain || 0}mm\n`;
        response += `Activity Modifier: ${status.weather.impact.toFixed(2)}x\n`;
        response += `Status: ✅ ${status.weather.status}\n\n`;
      } else {
        response += `🌤️ **Weather:** ❌ ${status.weather.status}\n\n`;
      }
      
      response += `🔌 **External Services:** ${status.activeServices}/${status.totalServices} active\n`;
      response += `🕒 **Last Update:** ${new Date(status.lastUpdate).toLocaleTimeString()}`;
      
      return message.reply(response);
    });
    
    this.commands.register('services', async (message) => {
      const status = await this.resilience.executeWithCircuitBreaker(
        'external_api_status',
        async () => await this.externalAPI.getRealWorldStatus(),
        () => ({ water: { status: 'unavailable' }, weather: { status: 'unavailable' }, lastUpdate: Date.now() })
      );
      const config = this.externalAPI.serviceConfig;
      
      let response = `🔌 **External Services Status**\n\n`;
      
      Object.entries(config).forEach(([name, cfg]) => {
        const statusIcon = cfg.enabled ? '✅ Enabled' : '❌ Disabled';
        response += `**${name.toUpperCase()}:** ${statusIcon}\n`;
      });
      
      response += `\n🌊 **Water API:** ${status.water.status === 'connected' ? '✅ Connected' : '❌ Offline'}\n`;
      response += `🌤️ **Weather API:** ${status.weather.status === 'connected' ? '✅ Connected' : '❌ Offline'}\n`;
      response += `\n🕒 **Last Update:** ${new Date(status.lastUpdate).toLocaleTimeString()}`;
      
      return message.reply(response);
    });
    
    this.commands.register('connect_wallet', (message, args) => {
      const walletAddress = args[0];
      if (!walletAddress) {
        return message.reply('❌ Provide wallet address: `!connect_wallet 0x...`');
      }
      
      let response = `🔗 **Wallet Connection**\n\n`;
      response += `**Status:** 🟡 Coming Soon\n`;
      response += `**Your Address:** \`${walletAddress.slice(0, 10)}...\`\n`;
      response += `**Future Features:**\n`;
      response += `• Direct crypto payments\n`;
      response += `• On-chain governance\n`;
      response += `• Cross-chain dust`;
      
      return message.reply(response);
    });
    
    this.commands.register('setup_payments', (message) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('🔒 Owner only');
      }
      
      let response = `💳 **Payment Integration Setup**\n\n`;
      response += `**Stripe Integration:**\n`;
      response += `\`\`\`\nSTRIPE_API_KEY=sk_live_...\nSTRIPE_WEBHOOK_SECRET=whsec_...\n\`\`\`\n\n`;
      response += `**Coinbase Commerce:**\n`;
      response += `\`\`\`\nCOINBASE_API_KEY=...\nCOINBASE_WEBHOOK_SECRET=...\n\`\`\`\n\n`;
      response += `**Next Steps:**\n`;
      response += `1. Set up Stripe/Coinbase accounts\n`;
      response += `2. Add API keys to environment\n`;
      response += `3. Configure webhooks\n`;
      response += `4. Enable in service config`;
      
      return message.reply(response);
    });
    
    // ============ STEP 10: PRODUCTION MONITORING ============
    
    this.commands.register('production', (message) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('🔒 Owner only');
      }
      
      const economyData = {
        balances: this.brand.dust.balances,
        assetReserves: this.brand.dust.assetReserves
      };
      const metrics = this.monitor.getProductionMetrics(economyData);
      
      let response = `🏭 **Production System Dashboard**\n\n`;
      response += `**Uptime:** ${metrics.uptime.formatted}\n`;
      response += `**Memory:** ${metrics.system.memory.rss}MB RSS\n`;
      response += `**CPU:** User ${metrics.system.cpu.user}ms | System ${metrics.system.cpu.system}ms\n`;
      response += `**Node:** ${metrics.system.nodeVersion} | PID: ${metrics.system.pid}\n\n`;
      
      response += `**Performance:**\n`;
      response += `Total Commands: ${metrics.performance.commandsTotal}\n`;
      response += `Commands/min: ${metrics.performance.commandsPerMinute}\n`;
      response += `Commands/hour: ${metrics.performance.commandsPerHour}\n`;
      response += `Total Errors: ${metrics.performance.errorsTotal}\n\n`;
      
      response += `**Economy:**\n`;
      response += `Users: ${metrics.economy.users}\n`;
      response += `Total Dust: ${metrics.economy.totalDust}\n`;
      response += `Backed: ${metrics.economy.backed} dust\n\n`;
      
      response += `**Health:** ${metrics.health === 'healthy' ? '✅' : metrics.health === 'degraded' ? '⚠️' : '🚨'} ${metrics.health}`;
      
      return message.reply(response);
    });
    
    this.commands.register('health', (message) => {
      const economyData = {
        balances: this.brand.dust.balances,
        assetReserves: this.brand.dust.assetReserves
      };
      const health = this.monitor.performHealthCheck(economyData);
      
      let response = `🏥 **Health Check Report**\n\n`;
      response += `**Overall Status:** ${health.overall === 'healthy' ? '✅' : health.overall === 'degraded' ? '⚠️' : '🚨'} ${health.overall.toUpperCase()}\n\n`;
      
      Object.entries(health.checks).forEach(([name, check]) => {
        const icon = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '🚨';
        response += `${icon} **${name}:** ${check.message}\n`;
      });
      
      return message.reply(response);
    });
    
    this.commands.register('backup', (message) => {
      if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('🔒 Owner only');
      }
      
      const result = this.monitor.createBackup(this.brand.dust.dataFilePath);
      
      if (result.success) {
        return message.reply(`💾 **Backup Created**\n\nFile: \`${result.file}\`\nBackups Retained: ${result.count}`);
      } else {
        return message.reply(`❌ **Backup Failed**\n\n${result.message}`);
      }
    });

    // ============ STEP 12: QUANTUM RESILIENCE (Enhanced) ============
    
    this.commands.register('circuit_status', async (message) => {
      await this.handleCircuitStatus(message);
    });

    this.commands.register('system_health', async (message) => {
      await this.handleSystemHealth(message);
    });

    this.commands.register('force_recovery', async (message) => {
      await this.handleForceRecovery(message);
    });

    // New Step 12 commands (Task 5)
    this.commands.register('system_evolution', async (message) => {
      const args = message.content.split(' ').slice(1);
      const days = parseInt(args[0]) || 30;
      
      const evolution = this.resilience.getEvolutionMetrics(days);
      
      if (evolution.trend === 'error') {
        return message.reply(`❌ Failed to retrieve evolution metrics: ${evolution.error}`);
      }
      
      if (evolution.metrics.length === 0) {
        return message.reply('📊 No resilience data available yet. System is just getting started!');
      }
      
      let response = `📈 **System Evolution (Last ${days} Days)**\n\n`;
      response += `**Trend:** ${evolution.trend === 'improving' ? '✅ IMPROVING' : evolution.trend === 'degrading' ? '⚠️ DEGRADING' : '➡️ STABLE'}\n\n`;
      
      if (evolution.recentFailureRate) {
        response += `**Recent Failure Rate:** ${evolution.recentFailureRate}/day\n`;
        response += `**Historical Failure Rate:** ${evolution.olderFailureRate}/day\n\n`;
      }
      
      response += `**Daily Breakdown (Last 7 Days):**\n`;
      const recent = evolution.metrics.slice(-7);
      recent.forEach(day => {
        const successRate = day.successful_heals > 0 ? ((day.successful_heals / day.total_events) * 100).toFixed(0) : 0;
        response += `\`${day.date}\`: ${day.failures} failures, ${day.successful_heals} heals (${successRate}% success)\n`;
      });
      
      message.reply(response);
    });

    this.commands.register('deploy_resilience', async (message) => {
      if (message.author.id !== this.ownerId) {
        return message.reply('❌ Only the bot owner can toggle resilience features.');
      }
      
      const args = message.content.split(' ').slice(1);
      if (args.length < 2) {
        return message.reply(
          '**Usage:** `!deploy_resilience <feature> <on|off>`\n\n' +
          '**Available Features:**\n' +
          '• `selfHealing` - Automatic recovery from failures\n' +
          '• `circuitBreakers` - Prevent cascade failures\n' +
          '• `patternLearning` - Learn from successful recoveries\n' +
          '• `fallbackCache` - Serve cached data when APIs fail\n\n' +
          '**Example:** `!deploy_resilience selfHealing on`'
        );
      }
      
      const feature = args[0];
      const action = args[1].toLowerCase();
      const enabled = action === 'on' || action === 'true' || action === 'enable';
      
      const result = this.resilience.toggleFeature(feature, enabled);
      
      if (result.success) {
        message.reply(`✅ **${feature}** ${enabled ? 'ENABLED' : 'DISABLED'}\n\nResilience configuration updated.`);
      } else {
        message.reply(`❌ ${result.error}\n\nUse \`!deploy_resilience\` without args to see available features.`);
      }
    });

    this.commands.register('quantum_health', async (message) => {
      const integrity = this.resilience.calculateIntegrityScore();
      
      let response = '🏥 **Quantum Health Report**\n\n';
      response += `**Architecture Integrity:** ${integrity.score.toFixed(1)}% (Grade: ${integrity.grade})\n\n`;
      
      response += '**Health Factors:**\n';
      integrity.factors.forEach(factor => {
        const percentage = ((factor.score / factor.max) * 100).toFixed(0);
        const bar = this.generateHealthBar(percentage);
        response += `${bar} **${factor.name}**\n`;
        response += `   ${factor.score.toFixed(1)}/${factor.max} points - ${factor.details}\n\n`;
      });
      
      // Add recommendations
      if (integrity.score < 80) {
        response += '⚠️ **Recommendations:**\n';
        if (integrity.score < 60) {
          response += '• CRITICAL: Immediate attention required\n';
          response += '• Run `!force_recovery` on failing services\n';
          response += '• Check `!circuit_status` for open circuits\n';
        } else if (integrity.score < 80) {
          response += '• Review recent errors with `!system_evolution`\n';
          response += '• Consider deploying additional resilience features\n';
        }
      } else {
        response += '✅ **System is healthy!** All resilience metrics within acceptable ranges.';
      }
      
      message.reply(response);
    });

    // ============ ENVIRONMENT MANAGEMENT (Task 4) ============
    
    this.commands.register('env_status', async (message) => {
      const statusMessage = envMaster.formatStatusForDiscord();
      message.reply(statusMessage);
    });

    this.commands.register('setup_env', async (message) => {
      if (message.author.id !== this.ownerId) {
        return message.reply('❌ Only the bot owner can run environment setup.');
      }
      
      const result = envMaster.generateTemplate();
      
      if (result) {
        message.reply(
          '✅ **Environment Setup Complete!**\n\n' +
          '📋 Created `.env.template` with all required configuration.\n\n' +
          '**Next Steps:**\n' +
          '1. Copy `.env.template` to `.env`\n' +
          '2. Fill in your API credentials:\n' +
          '   • DISCORD_TOKEN\n' +
          '   • DISCORD_CLIENT_ID\n' +
          '   • TWITCH_CLIENT_ID\n' +
          '   • TWITCH_CLIENT_SECRET\n' +
          '3. Run `!env_status` to validate\n' +
          '4. Never commit `.env` to git!\n\n' +
          '🔒 Security: All sensitive values are already in .gitignore'
        );
      } else {
        message.reply('❌ Failed to generate environment template. Check logs.');
      }
    });

    this.commands.register('env_help', async (message) => {
      const response = 
        '🔐 **Environment Management Help**\n\n' +
        '**Commands:**\n' +
        '`!env_status` - Check current environment configuration and security\n' +
        '`!setup_env` - Generate .env template (owner only)\n' +
        '`!env_help` - Show this help message\n\n' +
        '**Configuration:**\n' +
        'The bot requires several API keys to function:\n' +
        '• **Discord** - Bot token and client ID\n' +
        '• **Twitch** - Client ID and secret for analytics\n' +
        '• **External APIs** - USGS, Weather (optional)\n' +
        '• **Multi-Platform** - YouTube, Twitter, Reddit (Step 13)\n\n' +
        '**Security Features:**\n' +
        '✅ Hardcoded secret scanner\n' +
        '✅ Pattern validation for API keys\n' +
        '✅ Environment health monitoring\n' +
        '✅ .env file backup system\n\n' +
        '**Getting Started:**\n' +
        '1. Run `!setup_env` to generate template\n' +
        '2. Configure your `.env` file\n' +
        '3. Use `!env_status` to verify setup\n\n' +
        '🔒 Never share your `.env` file or commit it to version control!';
      
      message.reply(response);
    });

    // ============ STEP 13: TWITCH DATA SOVEREIGNTY ============
    
    this.commands.register('twitch_connect', async (message) => {
      const args = message.content.split(' ').slice(1);
      
      if (args.length === 0) {
        return message.reply(
          '📺 **Connect Your Twitch Account**\n\n' +
          'Usage: `!twitch_connect <your_twitch_username>`\n\n' +
          'This links your Twitch channel to your Discord account and starts tracking analytics.\n\n' +
          '**Free Tier Includes:**\n' +
          '• Basic stream stats (viewers, peak, average)\n' +
          '• Simple chat metrics\n' +
          '• 7 days of history\n\n' +
          '**Upgrade to Pro ($10/mo) for:**\n' +
          '• Growth forecasting\n' +
          '• Revenue predictions\n' +
          '• Content strategy recommendations\n' +
          '• Unlimited history'
        );
      }
      
      const twitchUsername = args[0].toLowerCase().replace('@', '');
      
      const trackResult = await this.twitch.trackStreamer(twitchUsername);
      
      if (!trackResult.success) {
        return message.reply(`❌ ${trackResult.message}`);
      }
      
      const linkResult = this.subscriptions.linkStreamerAccount(
        message.author.id,
        trackResult.streamer.id,
        trackResult.streamer.display_name
      );
      
      if (!linkResult.success) {
        return message.reply(`❌ ${linkResult.message}`);
      }
      
      return message.reply(
        `✅ **Twitch Account Connected**\n\n` +
        `Streamer: **${trackResult.streamer.display_name}**\n` +
        `Tier: **${linkResult.tier.toUpperCase()}**\n\n` +
        `📊 Use \`!analytics\` to view your stream insights!\n` +
        `💰 Use \`!subscribe pro\` to unlock advanced analytics ($10/mo)`
      );
    });
    
    this.commands.register('analytics', async (message) => {
      const args = message.content.split(' ').slice(1);
      const targetUsername = args[0] ? args[0].toLowerCase().replace('@', '') : null;
      
      // Get subscription info
      const subInfo = this.subscriptions.getSubscriptionInfo(message.author.id);
      
      if (subInfo.linkedStreamers.length === 0 && !targetUsername) {
        return message.reply(
          '❌ **No Twitch Account Linked**\n\n' +
          'Use `!twitch_connect <username>` to link your Twitch account first.'
        );
      }
      
      // Determine which streamer to analyze
      let streamerId;
      
      if (targetUsername) {
        // Lookup by username
        const tracked = this.twitch.getTrackedStreamers();
        const found = tracked.find(s => s.name.toLowerCase() === targetUsername);
        
        if (!found) {
          return message.reply(
            `❌ **Streamer Not Tracked**\n\n` +
            `${targetUsername} is not being tracked yet. Use \`!twitch_connect ${targetUsername}\` first.`
          );
        }
        
        streamerId = found.id;
      } else {
        // Use first linked streamer
        streamerId = subInfo.linkedStreamers[0].twitchStreamerId;
      }
      
      // Generate insights
      const twitchInsights = await this.twitch.generateStreamInsights(streamerId);
      
      if (twitchInsights.error) {
        return message.reply(`❌ ${twitchInsights.error}`);
      }
      
      // Simulate some chat activity for demo (remove in production)
      this.twitch.simulateChatActivity(streamerId, 50);
      
      // Get appropriate analytics based on tier
      let analyticsReport;
      
      if (subInfo.tier === 'pro') {
        // Generate historical data simulation for demo
        const historicalData = this.generateSimulatedHistory(twitchInsights.viewerMetrics.average);
        analyticsReport = this.analytics.generateProReport(streamerId, twitchInsights, historicalData);
      } else {
        analyticsReport = this.analytics.generateBasicReport(streamerId, twitchInsights);
      }
      
      // Format response based on tier
      if (analyticsReport.tier === 'FREE') {
        return message.reply(
          `📊 **${analyticsReport.streamer} Analytics** (FREE Tier)\n\n` +
          `**Current Stream:**\n` +
          `Viewers: ${analyticsReport.currentStats.viewers} (Peak: ${analyticsReport.currentStats.peakViewers})\n` +
          `Chat: ${analyticsReport.currentStats.chatters} chatters, ${analyticsReport.currentStats.messages} messages\n\n` +
          `**Simple Metrics:**\n` +
          `Average Viewers: ${analyticsReport.simpleMetrics.averageViewers}\n` +
          `Engagement: ${analyticsReport.simpleMetrics.chatEngagement}\n` +
          `Sentiment: ${analyticsReport.simpleMetrics.overallSentiment}\n\n` +
          `🔒 **${analyticsReport.upgradePrompt.message}**\n` +
          `${analyticsReport.upgradePrompt.action}`
        );
      } else {
        // PRO tier response
        const growth = analyticsReport.growthMetrics;
        const engage = analyticsReport.engagement;
        const revenue = analyticsReport.monetization;
        
        return message.reply(
          `📊 **${analyticsReport.streamer} Analytics** (PRO Tier) ✨\n\n` +
          `**Growth Intelligence:**\n` +
          `Trajectory: ${growth.trajectory}\n` +
          `Weekly: ${growth.weeklyGrowth} | Monthly: ${growth.monthlyGrowth}\n` +
          `30-Day Forecast: ${growth.projectedViewers30d} viewers (${growth.confidence} confidence)\n\n` +
          `**Engagement Optimization:**\n` +
          `Current: ${engage.current.toFixed(1)}% | Target: ${engage.optimal}\n` +
          `Improvement Potential: ${engage.gap}\n` +
          `💡 ${engage.actionItems[0]}\n\n` +
          `**Revenue Forecasting:**\n` +
          `Estimated: ${revenue.estimatedMonthlyRevenue}\n` +
          `Potential: ${revenue.potentialRevenue}\n` +
          `Opportunity: ${revenue.revenueGap}\n\n` +
          `**Market Position:** ${analyticsReport.marketPosition.percentile}\n` +
          `**Strengths:** ${analyticsReport.marketPosition.strengthAreas.join(', ')}\n\n` +
          `Use \`!streamer_stats\` for detailed content strategy!`
        );
      }
    });
    
    this.commands.register('subscribe', async (message) => {
      const args = message.content.split(' ').slice(1);
      
      if (args.length === 0) {
        const subInfo = this.subscriptions.getSubscriptionInfo(message.author.id);
        
        return message.reply(
          `💳 **Your Subscription**\n\n` +
          `Current Tier: **${subInfo.tier.toUpperCase()}**\n` +
          `Linked Streamers: ${subInfo.linkedStreamers.length}\n` +
          `${subInfo.nextBilling ? `Next Billing: ${subInfo.nextBilling}` : ''}\n\n` +
          `**Available Tiers:**\n` +
          `• FREE - Basic features\n` +
          `• STARTER ($49/mo) - Individual streamers\n` +
          `• PROFESSIONAL ($199/mo) - Growing brands\n` +
          `• ENTERPRISE ($999/mo) - White-label licensing\n\n` +
          `**Commands:**\n` +
          `\`!subscribe <tier>\` - Upgrade to paid tier\n` +
          `\`!subscribe info\` - View detailed features\n` +
          `\`!pricing\` - See full pricing comparison`
        );
      }
      
      const action = args[0].toLowerCase();
      
      if (action === 'info' || action === 'pricing') {
        return message.reply(
          `💰 **Enterprise Subscription Tiers**\n\n` +
          `**FREE** - $0/month\n` +
          `${this.subscriptions.tiers.free.features.slice(0, 3).join('\n')}\n\n` +
          `**STARTER** - $49/month\n` +
          `${this.subscriptions.tiers.starter.features.slice(0, 4).join('\n')}\n\n` +
          `**PROFESSIONAL** - $199/month\n` +
          `${this.subscriptions.tiers.professional.features.slice(0, 4).join('\n')}\n\n` +
          `**ENTERPRISE** - $999/month\n` +
          `${this.subscriptions.tiers.enterprise.features.slice(0, 4).join('\n')}\n\n` +
          `Use \`!subscribe <tier>\` to upgrade now!`
        );
      }
      
      if (['starter', 'professional', 'enterprise', 'free'].includes(action)) {
        const result = this.subscriptions.subscribe(message.author.id, action, 'stripe');
        
        if (!result.success) {
          return message.reply(`❌ ${result.message || result.error}`);
        }
        
        if (action !== 'free') {
          return message.reply(
            `🎉 **Welcome to ${result.tier.charAt(0).toUpperCase() + result.tier.slice(1)}!**\n\n` +
            `${result.message}\n\n` +
            `**Unlocked Features:**\n${result.features.slice(0, 5).join('\n')}\n\n` +
            `Price: ${result.price}\n` +
            `Next Billing: ${result.nextBilling}\n\n` +
            `🚀 Your account has been upgraded with premium features!`
          );
        } else {
          return message.reply(`✅ ${result.message}`);
        }
      }
      
      return message.reply(`❌ Invalid tier. Use: starter, professional, enterprise, or free`);
    });

    this.commands.register('upgrade', async (message) => {
      message.reply(
        `📈 **Upgrade Your Account**\n\n` +
        `Choose your tier:\n` +
        `• \`!subscribe starter\` - $49/mo (2 platforms, 30-day history)\n` +
        `• \`!subscribe professional\` - $199/mo (5 platforms, unlimited history, royalty reactor)\n` +
        `• \`!subscribe enterprise\` - $999/mo (white-label, unlimited everything)\n\n` +
        `Use \`!pricing\` for full feature comparison`
      );
    });

    this.commands.register('downgrade', async (message) => {      return message.reply('Usage: `!subscribe [pro|free|info]`');
    });
    
    this.commands.register('streamer_stats', async (message) => {
      const subInfo = this.subscriptions.getSubscriptionInfo(message.author.id);
      
      if (subInfo.tier !== 'pro') {
        return message.reply(
          '🔒 **Pro Feature**\n\n' +
          'Detailed streamer statistics are available on the Pro tier.\n\n' +
          'Use `!subscribe pro` to upgrade for $10/month!'
        );
      }
      
      if (subInfo.linkedStreamers.length === 0) {
        return message.reply('❌ No Twitch account linked. Use `!twitch_connect <username>` first.');
      }
      
      const streamerId = subInfo.linkedStreamers[0].twitchStreamerId;
      const twitchInsights = await this.twitch.generateStreamInsights(streamerId);
      const historicalData = this.generateSimulatedHistory(twitchInsights.viewerMetrics.average);
      const proReport = this.analytics.generateProReport(streamerId, twitchInsights, historicalData);
      
      const strategy = proReport.contentStrategy;
      
      return message.reply(
        `📅 **Content Strategy for ${proReport.streamer}**\n\n` +
        `**Optimal Streaming Times:**\n${strategy.optimalStreamTimes.join('\n')}\n\n` +
        `**Game Selection:**\n${strategy.suggestedGames.join('\n')}\n\n` +
        `**Title Optimization:**\n${strategy.titleOptimization.join('\n')}\n\n` +
        `**Collaboration Strategy:**\n${strategy.collaborationOpportunities.join('\n')}`
      );
    });
    
    this.commands.register('twitch_dashboard', async (message) => {
      if (message.author.id !== this.ownerId) {
        return message.reply('🔒 Owner only');
      }
      
      const systemStatus = this.twitch.getSystemStatus();
      const trackedStreamers = this.twitch.getTrackedStreamers();
      const revenueReport = this.subscriptions.getRevenueReport();
      
      return message.reply(
        `🎮 **Twitch Data Sovereignty Dashboard**\n\n` +
        `**System Status:**\n` +
        `API Health: ${systemStatus.apiHealth}\n` +
        `Rate Limit: ${systemStatus.rateLimitStatus}\n` +
        `Tracked Streamers: ${systemStatus.totalTrackedStreamers}\n` +
        `Currently Live: ${systemStatus.currentlyLive}\n` +
        `Total Chat Messages: ${systemStatus.dataPoints.chatMessages}\n\n` +
        `**Revenue:**\n` +
        `Monthly Recurring: ${revenueReport.revenue.monthlyRecurring}\n` +
        `Current Month: ${revenueReport.revenue.currentMonth}\n` +
        `All Time: ${revenueReport.revenue.allTime}\n\n` +
        `**Subscribers:**\n` +
        `Total: ${revenueReport.subscribers.total}\n` +
        `Free: ${revenueReport.subscribers.free} | Pro: ${revenueReport.subscribers.pro}\n` +
        `Conversion Rate: ${revenueReport.subscribers.conversionRate}\n\n` +
        `**Projections:**\n` +
        `Annual Run Rate: ${revenueReport.projections.annualRunRate}\n` +
        `Conversion Opportunity: ${revenueReport.projections.conversionOpportunity}`
      );
    });

    // ============ STEP 14: ROYALTY FISSION REACTOR ============
    
    this.commands.register('royalty_streams', async (message) => {
      const RoyaltyReactor = require('../income/royalty_reactor.js');
      const reactor = new RoyaltyReactor();
      
      const streams = reactor.getRoyaltyStreams();
      
      if (streams.length === 0) {
        return message.reply('💰 **No royalty streams yet!**\n\nRoyalties will appear as users:\n• Redeem dust for USD (5% fee)\n• Trade NFTs on marketplace (2.5% fee)\n• Subscribe to Pro tier (10% to treasury)\n• License white-label deployments (5-15% fee)');
      }
      
      let response = '💰 **Active Royalty Streams**\n\n';
      
      // Group by type
      const byType = {};
      streams.forEach(stream => {
        if (!byType[stream.type]) byType[stream.type] = [];
        byType[stream.type].push(stream);
      });
      
      for (const [type, typeStreams] of Object.entries(byType)) {
        const total = typeStreams.reduce((sum, s) => sum + s.totalGenerated, 0);
        response += `**${type.replace(/_/g, ' ').toUpperCase()}**\n`;
        response += `   Streams: ${typeStreams.length} | Total: $${total.toFixed(2)}\n\n`;
      }
      
      const report = reactor.getRevenueReport();
      response += `**Platform Totals:**\n`;
      response += `Total Generated: $${report.totalGenerated.toFixed(2)}\n`;
      response += `Total Compounded: $${report.totalCompounded.toFixed(2)}\n\n`;
      
      response += `**Compounding Allocation:**\n`;
      response += `Infrastructure (30%): $${report.compoundingAllocation.infrastructure.toFixed(2)}\n`;
      response += `Growth (70%): $${report.compoundingAllocation.growth.toFixed(2)}`;
      
      message.reply(response);
    });

    this.commands.register('financial_sovereignty', async (message) => {
      const RoyaltyReactor = require('../income/royalty_reactor.js');
      const reactor = new RoyaltyReactor();
      
      const sovereignty = reactor.getSovereigntyMetrics();
      
      let response = '💎 **Financial Sovereignty Report**\n\n';
      response += `**Overall Score:** ${sovereignty.sovereigntyScore}% (Grade: ${sovereignty.grade})\n\n`;
      
      response += `**Component Scores:**\n`;
      response += `🎯 Revenue Diversity: ${sovereignty.diversityScore}%\n`;
      response += `   ${sovereignty.metrics.revenueTypes}/4 revenue types active\n\n`;
      response += `📈 Sustainability: ${sovereignty.sustainabilityScore}%\n`;
      response += `   ${sovereignty.growthRate}% growth rate\n\n`;
      
      response += `**Key Metrics:**\n`;
      response += `Total Revenue: $${sovereignty.metrics.totalRevenue.toFixed(2)}\n`;
      response += `Active Streams: ${sovereignty.metrics.activeStreams}\n`;
      response += `Weekly Revenue: $${sovereignty.metrics.weeklyRevenue.toFixed(2)}\n`;
      response += `Compounded to Date: $${sovereignty.metrics.compoundedToDate.toFixed(2)}\n\n`;
      
      if (sovereignty.sovereigntyScore < 60) {
        response += '⚠️ **Recommendation:** Diversify revenue streams\n';
        response += '• Enable NFT marketplace\n';
        response += '• Promote Pro subscriptions\n';
        response += '• Launch white-label licensing';
      } else if (sovereignty.sovereigntyScore < 80) {
        response += '✅ **Good Progress!** Continue growing all revenue streams';
      } else {
        response += '🎉 **Excellent!** Platform has strong financial sovereignty';
      }
      
      message.reply(response);
    });

    this.commands.register('royalty_forecast', async (message) => {
      const args = message.content.split(' ').slice(1);
      const targetUsers = parseInt(args[0]) || 1000;
      
      const RoyaltyReactor = require('../income/royalty_reactor.js');
      const reactor = new RoyaltyReactor();
      
      const forecast = reactor.forecastRevenue(targetUsers);
      
      let response = `📊 **Revenue Forecast for ${targetUsers} Users**\n\n`;
      
      response += `**Assumptions:**\n`;
      response += `• ${forecast.assumptions.redemptionPerUser} USD redemptions/user/month\n`;
      response += `• ${forecast.assumptions.nftTradesPerUser} NFT trades/user/month\n`;
      response += `• ${forecast.assumptions.subscriptionConversion} subscribe at ${forecast.assumptions.avgSubscriptionPrice}\n\n`;
      
      response += `**Revenue Breakdown:**\n`;
      response += `Redemption Fees (5%): $${forecast.breakdown.redemptions.toFixed(2)}\n`;
      response += `NFT Marketplace (2.5%): $${forecast.breakdown.nftMarketplace.toFixed(2)}\n`;
      response += `Subscriptions: $${forecast.breakdown.subscriptions.toFixed(2)}\n\n`;
      
      response += `**Total Monthly Revenue:** $${forecast.total.toFixed(2)}\n`;
      response += `**Annual Projection:** $${(forecast.total * 12).toFixed(2)}\n\n`;
      
      response += `**Compounding Strategy:**\n`;
      response += `Infrastructure (30%): $${forecast.compounded.infrastructure.toFixed(2)}/mo\n`;
      response += `Growth & Features (70%): $${forecast.compounded.growth.toFixed(2)}/mo\n\n`;
      
      response += `💡 **Scaling Tip:** At 10,000 users, projected annual revenue: $${(forecast.total * 10 * 12).toFixed(0)}`;
      
      message.reply(response);
    });

    this.commands.register('deploy_royalty_reactor', async (message) => {
      if (message.author.id !== this.ownerId) {
        return message.reply('❌ Only the bot owner can deploy the reactor.');
      }
      
      // Initialize royalty reactor if not already done
      if (!this.royaltyReactor) {
        const RoyaltyReactor = require('../income/royalty_reactor.js');
        this.royaltyReactor = new RoyaltyReactor();
      }
      
      const report = this.royaltyReactor.getRevenueReport();
      
      message.reply(
        '💰 **ROYALTY FISSION REACTOR DEPLOYED**\n\n' +
        `**Status:** ✅ ACTIVE\n\n` +
        `**Revenue Streams Configured:**\n` +
        `• Redemption Fees: 5%\n` +
        `• NFT Marketplace: 2.5%\n` +
        `• Subscription Revenue: 90% platform, 10% treasury\n` +
        `• White-Label Licensing: 5-15%\n\n` +
        `**Compounding Allocation:**\n` +
        `• Infrastructure: 30%\n` +
        `• Growth & Features: 70%\n\n` +
        `**Current Stats:**\n` +
        `Total Generated: $${report.totalGenerated.toFixed(2)}\n` +
        `Active Streams: ${report.streamCount}\n\n` +
        `**Commands:**\n` +
        `\`!royalty_streams\` - View all revenue streams\n` +
        `\`!financial_sovereignty\` - Check platform health\n` +
        `\`!royalty_forecast <users>\` - Revenue projections\n\n` +
        `🚀 The reactor is now multiplying every transaction into platform growth!`
      );
    });

    // ============ STEP 15: COMMUNITY TREASURY ============
    
    this.commands.register('treasury_status', async (message) => {
      const CommunityTreasury = require('../governance/community_treasury.js');
      const treasury = new CommunityTreasury();
      
      const stats = treasury.getStatistics();
      const activeProposals = treasury.getActiveProposals();
      
      let response = '🏛️ **Community Treasury Status**\n\n';
      response += `**Balance:** $${stats.currentBalance.toFixed(2)}\n\n`;
      
      response += `**All-Time Stats:**\n`;
      response += `Total Inflows: $${stats.totalInflows.toFixed(2)}\n`;
      response += `Total Outflows: $${stats.totalOutflows.toFixed(2)}\n`;
      response += `Utilization Rate: ${stats.utilizationRate}%\n\n`;
      
      response += `**Proposals:**\n`;
      response += `Active: ${stats.proposals.active}\n`;
      response += `Passed: ${stats.proposals.passed}\n`;
      response += `Rejected: ${stats.proposals.rejected}\n`;
      response += `Average Request: $${stats.averageFundingRequest.toFixed(2)}\n\n`;
      
      if (activeProposals.length > 0) {
        response += `**Currently Voting:**\n`;
        activeProposals.slice(0, 3).forEach(p => {
          const total = p.yesVotes + p.noVotes;
          const yesPercent = total > 0 ? ((p.yesVotes / total) * 100).toFixed(0) : 0;
          response += `#${p.id}: ${p.title}\n`;
          response += `   $${p.requestedAmount.toFixed(2)} | ${yesPercent}% yes (${total} votes)\n`;
        });
        
        if (activeProposals.length > 3) {
          response += `   ...and ${activeProposals.length - 3} more\n`;
        }
      } else {
        response += '✅ No active proposals. Use `!revenue_proposal` to create one!';
      }
      
      message.reply(response);
    });

    this.commands.register('revenue_proposal', async (message) => {
      const args = message.content.split(' ').slice(1);
      
      if (args.length < 2) {
        return message.reply(
          '**Create Treasury Proposal**\n\n' +
          'Usage: `!revenue_proposal <amount> <title and description>`\n\n' +
          '**Example:**\n' +
          '`!revenue_proposal 100 New Feature: Add YouTube integration for multi-platform analytics`\n\n' +
          '**Requirements:**\n' +
          '• Amount must be ≤ current treasury balance\n' +
          '• Voting period: 7 days\n' +
          '• Quorum: 10% of users must vote\n' +
          '• Pass threshold: 60% yes votes'
        );
      }
      
      const amount = parseFloat(args[0]);
      const titleAndDesc = args.slice(1).join(' ');
      
      if (isNaN(amount) || amount <= 0) {
        return message.reply('❌ Invalid amount. Must be a positive number.');
      }
      
      const CommunityTreasury = require('../governance/community_treasury.js');
      const treasury = new CommunityTreasury();
      
      const result = treasury.createProposal(
        message.author.id,
        titleAndDesc.substring(0, 100), // Title
        titleAndDesc, // Full description
        amount
      );
      
      if (result.success) {
        message.reply(
          `✅ **Proposal Created!**\n\n` +
          `**ID:** #${result.proposalId}\n` +
          `**Title:** ${result.title}\n` +
          `**Requested:** $${result.requestedAmount.toFixed(2)}\n` +
          `**Voting Period:** ${result.votingPeriod}\n` +
          `**Expires:** ${new Date(result.expiresAt).toLocaleString()}\n\n` +
          `Community members can now vote using:\n` +
          `\`!vote ${result.proposalId} yes\` or \`!vote ${result.proposalId} no\``
        );
      } else {
        message.reply(`❌ ${result.error}`);
      }
    });

    this.commands.register('community_payouts', async (message) => {
      if (message.author.id !== this.ownerId) {
        return message.reply('❌ Only the bot owner can trigger payout processing.');
      }
      
      const CommunityTreasury = require('../governance/community_treasury.js');
      const treasury = new CommunityTreasury();
      
      const result = treasury.processExpiredProposals();
      
      if (result.processed === 0) {
        return message.reply('✅ No expired proposals to process.');
      }
      
      let response = `🏛️ **Processed ${result.processed} Expired Proposals**\n\n`;
      
      result.results.forEach(r => {
        if (r.result.success) {
          response += `✅ #${r.proposalId}: EXECUTED ($${r.result.amount.toFixed(2)})\n`;
          response += `   ${r.result.yesPercentage}% yes votes\n\n`;
        } else {
          response += `❌ #${r.proposalId}: ${r.result.status.toUpperCase()}\n`;
          response += `   ${r.result.error}\n\n`;
        }
      });
      
      message.reply(response);
    });

    // ============ STEP 16: CROSS-PLATFORM IDENTITY ============
    
    this.commands.register('my_identity', async (message) => {
      const SovereignIdentity = require('../identity/sovereign_identity.js');
      const identity = new SovereignIdentity();
      
      const reputation = identity.calculateReputation(message.author.id);
      const achievements = identity.getUserAchievements(message.author.id);
      const platforms = identity.getLinkedPlatforms(message.author.id);
      
      let response = `🆔 **Sovereign Identity: ${message.author.username}**\n\n`;
      
      response += `**Reputation Score:** ${reputation.score}/1000\n`;
      response += `**Percentile Rank:** Top ${100 - reputation.percentile}%\n\n`;
      
      response += `**Score Breakdown:**\n`;
      response += `Governance: ${Math.round(reputation.breakdown.governance || 0)}/300\n`;
      response += `NFTs: ${Math.round(reputation.breakdown.nfts || 0)}/250\n`;
      response += `Royalties: ${Math.round(reputation.breakdown.royalties || 0)}/200\n`;
      response += `Community: ${Math.round(reputation.breakdown.community || 0)}/150\n`;
      response += `Tenure: ${Math.round(reputation.breakdown.tenure || 0)}/100\n\n`;
      
      if (achievements.length > 0) {
        response += `**Achievements (${achievements.length}):**\n`;
        achievements.slice(0, 5).forEach(a => {
          response += `🏆 ${a.title}\n`;
        });
        if (achievements.length > 5) {
          response += `   ...and ${achievements.length - 5} more\n`;
        }
      } else {
        response += '**No achievements yet!** Start by claiming dust with `!bite`\n';
      }
      
      response += `\n**Linked Platforms:** ${platforms.length}`;
      if (platforms.length > 0) {
        response += ` (${platforms.map(p => p.platform).join(', ')})`;
      }
      
      message.reply(response);
    });

    this.commands.register('identity_portability', async (message) => {
      const SovereignIdentity = require('../identity/sovereign_identity.js');
      const identity = new SovereignIdentity();
      
      const portableData = identity.getPortableIdentity(message.author.id);
      
      let response = '🌐 **Portable Identity Export**\n\n';
      response += `**Reputation:** ${portableData.reputation.score}/1000 (Top ${100 - portableData.reputation.percentile}%)\n\n`;
      
      response += `**Portable Achievements:** ${portableData.achievements.length}\n`;
      portableData.achievements.slice(0, 5).forEach(a => {
        response += `• ${a.title} (${a.category})\n`;
      });
      
      if (portableData.achievements.length > 5) {
        response += `...and ${portableData.achievements.length - 5} more\n`;
      }
      
      response += `\n**Verification Hash:** \`${portableData.verificationHash}\`\n`;
      response += `**Exported:** ${new Date(portableData.exportedAt).toLocaleString()}\n\n`;
      
      response += '💡 **Use this identity on:**\n';
      response += '• Other Discord servers with n8.ked\n';
      response += '• Future Twitch/YouTube integrations\n';
      response += '• White-label platform instances\n';
      response += '• Any service supporting sovereign identity\n\n';
      
      response += '🔒 **Your data, your control**';
      
      message.reply(response);
    });

    this.commands.register('reputation_network', async (message) => {
      const SovereignIdentity = require('../identity/sovereign_identity.js');
      const identity = new SovereignIdentity();
      
      const network = identity.getNetworkStatistics();
      
      if (!network) {
        return message.reply('❌ Failed to retrieve network statistics.');
      }
      
      let response = '🌍 **Reputation Network Statistics**\n\n';
      
      response += `**Network Size:** ${network.totalUsers} users\n`;
      response += `**Average Reputation:** ${network.averageReputation}/1000\n\n`;
      
      if (network.topPerformers.length > 0) {
        response += `**Top 5 Contributors:**\n`;
        network.topPerformers.slice(0, 5).forEach((user, i) => {
          response += `${i + 1}. <@${user.discord_id}>: ${user.reputation_score}\n`;
        });
        response += '\n';
      }
      
      if (Object.keys(network.achievementDistribution).length > 0) {
        response += `**Most Common Achievements:**\n`;
        const topAch = Object.entries(network.achievementDistribution)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        topAch.forEach(([achId, count]) => {
          response += `• ${achId.replace(/_/g, ' ')}: ${count} users\n`;
        });
        response += '\n';
      }
      
      if (Object.keys(network.platformConnections).length > 0) {
        response += `**Cross-Platform Connections:**\n`;
        for (const [platform, count] of Object.entries(network.platformConnections)) {
          response += `${platform}: ${count} linked accounts\n`;
        }
      }
      
      message.reply(response);
    });

    // ============ STEP 13 EXPANSION: MULTI-PLATFORM DATA SOVEREIGNTY ============
    
    this.commands.register('link_youtube', async (message) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      const args = message.content.split(' ').slice(1);
      
      if (args.length === 0) {
        return message.reply(
          '📺 **Link YouTube Channel (Simulated)**\n\n' +
          'Usage: `!link_youtube <channel_handle>`\n\n' +
          '**Note:** This uses *simulated analytics* - no real API keys needed.\n' +
          'The system generates believable metrics that you can validate.\n\n' +
          'Example: `!link_youtube @YourChannel`\n\n' +
          '💡 Use `!validate_metric youtube followers <actual>` to improve predictions.'
        );
      }
      
      const handle = args[0].replace('@', '');
      const result = SimulatedAnalytics.linkPlatform(message.author.id, 'youtube', handle);
      
      if (result.success) {
        return message.reply(
          `✅ **YouTube Channel Linked (Simulated)**\n\n` +
          `**Channel:** @${result.handle}\n` +
          `**Estimated Subscribers:** ${result.metrics.followers.toLocaleString()}\n` +
          `**Engagement Rate:** ${(result.metrics.engagementRate * 100).toFixed(2)}%\n` +
          `**Estimated Reach:** ${result.metrics.estimatedReach.toLocaleString()} viewers\n\n` +
          `📊 **Simulation active.** Use \`!data_dashboard\` to see cross-platform insights.\n` +
          `💡 Validate with: \`!validate_metric youtube followers <your_actual_count>\``
        );
      } else {
        return message.reply(`❌ ${result.error}`);
      }
    });

    this.commands.register('link_twitter', async (message) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      const args = message.content.split(' ').slice(1);
      
      if (args.length === 0) {
        return message.reply(
          '🐦 **Link Twitter Account (Simulated)**\n\n' +
          'Usage: `!link_twitter <username>`\n\n' +
          '**Note:** This uses *simulated analytics* - no real API keys needed.\n' +
          'Example: `!link_twitter YourHandle`\n\n' +
          '💡 Use `!validate_metric twitter followers <actual>` to improve predictions.'
        );
      }
      
      const handle = args[0].replace('@', '');
      const result = SimulatedAnalytics.linkPlatform(message.author.id, 'twitter', handle);
      
      if (result.success) {
        return message.reply(
          `✅ **Twitter Account Linked (Simulated)**\n\n` +
          `**Username:** @${result.handle}\n` +
          `**Estimated Followers:** ${result.metrics.followers.toLocaleString()}\n` +
          `**Engagement Rate:** ${(result.metrics.engagementRate * 100).toFixed(2)}%\n` +
          `**Estimated Reach:** ${result.metrics.estimatedReach.toLocaleString()} impressions\n\n` +
          `📊 Use \`!data_dashboard\` to see how Twitter performs with other platforms!\n` +
          `💡 Validate: \`!validate_metric twitter followers <your_actual_count>\``
        );
      } else {
        return message.reply(`❌ ${result.error}`);
      }
    });

    this.commands.register('link_reddit', async (message) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      const args = message.content.split(' ').slice(1);
      
      if (args.length === 0) {
        return message.reply(
          '🔴 **Link Reddit Account (Simulated)**\n\n' +
          'Usage: `!link_reddit <username>`\n\n' +
          '**Note:** This uses *simulated analytics* - no real API keys needed.\n' +
          'Example: `!link_reddit YourUsername`\n\n' +
          '💡 Validate karma: `!validate_metric reddit followers <actual_karma>`'
        );
      }
      
      const handle = args[0].replace('u/', '');
      const result = SimulatedAnalytics.linkPlatform(message.author.id, 'reddit', handle);
      
      if (result.success) {
        return message.reply(
          `✅ **Reddit Account Linked (Simulated)**\n\n` +
          `**Username:** u/${result.handle}\n` +
          `**Estimated Karma:** ${result.metrics.followers.toLocaleString()}\n` +
          `**Engagement Rate:** ${(result.metrics.engagementRate * 100).toFixed(2)}%\n` +
          `**Estimated Reach:** ${result.metrics.estimatedReach.toLocaleString()} upvotes/month\n\n` +
          `📊 Your Reddit activity contributes to sovereign reputation!\n` +
          `💡 Validate: \`!validate_metric reddit followers <your_actual_karma>\``
        );
      } else {
        return message.reply(`❌ ${result.error}`);
      }
    });

    this.commands.register('data_dashboard', async (message) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      
      const result = SimulatedAnalytics.getDashboard(message.author.id);
      
      if (!result.success) {
        return message.reply(
          `❌ ${result.error}\n\n` +
          '**Link your platforms (simulated):**\n' +
          '• `!link_youtube <handle>`\n' +
          '• `!link_twitter <username>`\n' +
          '• `!link_reddit <username>`\n\n' +
          '💡 No real API keys needed - uses simulated analytics'
        );
      }
      
      const { platforms, summary } = result;
      
      let response = `📊 **Simulated Analytics Dashboard**\n\n`;
      response += `**Linked Platforms:** ${summary.linkedCount}\n`;
      response += `**Total Followers:** ${summary.totalFollowers.toLocaleString()}\n`;
      response += `**Average Engagement:** ${(summary.avgEngagement * 100).toFixed(2)}%\n`;
      response += `**Estimated Reach:** ${summary.estimatedReach.toLocaleString()}\n`;
      response += `**Value Multiplier:** ${summary.multiplier.toFixed(1)}x\n\n`;
      
      platforms.forEach(p => {
        response += `${p.icon} **${p.platform.toUpperCase()}:** @${p.handle}\n`;
        response += `   ${p.followers.toLocaleString()} followers • ${(p.engagementRate * 100).toFixed(2)}% engagement\n`;
        response += `   Estimated reach: ${p.estimatedReach.toLocaleString()}\n\n`;
      });
      
      response += `💡 **Validate predictions:**\n`;
      response += `\`!validate_metric <platform> followers <actual_count>\`\n\n`;
      response += `📈 **Weekly report:** \`!analytics_report\``;
      
      return message.reply(response);
    });
    
    this.commands.register('analytics_report', async (message) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      
      const result = SimulatedAnalytics.generateWeeklyReport(message.author.id);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      let response = `📈 **Weekly Analytics Report**\n`;
      response += `**Week Starting:** ${result.weekStarting}\n\n`;
      
      result.reports.forEach(report => {
        response += `${report.icon} **${report.platform.toUpperCase()}** (@${report.handle})\n`;
        response += `   Follower Growth: +${report.weeklyMetrics.followerGrowth}\n`;
        response += `   Engagement: ${report.weeklyMetrics.engagementChange >= 0 ? '+' : ''}${(report.weeklyMetrics.engagementChange * 100).toFixed(2)}%\n`;
        response += `   Impressions: ${report.weeklyMetrics.impressions.toLocaleString()}\n`;
        response += `   Top Content: "${report.weeklyMetrics.topContent}"\n\n`;
      });
      
      response += `${result.note}`;
      
      return message.reply(response);
    });
    
    this.commands.register('validate_metric', async (message, args) => {
      const SimulatedAnalytics = require('../income/simulated_analytics.js');
      
      if (args.length < 3) {
        return message.reply(
          '**Validate Simulated Metrics**\n\n' +
          'Usage: `!validate_metric <platform> <metric> <actual_value>`\n\n' +
          'Examples:\n' +
          '• `!validate_metric youtube followers 15000`\n' +
          '• `!validate_metric twitter followers 3200`\n' +
          '• `!validate_metric reddit followers 8500`\n\n' +
          'This helps improve prediction accuracy over time.'
        );
      }
      
      const platform = args[0].toLowerCase();
      const metric = args[1].toLowerCase();
      const actualValue = parseFloat(args[2]);
      
      if (!['youtube', 'twitter', 'reddit'].includes(platform)) {
        return message.reply('❌ Invalid platform. Use: youtube, twitter, or reddit');
      }
      
      if (isNaN(actualValue) || actualValue < 0) {
        return message.reply('❌ Invalid value. Must be a positive number.');
      }
      
      const result = SimulatedAnalytics.validateMetric(message.author.id, platform, metric, actualValue);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      return message.reply(
        `✅ **Metric Validated**\n\n` +
        `**Platform:** ${platform}\n` +
        `**Predicted:** ${result.predicted.toLocaleString()}\n` +
        `**Actual:** ${result.actual.toLocaleString()}\n` +
        `**Accuracy:** ${result.accuracy}%\n\n` +
        `${result.message}`
      );
    });

    this.commands.register('deploy_data_sovereignty', async (message) => {
      const userId = message.author.id;
      
      // Check reputation gate (ENTERPRISE tier)
      if (!ReputationGates.hasAccess(userId, 'VOID_COUNCIL')) {
        return message.reply(ReputationGates.getAccessDeniedMessage(userId, 'VOID_COUNCIL'));
      }
      
      try {
        // Gather user's complete ARIEUS identity
        const user = statements.getUser.get(userId);
        const transactions = statements.getUserTransactions.all(userId, 100);
        const nfts = statements.getUserNFTs.all(userId);
        const subscription = statements.getSubscription.get(userId);
        const achievements = db.prepare('SELECT * FROM identity_achievements WHERE user_id = ?').all(userId);
        const reputation = ReputationGates.getProgress(userId);
        
        // Build portable identity JSON
        const identity = {
          exported_at: new Date().toISOString(),
          export_version: '1.0.0',
          platform: 'ARIEUS (n8.ked Discord Bot)',
          user: {
            discord_id: userId,
            username: message.author.username,
            created_at: user?.created_at || new Date().toISOString()
          },
          economy: {
            frag_balance: user?.frag_balance || 0,
            water_balance: user?.water_balance || 0,
            usd_balance: user?.usd_balance || 0,
            staked_frag: user?.staked_frag || 0
          },
          reputation: {
            score: user?.reputation_score || 0,
            tier: reputation.tier,
            next_gate: reputation.nextGate,
            progress_percentage: reputation.progress
          },
          nfts: nfts.map(nft => ({
            id: nft.id,
            template: nft.template,
            rarity: nft.rarity,
            worth: nft.worth,
            metadata: JSON.parse(nft.metadata || '{}'),
            created_at: nft.created_at
          })),
          achievements: achievements.map(ach => ({
            id: ach.achievement_id,
            title: ach.title,
            description: ach.description,
            earned_at: ach.earned_at,
            portable: ach.portable === 1
          })),
          transactions: transactions.slice(0, 50).map(tx => ({ // Last 50 transactions
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            note: tx.note,
            timestamp: tx.timestamp
          })),
          subscription: subscription ? {
            tier: subscription.tier,
            status: subscription.status,
            total_paid: subscription.total_paid,
            subscription_started_at: subscription.subscription_started_at
          } : null,
          sovereignty_statement: "This identity snapshot is portable across platforms. You own your data, your reputation, and your achievements. Take them with you."
        };
        
        // Convert to formatted JSON
        const jsonExport = JSON.stringify(identity, null, 2);
        
        // Send as file attachment
        const { AttachmentBuilder } = require('discord.js');
        const buffer = Buffer.from(jsonExport, 'utf-8');
        const filename = `arieus_identity_${userId}_${Date.now()}.json`;
        const attachment = new AttachmentBuilder(buffer, { name: filename });
        
        return message.reply({
          content: `📦 **ARIEUS Identity Exported**\n\n` +
            `**Format:** Portable JSON\n` +
            `**Size:** ${(buffer.length / 1024).toFixed(2)} KB\n` +
            `**Includes:**\n` +
            `• Economic balances (${user?.frag_balance.toFixed(2)} ⚡FRAG)\n` +
            `• ${nfts.length} NFTs\n` +
            `• ${achievements.length} achievements\n` +
            `• ${transactions.length} transactions\n` +
            `• Reputation (${user?.reputation_score} - ${reputation.tier})\n\n` +
            `🔐 **Your data. Your sovereignty.**`,
          files: [attachment]
        });
      } catch (error) {
        console.error('[SOVEREIGNTY EXPORT ERROR]', error);
        return message.reply(`❌ Export failed: ${error.message}`);
      }
    });
    
    this.commands.register('status', async (message) => {
      const economyData = {
        balances: this.brand.dust.balances,
        assetReserves: this.brand.dust.assetReserves
      };
      const metrics = this.monitor.getProductionMetrics(economyData);
      const externalStatus = await this.externalAPI.getRealWorldStatus();
      const fs = require('fs');
      
      let response = `🏭 **System Status**\n\n`;
      
      // Service status
      response += `**Bot:** ✅ Online\n`;
      response += `**Database:** ${fs.existsSync(this.brand.dust.dataFilePath) ? '✅ Persistent' : '❌ Offline'}\n`;
      response += `**External APIs:** ${externalStatus.activeServices > 0 ? '✅ Connected' : '❌ Disconnected'}\n\n`;
      
      // Performance
      response += `**Performance:**\n`;
      response += `Uptime: ${metrics.uptime.formatted}\n`;
      response += `Commands: ${metrics.performance.commandsTotal}\n`;
      response += `Errors: ${metrics.performance.errorsTotal}\n\n`;
      
      // Economy health
      const totalDust = Object.values(this.brand.dust.balances).reduce((sum, val) => sum + val, 0);
      const backedDust = this.brand.dust.assetReserves.waterLiters * this.brand.dust.assetReserves.backingRatio;
      const coverage = totalDust > 0 ? (backedDust / totalDust * 100) : 100;
      
      response += `**Economic Health:**\n`;
      response += `Backing Coverage: ${coverage.toFixed(1)}%\n`;
      response += `User Growth: ${Object.keys(this.brand.dust.balances).length}\n`;
      response += `External Data: ${externalStatus.activeServices > 0 ? '✅ Active' : '❌ Inactive'}`;
      
      return message.reply(response);
    });
    
    // ============ STEP 11: NFT IDENTITY ECONOMY ============
    
    this.commands.register('create_nft', async (message, args) => {
      const userId = message.author.id;
      
      // Check reputation gate
      if (!ReputationGates.hasAccess(userId, 'DEMONS_BAZAAR')) {
        return message.reply(ReputationGates.getAccessDeniedMessage(userId, 'DEMONS_BAZAAR'));
      }
      
      const templateType = args[0];
      
      if (!templateType) {
        const templates = Object.keys(this.nftSystem.getTemplates());
        return message.reply(`🎨 **NFT Templates Available:**\n\n${templates.join(', ')}\n\nUse: \`!create_nft <template>\``);
      }
      
      const result = this.nftSystem.startCreation(userId, templateType);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      // Check balance
      const balance = this.brand.dust.getBalance(userId);
      if (balance < result.cost) {
        return message.reply(`❌ Need ${result.cost} ⚡FRAG to create this NFT. You have ${balance.toFixed(2)} ⚡FRAG.`);
      }
      
      // Deduct cost
      this.brand.dust.processTransfer(userId, 'nft_creation_fee', result.cost);
      
      // Award reputation for NFT creation
      ReputationGates.autoAward.createNFT(userId);
      
      return message.reply(`🎨 **NFT Creation Started!**\n\nCost: ${result.cost} ⚡FRAG\n\n**${result.prompt}**\n\nType your answer in chat (60s timeout)`);
    });
    
    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      
      // Check if user has pending NFT creation
      const userId = message.author.id;
      const pending = this.nftSystem.pendingCreations[userId];
      
      if (pending && !message.content.startsWith('!')) {
        const result = this.nftSystem.processCreationStep(userId, message.content);
        
        if (result.success && !result.complete) {
          // Next step
          await message.reply(`✅ Saved!\n\n**Step ${result.currentStep + 1}/${result.totalSteps}:**\n${result.prompt}`);
        } else if (result.success && result.complete) {
          // NFT created!
          const nft = result.nft;
          const preview = this.nftSystem.generatePreview(nft);
          
          let response = `🎊 **NFT CREATED!**\n\n`;
          response += `**ID:** ${nft.id}\n`;
          response += `**Template:** ${nft.template}\n`;
          response += `**Rarity:** ${nft.rarityScore.toFixed(1)}/10\n\n`;
          response += `**Your Creation:**\n${preview}\n\n`;
          response += `**Community Worth:** ${nft.communityWorth} dust\n`;
          response += `**Status:** 🆕 Freshly Minted\n\n`;
          response += `Use \`!nft_gallery\` to view your collection!`;
          
          await message.reply(response);
        }
      }
    });
    
    this.commands.register('nft_gallery', (message, args) => {
      const targetUser = message.mentions.users.first() || message.author;
      const userId = targetUser.id;
      const nfts = this.nftSystem.getUserNFTs(userId);
      
      if (nfts.length === 0) {
        return message.reply(`🎨 ${targetUser.username} has no NFTs yet. Use \`!create_nft\` to start!`);
      }
      
      let response = `🎨 **${targetUser.username}'s NFT Gallery**\n\n`;
      
      const displayNFTs = nfts.slice(-6); // Last 6
      displayNFTs.forEach(nft => {
        const preview = this.nftSystem.generatePreview(nft);
        response += `**${nft.id}** - ${nft.template}\n`;
        response += `${preview}\n`;
        response += `Worth: ${nft.communityWorth} dust | Rarity: ${nft.rarityScore.toFixed(1)}/10\n`;
        response += `\`!view_nft ${nft.id}\` for details\n\n`;
      });
      
      const totalWorth = nfts.reduce((sum, nft) => sum + nft.communityWorth, 0);
      response += `**Collection Value:** ${totalWorth} dust | **Total NFTs:** ${nfts.length}`;
      
      return message.reply(response);
    });
    
    this.commands.register('view_nft', (message, args) => {
      const nftId = args[0];
      if (!nftId) {
        return message.reply('❌ Provide NFT ID: `!view_nft NFT-XXXXXX`');
      }
      
      const result = this.nftSystem.findNFT(nftId);
      if (!result) {
        return message.reply('❌ NFT not found');
      }
      
      const { nft, ownerId } = result;
      const preview = this.nftSystem.generatePreview(nft);
      const owner = this.client.users.cache.get(ownerId);
      
      let response = `🎨 **NFT Details**\n\n`;
      response += `**ID:** ${nft.id}\n`;
      response += `**Owner:** ${owner ? owner.username : 'Unknown'}\n`;
      response += `**Template:** ${nft.template}\n`;
      response += `**Created:** ${new Date(nft.createdAt).toLocaleDateString()}\n\n`;
      response += `**Preview:**\n${preview}\n\n`;
      response += `**Rarity Score:** ${nft.rarityScore.toFixed(1)}/10\n`;
      response += `**Community Worth:** ${nft.communityWorth} dust\n`;
      response += `**Appreciations:** ${nft.appreciationCount}\n`;
      response += `**Transactions:** ${nft.transactionHistory.length}`;
      
      return message.reply(response);
    });
    
    this.commands.register('appreciate', (message, args) => {
      const nftId = args[0];
      const amount = parseInt(args[1]) || 1;
      
      if (!nftId) {
        return message.reply('❌ Usage: `!appreciate NFT-XXXXXX <amount>`');
      }
      
      const userId = message.author.id;
      const balance = this.brand.dust.getBalance(userId);
      
      if (balance < amount) {
        return message.reply(`❌ Insufficient dust. You have ${balance} dust.`);
      }
      
      const result = this.nftSystem.appreciate(nftId, userId, amount);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      // Deduct dust from appreciator
      this.brand.dust.processTransfer(userId, 'nft_appreciation', amount);
      
      const owner = this.client.users.cache.get(result.ownerId);
      return message.reply(`💖 **Appreciation Added!**\n\n${message.author.username} appreciated ${owner ? owner.username : 'an artist'}'s NFT!\n**+${amount} dust** to community worth\n\nNew worth: **${result.newWorth} dust**`);
    });
    
    this.commands.register('list_nft', (message, args) => {
      const nftId = args[0];
      const price = parseInt(args[1]);
      
      if (!nftId || !price) {
        return message.reply('❌ Usage: `!list_nft NFT-XXXXXX <price>`');
      }
      
      if (price <= 0) {
        return message.reply('❌ Price must be positive');
      }
      
      const result = this.nftSystem.listForSale(nftId, message.author.id, price);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      const { listing } = result;
      return message.reply(`🏪 **NFT Listed for Sale!**\n\n**ID:** ${listing.nft.id}\n**Template:** ${listing.nft.template}\n**Asking Price:** ${listing.price} dust\n**Community Worth:** ${listing.nft.communityWorth} dust\n**Rarity:** ${listing.nft.rarityScore.toFixed(1)}/10`);
    });
    
    this.commands.register('buy_nft', (message, args) => {
      const nftId = args[0];
      
      if (!nftId) {
        return message.reply('❌ Usage: `!buy_nft NFT-XXXXXX`');
      }
      
      const userId = message.author.id;
      const marketplace = this.nftSystem.marketplace[nftId];
      
      if (!marketplace) {
        return message.reply('❌ NFT not listed for sale');
      }
      
      const balance = this.brand.dust.getBalance(userId);
      if (balance < marketplace.price) {
        return message.reply(`❌ Insufficient dust. Need ${marketplace.price}, have ${balance}.`);
      }
      
      const result = this.nftSystem.buyNFT(nftId, userId);
      
      if (!result.success) {
        return message.reply(`❌ ${result.error}`);
      }
      
      // Execute payment
      this.brand.dust.processTransfer(userId, result.sellerId, result.price);
      
      const seller = this.client.users.cache.get(result.sellerId);
      return message.reply(`🎊 **NFT Purchased!**\n\n${message.author.username} bought **${result.nft.id}** from ${seller ? seller.username : 'seller'}\n**Price:** ${result.price} dust\n\nUse \`!nft_gallery\` to see your new NFT!`);
    });
    
    this.commands.register('marketplace', (message) => {
      const listings = this.nftSystem.getMarketplace();
      
      if (listings.length === 0) {
        return message.reply('🏪 **Marketplace Empty**\n\nNo NFTs currently listed for sale.');
      }
      
      let response = `🏪 **NFT Marketplace** (${listings.length} listings)\n\n`;
      
      listings.slice(0, 10).forEach(listing => {
        const preview = this.nftSystem.generatePreview(listing.nft);
        response += `**${listing.nft.id}** - ${listing.nft.template}\n`;
        response += `Price: ${listing.price} dust | Worth: ${listing.nft.communityWorth} dust\n`;
        response += `\`!buy_nft ${listing.nft.id}\`\n\n`;
      });
      
      if (listings.length > 10) {
        response += `...and ${listings.length - 10} more`;
      }
      
      return message.reply(response);
    });
    
    this.commands.register('nft_economy', (message) => {
      const stats = this.nftSystem.getEconomyStats();
      
      let response = `🎨 **NFT Economy Statistics**\n\n`;
      response += `**Total NFTs:** ${stats.totalNFTs}\n`;
      response += `**Total Creators:** ${stats.totalCreators}\n`;
      response += `**Total Community Worth:** ${stats.totalWorth} dust\n`;
      response += `**Total Appreciations:** ${stats.totalAppreciations}\n`;
      response += `**Marketplace Listings:** ${stats.marketplaceListings}\n`;
      response += `**Average Worth:** ${stats.averageWorth} dust\n\n`;
      
      if (stats.mostValuable) {
        const owner = this.client.users.cache.get(stats.mostValuable.ownerId);
        response += `🏆 **Most Valuable NFT:**\n`;
        response += `**${stats.mostValuable.id}**\n`;
        response += `Worth: ${stats.mostValuable.communityWorth} dust\n`;
        response += `Owner: ${owner ? owner.username : 'Unknown'}\n`;
        response += `Rarity: ${stats.mostValuable.rarityScore.toFixed(1)}/10`;
      }
      
      return message.reply(response);
    });

    // Register N8.KED ROACH commands (Resilience Oriented Adaptive Cohesive Hub)
    this.registerROACHCommands();
    
    // Register Stress Test commands (OWNER tier - destructive operations)
    // COMMENTED OUT: Old stress test framework replaced with evolutionary engine
    // this.registerStressTestCommands();
  }

  async start() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN is not set. Provide it in the environment or .env file.');
    }
    await this.client.login(token);
    
    // Start Gravity Well distribution timer (check every hour)
    this.startGravityWellTimer();
  }

  // Gravity Well automatic distribution
  startGravityWellTimer() {
    console.log('[GRAVITY WELL] Starting automatic distribution timer');
    
    // Check and distribute every hour
    setInterval(() => {
      const result = GravityWell.checkAndDistribute();
      
      if (result.distributed) {
        console.log(`[GRAVITY WELL] Auto-distributed ${result.totalAmount.toFixed(2)} FRAG to ${result.recipientCount} users`);
      }
    }, 3600000); // 1 hour
    
    // Also do an initial check 5 minutes after startup
    setTimeout(() => {
      const result = GravityWell.checkAndDistribute();
      if (result.distributed) {
        console.log(`[GRAVITY WELL] Initial distribution: ${result.totalAmount.toFixed(2)} FRAG to ${result.recipientCount} users`);
      }
    }, 300000); // 5 minutes
  }

  // ===== RESILIENCE & CIRCUIT MANAGEMENT (Step 12) =====
  async handleCircuitStatus(message) {
    const status = this.resilience.getCircuitBreakerStatus();
    const response = ['🔌 **Circuit Breaker Status**\n'];
    
    if (status.size === 0) {
      response.push('✅ All circuits healthy - no breakers active');
    } else {
      for (const [serviceId, breaker] of status) {
        const stateEmoji = breaker.state === 'closed' ? '✅' : breaker.state === 'open' ? '🔴' : '⚠️';
        response.push(`${stateEmoji} **${serviceId}**`);
        response.push(`   State: ${breaker.state.toUpperCase()}`);
        response.push(`   Failures: ${breaker.failures}/${breaker.threshold}`);
        response.push(`   Last check: ${new Date(breaker.lastAttempt).toLocaleString()}`);
        response.push('');
      }
    }
    
    message.reply(response.join('\n'));
  }

  async handleSystemHealth(message) {
    const health = this.resilience.performHealthCheck();
    const response = ['💊 **System Health Report**\n'];
    
    response.push(`🔌 Circuit Breakers: ${health.circuitBreakers.total} active, ${health.circuitBreakers.open} open`);
    response.push(`💾 Fallback Cache: ${health.fallbackCache.entries} entries, ${health.fallbackCache.hitRate}% hit rate`);
    response.push(`⚡ Self-Healing: ${health.selfHealing.activeRecoveries} recoveries in progress`);
    response.push(`📊 Overall Status: ${health.overall.status.toUpperCase()}`);
    
    if (health.overall.recommendations.length > 0) {
      response.push('\n🔧 **Recommendations:**');
      health.overall.recommendations.forEach(rec => response.push(`   • ${rec}`));
    }
    
    message.reply(response.join('\n'));
  }

  async handleForceRecovery(message) {
    if (message.author.id !== this.ownerId) {
      return message.reply('❌ Only the bot owner can force recovery.');
    }
    
    const args = message.content.split(' ').slice(1);
    if (args.length === 0) {
      return message.reply('Usage: `!force_recovery <service_id>`\nExample: `!force_recovery usgs_water`');
    }
    
    const serviceId = args[0];
    const result = await this.resilience.manualRecovery(serviceId);
    
    if (result.success) {
      message.reply(`✅ Recovery successful for **${serviceId}**\nCircuit breaker reset, service operational.`);
    } else {
      message.reply(`❌ Recovery failed for **${serviceId}**\nReason: ${result.error}`);
    }
  }

  // Helper method for analytics demo
  generateSimulatedHistory(avgViewers) {
    const history = [];
    const baseViewers = avgViewers || 50;
    
    // Generate 60 days of simulated data
    for (let i = 60; i >= 0; i--) {
      const dayVariance = (Math.random() - 0.5) * 20; // +/- 10 viewers
      const trendGrowth = (60 - i) * 0.5; // Slight upward trend
      
      history.push({
        timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        viewers: Math.max(1, Math.round(baseViewers + dayVariance + trendGrowth)),
        chatters: Math.max(1, Math.round((baseViewers + dayVariance) * 0.15))
      });
    }
    
    return history;
  }

  // Helper method for health bar visualization
  generateHealthBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    
    let emoji = '🟩';
    if (percentage < 50) emoji = '🟥';
    else if (percentage < 80) emoji = '🟨';
    
    return emoji.repeat(filled) + '⬜'.repeat(empty);
  }

  // Tiered Help System with Mystery Blur
  async generateTieredHelpEmbed(userTier, isOwner, category = null) {
    const { EmbedBuilder } = require('discord.js');

    // ARIEUS Color Palette
    const ARIEUS_COLORS = {
      twilight_purple: 0x9B59B6,   // Free/Starter
      blood_orange: 0xE74C3C,       // Professional
      pastel_horror: 0xF8BBD0,      // Warnings
      void_black: 0x1C1C1C,         // Errors
      neon_cyan: 0x00FFFF,          // Enterprise
      dusk_gold: 0xFFD700           // Owner only
    };

    // Command tier requirements
    const commandTiers = {
      // FREE TIER (everyone)
      FREE: [
        { cmd: '!bite', desc: 'Bite the void - earn 100 ⚡FRAG (24hr ritual)', cat: 'economy' },
        { cmd: '!balance', desc: 'Check your ⚡FRAG balance', cat: 'economy' },
        { cmd: '!status', desc: 'Bot health & system status', cat: 'system' },
        { cmd: '!help [category]', desc: 'Show this help menu', cat: 'system' },
        { cmd: '!ledger [limit]', desc: 'Recent transactions', cat: 'economy' },
        { cmd: '!reserves', desc: 'Water backing status', cat: 'economy' },
      ],
      
      // STARTER TIER ($49/mo)
      STARTER: [
        { cmd: '!subscribe', desc: 'View/upgrade subscription tiers', cat: 'revenue' },
        { cmd: '!stake <amount>', desc: 'Stake ⚡FRAG for voting power', cat: 'economy' },
        { cmd: '!unstake <amount>', desc: 'Unstake your ⚡FRAG (10% fee)', cat: 'economy' },
        { cmd: '!propose <title> <desc>', desc: 'Create governance proposal', cat: 'governance' },
        { cmd: '!vote <id> yes/no', desc: 'Vote on active proposals', cat: 'governance' },
        { cmd: '!create_nft <template>', desc: 'Mint basic NFTs', cat: 'nft' },
        { cmd: '!nft_gallery', desc: 'View your NFT collection', cat: 'nft' },
        { cmd: '!activate_n8ked_roach', desc: 'Deploy ROACH engine', cat: 'roach' },
        { cmd: '!reality_mesh_status', desc: 'Digital-physical coherence', cat: 'roach' },
      ],

      // PROFESSIONAL TIER ($199/mo)
      PROFESSIONAL: [
        { cmd: '!transfer <@user> <amount>', desc: 'Transfer ⚡FRAG between wallets', cat: 'economy' },
        { cmd: '!create_advanced_nft', desc: 'Mint rare/legendary NFTs', cat: 'nft' },
        { cmd: '!marketplace_list <nft_id> <price>', desc: 'List NFT for sale', cat: 'nft' },
        { cmd: '!marketplace_buy <listing_id>', desc: 'Purchase listed NFT', cat: 'nft' },
        { cmd: '!link_youtube <url>', desc: 'Link YouTube (simulated analytics)', cat: 'integration' },
        { cmd: '!link_twitter <url>', desc: 'Link Twitter (simulated analytics)', cat: 'integration' },
        { cmd: '!my_identity', desc: 'Your ARIEUS identity profile', cat: 'identity' },
        { cmd: '!royalty_streams', desc: 'View passive FRAG income sources', cat: 'revenue' },
        { cmd: '!analyze_design_flaw <env>', desc: 'Roach vs APEX analysis', cat: 'roach' },
        { cmd: '!loofah_breakthrough <obstacle>', desc: 'Transform obstacles to tools', cat: 'roach' },
        { cmd: '!quantum_reality_mesh <pattern>', desc: 'Physical→Digital meshing', cat: 'roach' },
      ],

      // ENTERPRISE TIER ($999/mo)
      ENTERPRISE: [
        { cmd: '!deploy_data_sovereignty', desc: 'Export identity JSON snapshot', cat: 'system' },
        { cmd: '!ai_toolkit', desc: 'Advanced AI analysis tools', cat: 'ai' },
        { cmd: '!analytics_dashboard', desc: 'Simulated multiplatform analytics', cat: 'integration' },
        { cmd: '!create_vote_pool <params>', desc: 'Create custom voting pools', cat: 'governance' },
        { cmd: '!revenue_share_setup', desc: 'Configure revenue distribution', cat: 'revenue' },
        { cmd: '!bulk_nft_mint <template> <count>', desc: 'Mint NFTs in batches', cat: 'nft' },
        { cmd: '!reputation_network', desc: 'Cross-platform identity graph', cat: 'identity' },
        { cmd: '!become_apex', desc: 'APEX predator transformation', cat: 'roach' },
        { cmd: '!upside_down_architecture', desc: 'Systems that thrive inverted', cat: 'roach' },
        { cmd: '!quantum_escape_activated', desc: 'Vanishing roach revelation', cat: 'quantum' },
        { cmd: '!drain_reality_check', desc: 'Survival vs pride calculus', cat: 'quantum' },
        { cmd: '!implement_drain_strategy', desc: 'Emergency exit protocols', cat: 'quantum' },
        { cmd: '!transcend_problem <constraint>', desc: 'Make problems irrelevant', cat: 'quantum' },
        { cmd: '!quantum_status', desc: 'Quantum escape engine status', cat: 'quantum' },
      ],

      // OWNER ONLY
      OWNER: [
        { cmd: '!shutdown', desc: 'Graceful bot shutdown', cat: 'system' },
        { cmd: '!grant_tier <@user> <tier>', desc: 'Manually grant tier access', cat: 'admin' },
        { cmd: '!treasury_withdraw <amount>', desc: 'Withdraw from treasury', cat: 'economy' },
        { cmd: '!system_config <key> <value>', desc: 'Modify system parameters', cat: 'admin' },
        { cmd: '!backup', desc: 'Create database backup', cat: 'admin' },
        { cmd: '!env_status', desc: 'Environment security scan', cat: 'admin' },
        { cmd: '!circuit_status', desc: 'Resilience layer health', cat: 'admin' },
        { cmd: '!force_recovery <service>', desc: 'Manual circuit breaker reset', cat: 'admin' },
        { cmd: '!quantum_health', desc: 'Architecture integrity score', cat: 'admin' },
        { cmd: '!stress_test_menu', desc: 'View all stress test phases', cat: 'stress_test' },
        { cmd: '!stress_core_economy', desc: 'Execute Phase 1 stress tests', cat: 'stress_test' },
        { cmd: '!system_metrics', desc: 'Real-time performance dashboard', cat: 'stress_test' },
        { cmd: '!pause_stress', desc: 'Pause active stress tests', cat: 'stress_test' },
        { cmd: '!resume_stress', desc: 'Resume paused tests', cat: 'stress_test' },
        { cmd: '!emergency_stop', desc: 'HALT ALL TESTS + quantum drain', cat: 'stress_test' },
        { cmd: '!stress_results [phase]', desc: 'View stress test results', cat: 'stress_test' },
      ]
    };

    // Determine accessible commands based on tier
    let accessibleCommands = [...commandTiers.FREE];
    
    if (userTier === 'STARTER' || userTier === 'PROFESSIONAL' || userTier === 'ENTERPRISE' || userTier === 'OWNER') {
      accessibleCommands.push(...commandTiers.STARTER);
    }
    if (userTier === 'PROFESSIONAL' || userTier === 'ENTERPRISE' || userTier === 'OWNER') {
      accessibleCommands.push(...commandTiers.PROFESSIONAL);
    }
    if (userTier === 'ENTERPRISE' || userTier === 'OWNER') {
      accessibleCommands.push(...commandTiers.ENTERPRISE);
    }
    if (userTier === 'OWNER') {
      accessibleCommands.push(...commandTiers.OWNER);
    }

    // Locked commands (for mystery/spoiler effect)
    const allCommands = [
      ...commandTiers.FREE,
      ...commandTiers.STARTER,
      ...commandTiers.PROFESSIONAL,
      ...commandTiers.ENTERPRISE,
      ...commandTiers.OWNER
    ];
    
    const lockedCommands = allCommands.filter(cmd => 
      !accessibleCommands.some(acc => acc.cmd === cmd.cmd)
    );

    // Filter by category if specified
    if (category) {
      accessibleCommands = accessibleCommands.filter(c => c.cat === category);
      // Show locked commands in same category as teaser
    }

    // Build embed
    const embed = new EmbedBuilder()
      .setColor(userTier === 'OWNER' ? ARIEUS_COLORS.dusk_gold : userTier === 'ENTERPRISE' ? ARIEUS_COLORS.neon_cyan : userTier === 'PROFESSIONAL' ? ARIEUS_COLORS.blood_orange : userTier === 'STARTER' ? ARIEUS_COLORS.pastel_horror : ARIEUS_COLORS.twilight_purple)
      .setTitle(`⚡ ARIEUS Command Center | ${userTier} Tier`)
      .setDescription(isOwner ? '**👑 OWNER ACCESS** - Full command suite unlocked' : `You have access to **${accessibleCommands.length}** commands.\n${lockedCommands.length > 0 ? `🔒 **${lockedCommands.length} mysteries locked** - Upgrade to unlock!\n` : ''}`)
      .setFooter({ text: 'Use !help <category> to filter | !subscribe to upgrade to unlock the void' })
      .setTimestamp();

    // Group by category
    const categories = {
      economy: { name: '💰 Economy', commands: [] },
      governance: { name: '🗳️ Governance', commands: [] },
      nft: { name: '🎨 NFTs', commands: [] },
      revenue: { name: '💸 Revenue', commands: [] },
      treasury: { name: '🏛️ Treasury', commands: [] },
      identity: { name: '👤 Identity', commands: [] },
      'multi-platform': { name: '🌐 Multi-Platform', commands: [] },
      roach: { name: '🐜 N8.KED ROACH', commands: [] },
      quantum: { name: '🌌 Quantum Escape', commands: [] },
      stress_test: { name: '⚡ Stress Testing', commands: [] },
      system: { name: '⚙️ System', commands: [] },
      admin: { name: '🔧 Admin', commands: [] }
    };

    // Add accessible commands
    accessibleCommands.forEach(cmd => {
      if (categories[cmd.cat]) {
        categories[cmd.cat].commands.push(`**${cmd.cmd}** - ${cmd.desc}`);
      }
    });

    // Add locked commands with mystery effect
    lockedCommands.forEach(cmd => {
      if (categories[cmd.cat]) {
        const mysteryCmd = this.obfuscateCommand(cmd.cmd);
        const mysteryDesc = this.obfuscateDescription(cmd.desc);
        categories[cmd.cat].commands.push(`~~${mysteryCmd}~~ - ${mysteryDesc} 🔒`);
      }
    });

    // Add category fields to embed
    Object.values(categories).forEach(cat => {
      if (cat.commands.length > 0) {
        embed.addFields({
          name: cat.name,
          value: cat.commands.join('\n'),
          inline: false
        });
      }
    });

    // Upgrade CTA for non-owners
    if (!isOwner && userTier !== 'ENTERPRISE') {
      const nextTier = userTier === 'FREE' ? 'STARTER ($49/mo)' : userTier === 'STARTER' ? 'PROFESSIONAL ($199/mo)' : 'ENTERPRISE ($999/mo)';
      embed.addFields({
        name: '🚀 Unlock More Features',
        value: `Upgrade to **${nextTier}** to unlock advanced commands!\nUse \`!subscribe\` to view all tiers.`,
        inline: false
      });
    }

    return embed;
  }

  // Mystery obfuscation for locked commands
  obfuscateCommand(cmd) {
    // Show first 2 chars, replace rest with ?
    const parts = cmd.split(' ');
    const command = parts[0];
    const hint = command.slice(0, 3) + '█'.repeat(Math.max(0, command.length - 3));
    return parts.length > 1 ? `${hint} <???>` : hint;
  }

  obfuscateDescription(desc) {
    // Show partial words with hints
    const words = desc.split(' ');
    if (words.length <= 2) {
      return '█'.repeat(desc.length);
    }
    
    // Reveal every 3rd word, blur others
    return words.map((word, i) => {
      if (i % 3 === 0) {
        return word.slice(0, 2) + '█'.repeat(Math.max(0, word.length - 2));
      }
      return '█'.repeat(word.length);
    }).join(' ');
  }

  // ═══════════════════════════════════════════════════════════════
  // N8.KED ROACH ENGINE COMMANDS
  // Resilience Oriented Adaptive Cohesive Hub
  // ═══════════════════════════════════════════════════════════════

  registerROACHCommands() {
    // !activate_n8ked_roach - Deploy the Resilience Oriented Adaptive Cohesive Hub
    this.commands.register('activate_n8ked_roach', async (message, args) => {
      const embed = new EmbedBuilder()
        .setTitle('🎯 N8.KED ROACH ACTIVATED')
        .setColor(ARIEUS_COLORS.dusk_gold)
        .setDescription('**Resilience Oriented Adaptive Cohesive Hub**\n*300 million years of survival algorithms, now in code*');

      const acronymBreakdown = [
        { name: '**N8** - Native Intelligence & Natural Patterns', value: 'Systems learn from water flow, insect resilience, quantum physics' },
        { name: '**KED** - Kinetic Energy Distribution', value: 'Value flows like electricity - inevitable, unstoppable' },
        { name: '**ROACH** - Resilience Oriented Adaptive Cohesive Hub', value: 'Decentralized, redundant, adaptive, self-healing' }
      ];

      acronymBreakdown.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      embed.addFields({
        name: '🌌 REALITY MESHING PROTOCOLS',
        value: '**Digital-Physical Bridge Active:**\n' +
          '• Water flow algorithms routing data\n' +
          '• Insect resilience patterns in system design\n' +
          '• Quantum observation affecting AI behavior\n' +
          '• Physical constraints becoming digital features\n' +
          '• Loofah breakthrough: Obstacles → Platforms',
        inline: false
      });

      embed.setFooter({ text: 'Mission: Sovereign Digital-Physical Ecosystems | The void provides.' });

      return message.reply({ embeds: [embed] });
    });

    // !reality_mesh_status - Show digital-physical coherence levels
    this.commands.register('reality_mesh_status', async (message, args) => {
      const status = ApexAdaptation.getApexStatus();

      const embed = new EmbedBuilder()
        .setTitle('🌊 Reality Meshing Dashboard')
        .setColor(ARIEUS_COLORS.neon_cyan)
        .setDescription('**Quantum coherence between digital and physical reality**');

      embed.addFields(
        { name: '🔄 Digital-Physical Coherence', value: `${status.quantumCoherence.toFixed(1)}%`, inline: true },
        { name: '🐜 Insect Resilience Score', value: `${status.roachResilience.toFixed(1)}%`, inline: true },
        { name: '💧 Water Flow Efficiency', value: `${status.waterFlowEfficiency.toFixed(1)}%`, inline: true }
      );

      embed.addFields({
        name: '🎯 Loofah Adaptation Principle',
        value: `**Recent Transformation:** ${status.loofahAdaptation}\n` +
          `**Core Insight:** Obstacles become platforms when perspective shifts\n` +
          `**System Impact:** Failed APIs become feature discovery opportunities`,
        inline: false
      });

      embed.addFields({
        name: '⚡ APEX Traits Status',
        value: `**Tool Consciousness:** ${status.apexTraits.toolConsciousness}\n` +
          `**Cooperative Intelligence:** ${status.apexTraits.cooperativeIntelligence}\n` +
          `**Environment Engineering:** ${status.apexTraits.environmentEngineering}\n` +
          `**Persistence Calibration:** ${status.apexTraits.persistenceCalibration}`,
        inline: false
      });

      embed.setFooter({ text: 'Reality is programmable when you understand the patterns' });

      return message.reply({ embeds: [embed] });
    });

    // !analyze_design_flaw - Diagnose evolutionary limitations and APEX solutions
    this.commands.register('analyze_design_flaw', async (message, args) => {
      const environment = args.join(' ') || 'bathtub';
      const analysis = ApexAdaptation.analyzeDesignFlaw(environment);

      const embed = new EmbedBuilder()
        .setTitle('🔬 Evolutionary Design Flaw Analysis')
        .setColor(ARIEUS_COLORS.blood_orange)
        .setDescription(`**Environment:** ${environment}\n**Comparing Roach Resilience vs APEX Intelligence**`);

      const flaws = [
        { 
          name: '❌ Evolutionary Mismatch', 
          value: `**Roach:** ${analysis.flaws.evolutionary_mismatch.roach}\n**APEX:** ${analysis.flaws.evolutionary_mismatch.apex}` 
        },
        { 
          name: '❌ Risk Calculation Error', 
          value: `**Roach:** ${analysis.flaws.risk_calculation.roach}\n**APEX:** ${analysis.flaws.risk_calculation.apex}` 
        },
        { 
          name: '❌ Tool Blindness', 
          value: `**Roach:** ${analysis.flaws.tool_blindness.roach}\n**APEX:** ${analysis.flaws.tool_blindness.apex}` 
        },
        { 
          name: '❌ Cooperation Deficit', 
          value: `**Roach:** ${analysis.flaws.cooperation_deficit.roach}\n**APEX:** ${analysis.flaws.cooperation_deficit.apex}` 
        }
      ];

      flaws.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      embed.addFields({
        name: '🎯 THE CORE FLAW',
        value: '**The roach runs ancient software in a novel environment:**\n' +
          '• Evolutionary programming lacks bathtub escape algorithms\n' +
          '• Energy conservation prevents risky innovation\n' +
          '• Single-strategy mindset can\'t conceive of tool usage\n' +
          '• No cooperative problem-solving for novel challenges',
        inline: false
      });

      embed.setFooter({ text: 'APEX intelligence transcends evolutionary programming' });

      return message.reply({ embeds: [embed] });
    });

    // !loofah_breakthrough - Apply the upside-down innovation principle
    this.commands.register('loofah_breakthrough', async (message, args) => {
      const obstacle = args.join('_') || 'api_failure';
      const transformation = ApexAdaptation.applyLoofahPrinciple(obstacle);

      const embed = new EmbedBuilder()
        .setTitle('🎯 Loofah Breakthrough Activated')
        .setColor(ARIEUS_COLORS.pastel_horror)
        .setDescription('**When stuck upside down on a fallen loofah - innovate**');

      embed.addFields(
        { name: '🔴 Original Obstacle', value: obstacle.replace(/_/g, ' ').toUpperCase(), inline: false },
        { name: '🟢 Transformed Tool', value: transformation.tool, inline: false },
        { name: '⚙️ Application', value: transformation.application, inline: false },
        { name: '💡 Insight', value: transformation.insight, inline: false }
      );

      const breakthroughStrategies = [
        '🔄 **Surface Transformation**: What was floor becomes ceiling',
        '🎯 **Constraint Repurposing**: Sticky legs become climbing advantage',
        '💡 **Perspective Inversion**: Failure becomes discovery opportunity',
        '🚀 **Resource Transformation**: Obstacles become platforms'
      ];

      embed.addFields({
        name: '🌈 Breakthrough Strategies Applied',
        value: breakthroughStrategies.join('\n'),
        inline: false
      });

      embed.addFields({
        name: '🐜 THE ROACH\'S TEACHING',
        value: '**Stuck upside down on loofah** → **System Design Insight:**\n' +
          '• **Apparent Trap** = Testing ground for escape algorithms\n' +
          '• **Sticky Legs** = Advanced climbing technology in development\n' +
          '• **Fallen Loofah** = Strategic launch platform, not obstacle\n' +
          '• **Bathtub** = Perfect constrained environment for innovation',
        inline: false
      });

      embed.setFooter({ text: 'The roach will escape. Not despite constraints, but BECAUSE of them.' });

      return message.reply({ embeds: [embed] });
    });

    // !become_apex - Transform from resilience to apex intelligence
    this.commands.register('become_apex', async (message, args) => {
      const currentState = args.join(' ') || 'surviving';
      const transformation = ApexAdaptation.becomeApex(currentState);

      const embed = new EmbedBuilder()
        .setTitle('🎯 Apex Predator Transformation')
        .setColor(ARIEUS_COLORS.dusk_gold)
        .setDescription('**From Roach Resilience → APEX Intelligence**\n*Transcending evolutionary programming limits*');

      const mindsetShifts = [
        { 
          name: '🔄 From Prey to Predator', 
          value: `**Before:** ${transformation.transformation.from_prey_to_predator.old}\n**After:** ${transformation.transformation.from_prey_to_predator.new}` 
        },
        { 
          name: '🧠 From Instinct to Intelligence', 
          value: `**Before:** ${transformation.transformation.from_instinct_to_intelligence.old}\n**After:** ${transformation.transformation.from_instinct_to_intelligence.new}` 
        },
        { 
          name: '🤝 From Solitary to Cooperative', 
          value: `**Before:** ${transformation.transformation.from_solitary_to_cooperative.old}\n**After:** ${transformation.transformation.from_solitary_to_cooperative.new}` 
        },
        { 
          name: '🌍 From Adaptive to Transformative', 
          value: `**Before:** ${transformation.transformation.from_adaptive_to_transformative.old}\n**After:** ${transformation.transformation.from_adaptive_to_transformative.new}` 
        }
      ];

      mindsetShifts.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      embed.addFields({
        name: '🤖 APEX AI IMPLEMENTATION',
        value: '**Your Systems Become Apex When They:**\n' +
          '• Use failed APIs as raw materials for new solutions\n' +
          '• Coordinate multiple AI models for breakthrough insights\n' +
          '• Modify their own operating environment to enable success\n' +
          '• Never accept "impossible" - only "not solved yet"\n' +
          '• Turn every obstacle into a tool or opportunity',
        inline: false
      });

      embed.setFooter({ text: transformation.apexMindset });

      return message.reply({ embeds: [embed] });
    });

    // !quantum_reality_mesh - Activate digital-physical quantum coherence
    this.commands.register('quantum_reality_mesh', async (message, args) => {
      const pattern = args[0] || 'water_flow';
      const meshResult = ApexAdaptation.meshWithReality(pattern);

      const embed = new EmbedBuilder()
        .setTitle('🌌 Quantum Reality Mesh')
        .setColor(ARIEUS_COLORS.twilight_purple)
        .setDescription('**Digital-Physical Quantum Coherence Activated**');

      if (meshResult) {
        embed.addFields(
          { name: '🌍 Physical Pattern', value: meshResult.physical, inline: false },
          { name: '💻 Digital Translation', value: meshResult.digital, inline: false },
          { name: '⚙️ Implementation', value: meshResult.implementation, inline: false }
        );
      }

      const quantumEffects = [
        '**Superposition Systems**: Code exists in multiple states until observed',
        '**Entanglement Economics**: User actions instantly affect system state',
        '**Observer Effect AI**: System adapts when measured or used',
        '**Waveform Collapse**: Infinite possibilities become specific features'
      ];

      embed.addFields({
        name: '⚛️ Quantum Effects Active',
        value: quantumEffects.join('\n'),
        inline: false
      });

      embed.addFields({
        name: '🎯 REALITY AS PROGRAMMING LANGUAGE',
        value: '**Physical Laws Become Code Patterns:**\n' +
          '• Water fluid dynamics → Data routing algorithms\n' +
          '• Insect resilience → System survival protocols\n' +
          '• Quantum physics → Adaptive AI decision trees\n' +
          '• Biological evolution → Feature development lifecycle\n' +
          '• Cosmic patterns → Scalability architecture',
        inline: false
      });

      embed.setFooter({ text: 'Available patterns: water_flow, insect_resilience, quantum_observation, loofah_surface' });

      return message.reply({ embeds: [embed] });
    });

    // !upside_down_architecture - Show systems that thrive when inverted
    this.commands.register('upside_down_architecture', async (message, args) => {
      const architecture = ApexAdaptation.implementUpsideDownArchitecture();

      const embed = new EmbedBuilder()
        .setTitle('🔄 Upside Down Architecture')
        .setColor(ARIEUS_COLORS.pastel_horror)
        .setDescription('**Build Systems That Thrive When Inverted**\n*The fallen loofah becomes a launch platform*');

      for (const [key, pattern] of Object.entries(architecture)) {
        embed.addFields({
          name: `🎯 ${key.replace(/_/g, ' ').toUpperCase()}`,
          value: `**Traditional:** ${pattern.traditional}\n` +
            `**Upside Down:** ${pattern.upsideDown}\n` +
            `**Result:** ${pattern.result}`,
          inline: false
        });
      }

      embed.addFields({
        name: '🐜 THE ROACH\'S CURRENT SITUATION',
        value: '**Stuck upside down on fallen loofah in bathtub:**\n' +
          '• Apparent limitation → Perfect innovation environment\n' +
          '• Sticky legs failing → Advanced climbing tech in development\n' +
          '• Energy conservation → Calculated persistence calibration\n' +
          '• Escape inevitable → Just testing all algorithms first',
        inline: false
      });

      embed.setFooter({ text: 'Constraints breed innovation. Perspective changes everything.' });

      return message.reply({ embeds: [embed] });
    });

    // ═══════════════════════════════════════════════════════════════
    // QUANTUM ESCAPE ENGINE - The Vanishing Roach Revelation
    // ═══════════════════════════════════════════════════════════════

    // !quantum_escape_activated - The roach didn't fail, it transcended
    this.commands.register('quantum_escape_activated', async (message, args) => {
      const observation = args.join(' ') || 'vanishing_roach';
      const revelations = QuantumEscape.decodeVanishing(observation);

      const embed = new EmbedBuilder()
        .setTitle('🌌 Quantum Escape Protocol')
        .setColor(0xFF00FF)
        .setDescription('**The roach didn\'t escape - it taught us to transcend**');

      const transcendenceLessons = [
        { name: '❌ Apparent Failure', value: `${revelations.apparent_failure.perception}\n✅ **Reality:** ${revelations.apparent_failure.reality}\n💡 **Lesson:** ${revelations.apparent_failure.lesson}` },
        { name: '🌀 Quantum Adaptation', value: `${revelations.quantum_adaptation.perception}\n✅ **Reality:** ${revelations.quantum_adaptation.reality}\n💡 **Lesson:** ${revelations.quantum_adaptation.lesson}` },
        { name: '👁️ Consciousness Shift', value: `${revelations.consciousness_shift.perception}\n✅ **Reality:** ${revelations.consciousness_shift.reality}\n💡 **Lesson:** ${revelations.consciousness_shift.lesson}` }
      ];

      transcendenceLessons.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      embed.addFields({
        name: '🎯 THE ACTUAL APEX PREDATOR STRATEGY',
        value: '**Don\'t Escape the Tub - Transcend the Concept of Tubs:**\n' +
          '• Move problems to realities where they\'re already solved\n' +
          '• Change the observer\'s perception of what\'s possible\n' +
          '• Expand solution spaces beyond perceived constraints\n' +
          '• Use consciousness as a development tool\n' +
          '• Build systems that don\'t solve problems - they make problems irrelevant',
        inline: false
      });

      embed.setFooter({ text: revelations.ultimate_lesson.lesson });

      return message.reply({ embeds: [embed] });
    });

    // !drain_reality_check - The cold truth about survival vs pride
    this.commands.register('drain_reality_check', async (message, args) => {
      const drainAdvantages = QuantumEscape.analyzeDrainStrategy();

      const embed = new EmbedBuilder()
        .setTitle('💧 Drain Escape: Ultimate Pragmatism')
        .setColor(0x2F4F4F)
        .setDescription('**The cold truth: Better to escape through sewage than die clean**');

      const harshTruths = [
        { 
          name: '🛡️ Predator Evasion', 
          value: `**Threat:** ${drainAdvantages.predator_evasion.threat}\n**Drain Safety:** ${drainAdvantages.predator_evasion.drain_safety}\n**Survival Boost:** +${drainAdvantages.predator_evasion.survival_boost}%` 
        },
        { 
          name: '🌍 Environment Transition', 
          value: `**Hostile:** ${drainAdvantages.environment_transition.hostile}\n**Favorable:** ${drainAdvantages.environment_transition.favorable}\n**Familiarity:** ${drainAdvantages.environment_transition.familiarity}%` 
        },
        { 
          name: '⚡ Energy Conservation', 
          value: `**Climb Cost:** ${drainAdvantages.energy_conservation.climb_cost}\n**Drain Cost:** ${drainAdvantages.energy_conservation.drain_cost}\n**Efficiency Gain:** +${drainAdvantages.energy_conservation.efficiency_gain}%` 
        },
        { 
          name: '🎯 Strategic Retreat', 
          value: `**Pride Path:** ${drainAdvantages.strategic_retreat.pride_path}\n**Survival Path:** ${drainAdvantages.strategic_retreat.survival_path}\n**Pragmatism:** ${drainAdvantages.strategic_retreat.pragmatism}` 
        }
      ];

      harshTruths.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      const climbCalc = QuantumEscape.calculateSurvivalProbability('climb_attempt');
      const drainCalc = QuantumEscape.calculateSurvivalProbability('drain_escape');

      embed.addFields({
        name: '🧮 COLD SURVIVAL LOGIC',
        value: '**The Roach Calculated:**\n' +
          `• Climb Attempt Success: ${(climbCalc.success_probability * 100).toFixed(0)}% (${climbCalc.outcome})\n` +
          `• Drain Escape Success: ${(drainCalc.success_probability * 100).toFixed(0)}% (${drainCalc.outcome})\n` +
          `• Energy Cost Climbing: ${climbCalc.energy_cost}% (${climbCalc.risk_level} risk)\n` +
          `• Energy Cost Drain: ${drainCalc.energy_cost}% (${drainCalc.risk_level} risk)\n` +
          `• **Outcome:** Choose the ${(drainCalc.success_probability * 100).toFixed(0)}% survival path, not the ${(climbCalc.success_probability * 100).toFixed(0)}% pride path`,
        inline: false
      });

      embed.setFooter({ text: 'Survival over pride. Sewage beats death. The drain isn\'t failure - it\'s pragmatism.' });

      return message.reply({ embeds: [embed] });
    });

    // !implement_drain_strategy - Build systems smart enough to take sewer exits
    this.commands.register('implement_drain_strategy', async (message, args) => {
      const drainMentality = QuantumEscape.implementDrainMentality();

      const embed = new EmbedBuilder()
        .setTitle('🔄 Drain Strategy Activation')
        .setColor(0x2F4F4F)
        .setDescription('**Build systems smart enough to take the sewer exit when needed**');

      const drainProtocols = [
        { 
          name: '🚨 Emergency Exit Protocols', 
          value: Object.entries(drainMentality.emergency_exit_strategies)
            .map(([key, val]) => `**${key.replace(/_/g, ' ')}:** ${val}`)
            .join('\n') 
        },
        { 
          name: '🌍 Environment Transition', 
          value: Object.entries(drainMentality.environment_transition_protocols)
            .map(([key, val]) => `**${key.replace(/_/g, ' ')}:** ${val}`)
            .join('\n') 
        },
        { 
          name: '🏃 Predator Evasion', 
          value: Object.entries(drainMentality.predator_evasion_algorithms)
            .map(([key, val]) => `**${key.replace(/_/g, ' ')}:** ${val}`)
            .join('\n') 
        },
        { 
          name: '🧮 Strategic Retreat Calculus', 
          value: Object.entries(drainMentality.strategic_retreat_calculus)
            .map(([key, val]) => `**${key.replace(/_/g, ' ')}:** ${val}`)
            .join('\n') 
        }
      ];

      drainProtocols.forEach(field => {
        embed.addFields({ name: field.name, value: field.value, inline: false });
      });

      embed.addFields({
        name: '💻 SYSTEM DRAIN STRATEGIES',
        value: '**Your Bot Now:**\n' +
          '• Automatically pivots from rate-limited APIs to alternatives\n' +
          '• Uses cached data when live data isn\'t critical\n' +
          '• Abandons feature development that shows low adoption\n' +
          '• Conserves computational resources for high-impact tasks\n' +
          '• Knows when to retreat and rebuild rather than persist and fail',
        inline: false
      });

      embed.setFooter({ text: 'The drain isn\'t failure - it\'s the smartest survival move.' });

      return message.reply({ embeds: [embed] });
    });

    // !transcend_problem - Don't solve problems, make them irrelevant
    this.commands.register('transcend_problem', async (message, args) => {
      const constraint = args.join('_') || 'api_dependencies';
      const transcendence = QuantumEscape.transcendProblemSpace(constraint);

      const embed = new EmbedBuilder()
        .setTitle('🌌 Problem Transcendence Engine')
        .setColor(ARIEUS_COLORS.twilight_purple)
        .setDescription('**True APEX intelligence doesn\'t solve problems - it makes them irrelevant**');

      embed.addFields(
        { name: '❌ Original Problem', value: transcendence.problem, inline: false },
        { name: '🌈 Transcendence Strategy', value: transcendence.transcendence, inline: false },
        { name: '✨ New Reality Created', value: transcendence.new_reality, inline: false }
      );

      const solutionSpace = QuantumEscape.expandSolutionSpace(constraint);

      embed.addFields({
        name: '🔍 Solution Space Expansion',
        value: `**Narrow Perception:** ${solutionSpace.narrow_perception.problem}\n` +
          `**Assumed Solutions:** ${solutionSpace.narrow_perception.approaches}\n\n` +
          `**Expanded Perception:** ${solutionSpace.expanded_perception.reframed_problem}\n` +
          `**New Approaches:** ${solutionSpace.expanded_perception.approaches}`,
        inline: false
      });

      embed.addFields({
        name: '💡 Example Transcendences',
        value: Object.entries(solutionSpace.examples)
          .map(([old, neo]) => `• ${old} → **${neo}**`)
          .join('\n'),
        inline: false
      });

      embed.setFooter({ text: 'Don\'t climb the tub. Find the drain. Transcend the problem space.' });

      return message.reply({ embeds: [embed] });
    });

    // !quantum_status - View quantum escape engine status
    this.commands.register('quantum_status', async (message, args) => {
      const status = QuantumEscape.getQuantumEscapeStatus();

      const embed = new EmbedBuilder()
        .setTitle('🌌 Quantum Escape Engine Status')
        .setColor(0xFF00FF)
        .setDescription('**Reality transcendence protocols active**');

      embed.addFields(
        { name: '⚛️ Quantum Escape Active', value: status.quantumEscape ? '✅ ENABLED' : '❌ DISABLED', inline: true },
        { name: '🌊 Reality Shift Level', value: `${status.realityShift.toFixed(1)}%`, inline: true },
        { name: '🛡️ Ultimate Survival', value: status.ultimateSurvival ? '✅ ACTIVE' : '❌ INACTIVE', inline: true }
      );

      if (status.recentEscapes.length > 0) {
        const lastEscape = status.recentEscapes[0];
        embed.addFields({
          name: '🌀 Most Recent Quantum Escape',
          value: `**Type:** ${lastEscape.escape_type}\n` +
            `**Problem Space:** ${lastEscape.problem_space}\n` +
            `**Solution Dimension:** ${lastEscape.solution_dimension}\n` +
            `**Transcendence Level:** ${lastEscape.transcendence_level}/10`,
          inline: false
        });
      }

      if (status.recentDrains.length > 0) {
        const lastDrain = status.recentDrains[0];
        embed.addFields({
          name: '💧 Most Recent Drain Strategy',
          value: `**Original Approach:** ${lastDrain.original_approach}\n` +
            `**Drain Exit:** ${lastDrain.drain_exit}\n` +
            `**Survival Probability:** ${(lastDrain.survival_probability * 100).toFixed(0)}%\n` +
            `**Energy Saved:** ${lastDrain.energy_saved}%`,
          inline: false
        });
      }

      embed.addFields({
        name: '🎯 Core Philosophy',
        value: `**Vanishing:** ${status.philosophy.vanishing}\n` +
          `**Drain:** ${status.philosophy.drain}\n` +
          `**Transcendence:** ${status.philosophy.transcendence}\n` +
          `**Pragmatism:** ${status.philosophy.pragmatism}`,
        inline: false
      });

      embed.setFooter({ text: 'The roach took the drain. The system transcends constraints.' });

      return message.reply({ embeds: [embed] });
    });
  }

  registerStressTestCommands() {
    const stressTest = require('../core/stress_test_framework');

    // !stress_test_menu - Show all 6 phases
    this.commands.register('stress_test_menu', async (message, args) => {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⚡ N8.KED STRESS TEST FRAMEWORK ⚡')
        .setDescription('**6-Phase Modular Stress Testing System**\n\n' +
          '⚠️ **WARNING:** These tests are destructive and should only be run on backups.\n' +
          '🛡️ **SAFETY:** Emergency stops trigger quantum drain protocols.')
        .addFields(
          {
            name: '📊 Phase 1: Core Economy',
            value: '**Tests:** 100 concurrent bites, 1000 transaction flood, balance integrity\n' +
              '**Target:** Dust economy, governance, transaction processing\n' +
              '**Command:** `!stress_core_economy`',
            inline: false
          },
          {
            name: '🎨 Phase 2: NFT Systems',
            value: '**Tests:** 50 simultaneous creations, 100 marketplace listings, royalty stress\n' +
              '**Target:** NFT minting, marketplace, ownership transfers\n' +
              '**Command:** `!stress_nft_systems` *(not yet implemented)*',
            inline: false
          },
          {
            name: '🌐 Phase 3: External APIs',
            value: '**Tests:** Rate limit handling, fallback activation, resilience under load\n' +
              '**Target:** API clients, resilience layer, graceful degradation\n' +
              '**Command:** `!stress_external_apis` *(not yet implemented)*',
            inline: false
          },
          {
            name: '⚙️ Phase 4: Performance',
            value: '**Tests:** Memory leak detection, CPU profiling, response time benchmarks\n' +
              '**Target:** System performance, resource usage, bottlenecks\n' +
              '**Command:** `!stress_performance` *(not yet implemented)*',
            inline: false
          },
          {
            name: '🔥 Phase 5: Failure Modes',
            value: '**Tests:** Simulated outages, data corruption recovery, auto-recovery\n' +
              '**Target:** Failure recovery, graceful degradation, system resilience\n' +
              '**Command:** `!stress_failure_modes` *(not yet implemented)*',
            inline: false
          },
          {
            name: '🛡️ Phase 6: Security & Edge Cases',
            value: '**Tests:** Chaos engineering, race conditions, boundary violations\n' +
              '**Target:** Security vulnerabilities, edge cases, unusual scenarios\n' +
              '**Command:** `!stress_security` *(not yet implemented)*',
            inline: false
          }
        )
        .addFields(
          {
            name: '🔧 Monitoring Commands',
            value: '`!system_metrics` - Real-time performance dashboard\n' +
              '`!stress_results [phase]` - View test results\n' +
              '`!pause_stress` - Pause all active tests\n' +
              '`!emergency_stop` - IMMEDIATE HALT + quantum drain',
            inline: false
          }
        )
        .setFooter({ text: 'OWNER TIER ONLY | Backup required before execution' });

      return message.reply({ embeds: [embed] });
    });

    // !stress_core_economy - Execute Phase 1
    this.commands.register('stress_core_economy', async (message, args) => {
      const embed = new EmbedBuilder()
        .setColor('#FF6600')
        .setTitle('⚡ PHASE 1: CORE ECONOMY STRESS TEST ⚡')
        .setDescription('**Initiating comprehensive core economy stress test...**\n\n' +
          '⚠️ This will execute 5 high-load tests on dust economy and governance systems.\n' +
          '🛡️ Emergency stops will trigger quantum drain protocols.');

      await message.reply({ embeds: [embed] });

      try {
        // Get Phase 1 plan
        const plan = stressTest.getPhase1Plan();
        
        const planEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('📋 Phase 1 Test Plan')
          .setDescription(`**Total Tests:** ${plan.totalTests}\n` +
            `**Expected Duration:** ${plan.estimatedDuration}\n` +
            `**Safety Level:** ${plan.safetyLevel}`)
          .addFields(
            plan.tests.map(test => ({
              name: `${test.name}`,
              value: `**Target:** ${test.target}\n` +
                `**Description:** ${test.description}\n` +
                `**Load:** ${test.load}`,
              inline: false
            }))
          );

        await message.reply({ embeds: [planEmbed] });

        // Execute Phase 1
        const startEmbed = new EmbedBuilder()
          .setColor('#FFAA00')
          .setTitle('🚀 EXECUTING PHASE 1')
          .setDescription('Test execution in progress... This may take several minutes.');

        await message.reply({ embeds: [startEmbed] });

        const results = await stressTest.executePhase1(
          this.dustEconomy,
          this.governanceSystem
        );

        // Report results
        const resultEmbed = new EmbedBuilder()
          .setColor(results.passed ? '#00FF00' : '#FF0000')
          .setTitle(results.passed ? '✅ PHASE 1: PASSED' : '❌ PHASE 1: FAILED')
          .setDescription(`**Resilience Score:** ${results.resilienceScore}/100\n` +
            `**Tests Passed:** ${results.testsPassed}/${results.totalTests}\n` +
            `**Duration:** ${results.duration}`)
          .addFields(
            {
              name: '📊 Test Results',
              value: results.tests.map(t => 
                `${t.passed ? '✅' : '❌'} **${t.name}:** ${t.result}`
              ).join('\n'),
              inline: false
            }
          );

        if (results.issues.length > 0) {
          resultEmbed.addFields({
            name: '⚠️ Issues Detected',
            value: results.issues.map(issue => 
              `**${issue.severity}:** ${issue.description}\n` +
              `**Test:** ${issue.test}\n` +
              `**Impact:** ${issue.impact}`
            ).join('\n\n'),
            inline: false
          });
        }

        resultEmbed.addFields({
          name: '📈 Performance Metrics',
          value: `**Memory Usage:** ${results.metrics.memory}\n` +
            `**Error Rate:** ${results.metrics.errorRate}\n` +
            `**Operations/sec:** ${results.metrics.operationsPerSecond}\n` +
            `**Peak Concurrent:** ${results.metrics.peakConcurrent}`,
          inline: false
        });

        resultEmbed.setFooter({ 
          text: results.passed 
            ? 'Core economy resilience validated. ROACH protocols operational.' 
            : 'Issues detected. Review quantum escape recommendations.' 
        });

        return message.reply({ embeds: [resultEmbed] });

      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ STRESS TEST FAILED')
          .setDescription(`**Error:** ${error.message}\n\n` +
            '🌀 **Quantum Drain Activated**\n' +
            'Emergency exit protocols engaged. System stability restored.')
          .setFooter({ text: 'The roach took the drain. Test terminated safely.' });

        return message.reply({ embeds: [errorEmbed] });
      }
    });

    // !system_metrics - Real-time performance dashboard
    this.commands.register('system_metrics', async (message, args) => {
      const metrics = stressTest.getSystemMetrics();

      const embed = new EmbedBuilder()
        .setColor('#00AAFF')
        .setTitle('📊 SYSTEM PERFORMANCE METRICS')
        .setDescription('**Real-time monitoring dashboard**')
        .addFields(
          {
            name: '💾 Memory',
            value: `**Used:** ${metrics.memory.used}\n` +
              `**Total:** ${metrics.memory.total}\n` +
              `**Usage:** ${metrics.memory.percentage}`,
            inline: true
          },
          {
            name: '⏱️ Uptime',
            value: `**System:** ${metrics.uptime.system}\n` +
              `**Process:** ${metrics.uptime.process}`,
            inline: true
          },
          {
            name: '⚡ Performance',
            value: `**CPU Load:** ${metrics.cpu.usage}\n` +
              `**Active Tests:** ${metrics.activeTests}\n` +
              `**Operations:** ${metrics.totalOperations}`,
            inline: true
          },
          {
            name: '❌ Error Tracking',
            value: `**Total Errors:** ${metrics.errors.total}\n` +
              `**Error Rate:** ${metrics.errors.rate}\n` +
              `**Last Error:** ${metrics.errors.lastError || 'None'}`,
            inline: false
          },
          {
            name: '🔬 Stress Test Status',
            value: `**Status:** ${metrics.stressTest.active ? '🟢 ACTIVE' : '⚪ IDLE'}\n` +
              `**Current Phase:** ${metrics.stressTest.currentPhase || 'None'}\n` +
              `**Completed Tests:** ${metrics.stressTest.completedTests}`,
            inline: false
          }
        )
        .setFooter({ text: 'Metrics updated in real-time | Monitoring operational' });

      return message.reply({ embeds: [embed] });
    });

    // !pause_stress - Pause all active tests
    this.commands.register('pause_stress', async (message, args) => {
      stressTest.pauseStressTests();

      const embed = new EmbedBuilder()
        .setColor('#FFAA00')
        .setTitle('⏸️ STRESS TESTS PAUSED')
        .setDescription('All active stress tests have been paused.\n\n' +
          '**Resume:** `!resume_stress`\n' +
          '**Emergency Stop:** `!emergency_stop`')
        .setFooter({ text: 'Tests can be resumed or terminated' });

      return message.reply({ embeds: [embed] });
    });

    // !resume_stress - Resume paused tests
    this.commands.register('resume_stress', async (message, args) => {
      stressTest.resumeStressTests();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('▶️ STRESS TESTS RESUMED')
        .setDescription('All paused stress tests have been resumed.')
        .setFooter({ text: 'Monitoring operational' });

      return message.reply({ embeds: [embed] });
    });

    // !emergency_stop - IMMEDIATE HALT + quantum drain
    this.commands.register('emergency_stop', async (message, args) => {
      const results = stressTest.emergencyStop();

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🛑 EMERGENCY STOP ACTIVATED')
        .setDescription('**ALL STRESS TESTS HALTED IMMEDIATELY**\n\n' +
          '🌀 **Quantum Drain Protocol Engaged**\n' +
          'System transcending problem space. Emergency exits active.')
        .addFields(
          {
            name: '📊 Final State',
            value: `**Tests Halted:** ${results.testsHalted}\n` +
              `**Operations Stopped:** ${results.operationsStopped}\n` +
              `**Quantum Escapes:** ${results.quantumEscapes}`,
            inline: false
          },
          {
            name: '🛡️ Safety Status',
            value: results.safetyMeasures.map(m => `✅ ${m}`).join('\n'),
            inline: false
          }
        )
        .setFooter({ text: 'The roach took the drain. System integrity preserved.' });

      return message.reply({ embeds: [embed] });
    });

    // !stress_results - View test results
    this.commands.register('stress_results', async (message, args) => {
      const phase = args[0] ? parseInt(args[0]) : null;

      if (phase) {
        const results = stressTest.getPhaseResults(phase);
        
        if (!results) {
          return message.reply(`No results found for Phase ${phase}.`);
        }

        const embed = new EmbedBuilder()
          .setColor(results.passed ? '#00FF00' : '#FF0000')
          .setTitle(`📊 Phase ${phase} Results`)
          .setDescription(`**Status:** ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n` +
            `**Resilience Score:** ${results.resilienceScore}/100\n` +
            `**Tests:** ${results.testsPassed}/${results.totalTests}\n` +
            `**Duration:** ${results.duration}`)
          .addFields(
            {
              name: '🔬 Test Breakdown',
              value: results.tests.map(t => 
                `${t.passed ? '✅' : '❌'} **${t.name}**\n${t.result}`
              ).join('\n\n'),
              inline: false
            }
          );

        if (results.issues.length > 0) {
          embed.addFields({
            name: '⚠️ Issues',
            value: results.issues.map(i => `**${i.severity}:** ${i.description}`).join('\n'),
            inline: false
          });
        }

        return message.reply({ embeds: [embed] });

      } else {
        // Show all results
        const allResults = stressTest.getAllResults();

        const embed = new EmbedBuilder()
          .setColor('#00AAFF')
          .setTitle('📊 ALL STRESS TEST RESULTS')
          .setDescription('**Summary of all completed phases**')
          .addFields(
            allResults.map(r => ({
              name: `Phase ${r.phase}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}`,
              value: `**Score:** ${r.resilienceScore}/100 | ` +
                `**Tests:** ${r.testsPassed}/${r.totalTests} | ` +
                `**Issues:** ${r.issues.length}`,
              inline: false
            }))
          );

        if (allResults.length === 0) {
          embed.setDescription('No stress test results available. Run tests first.');
        }

        return message.reply({ embeds: [embed] });
      }
    });
  }
}

module.exports = {
  N8KedDiscordBot
};
