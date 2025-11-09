// SERVER ARCHITECT - Discord Channel & Category Management
// Constitutional governance over server structure

const { ChannelType, PermissionFlagsBits } = require('discord.js');

class ServerArchitect {
  constructor(client, herald, security) {
    this.client = client;
    this.herald = herald;
    this.security = security;
  }

  /**
   * Create a category with constitutional testimony
   * @param {Guild} guild - Discord guild
   * @param {string} name - Category name
   * @param {Object} options - Category options (position, permissions)
   * @returns {Object} - Result with category and Herald testimony
   */
  async createCategory(guild, name, options = {}) {
    try {
      const category = await guild.channels.create({
        name: name,
        type: ChannelType.GuildCategory,
        position: options.position || 0,
        permissionOverwrites: options.permissions || []
      });

      // Herald testifies to category creation
      const testimony = this.herald.testify({
        event_type: 'category_created',
        category_name: name,
        category_id: category.id,
        position: category.position,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        category: category,
        testimony: testimony
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a text channel within a category
   * @param {Guild} guild - Discord guild
   * @param {string} name - Channel name
   * @param {Object} options - Channel options (category, permissions, topic)
   * @returns {Object} - Result with channel and Herald testimony
   */
  async createTextChannel(guild, name, options = {}) {
    try {
      const channel = await guild.channels.create({
        name: name,
        type: ChannelType.GuildText,
        parent: options.categoryId || null,
        topic: options.topic || '', // Empty by default - set later via chat
        nsfw: options.nsfw || false,
        permissionOverwrites: options.permissions || []
      });

      // Herald testifies to channel creation (brief)
      const testimony = this.herald.testify({
        event_type: 'channel_created',
        channel_name: name,
        channel_id: channel.id,
        channel_type: 'text',
        category_id: options.categoryId,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        channel: channel,
        testimony: testimony
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a voice channel within a category
   * @param {Guild} guild - Discord guild
   * @param {string} name - Channel name
   * @param {Object} options - Channel options (category, permissions, userLimit)
   * @returns {Object} - Result with channel and Herald testimony
   */
  async createVoiceChannel(guild, name, options = {}) {
    try {
      const channel = await guild.channels.create({
        name: name,
        type: ChannelType.GuildVoice,
        parent: options.categoryId || null,
        userLimit: options.userLimit || 0,
        bitrate: options.bitrate || 64000,
        permissionOverwrites: options.permissions || []
      });

      // Herald testifies to channel creation
      const testimony = this.herald.testify({
        event_type: 'channel_created',
        channel_name: name,
        channel_id: channel.id,
        channel_type: 'voice',
        category_id: options.categoryId,
        user_limit: channel.userLimit,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        channel: channel,
        testimony: testimony
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build complete N8.KED Commonwealth server structure
   * Creates categories and channels according to constitutional design
   * @param {Guild} guild - Discord guild to structure
   * @returns {Object} - Complete build report with Herald testimony
   */
  async buildCommonwealthStructure(guild) {
    const buildLog = [];
    const errors = [];

    try {
      // 1. THE BANNER (Public Gateway)
      const bannerCategory = await this.createCategory(guild, '📜 THE BANNER', { position: 0 });
      buildLog.push(bannerCategory.testimony);

      if (bannerCategory.success) {
        // Welcome & Onboarding
        const welcome = await this.createTextChannel(guild, '👋-welcome', {
          categoryId: bannerCategory.category.id,
          topic: 'First steps into the N8.KED Commonwealth - Read the constitutional testimony'
        });
        buildLog.push(welcome.testimony);

        // Constitutional Testimony Feed
        const herald = await this.createTextChannel(guild, '⚖️-herald-testimony', {
          categoryId: bannerCategory.category.id,
          topic: 'Live constitutional testimony from The Herald - All actions observed'
        });
        buildLog.push(herald.testimony);

        // General Discussion
        const general = await this.createTextChannel(guild, '💬-general', {
          categoryId: bannerCategory.category.id,
          topic: 'General discussion for citizens of the Commonwealth'
        });
        buildLog.push(general.testimony);
      }

      // 2. THE CAPITAL (Active Governance)
      const capitalCategory = await this.createCategory(guild, '🏛️ THE CAPITAL', { position: 1 });
      buildLog.push(capitalCategory.testimony);

      if (capitalCategory.success) {
        // Governance & Proposals
        const governance = await this.createTextChannel(guild, '🗳️-governance', {
          categoryId: capitalCategory.category.id,
          topic: 'Proposal creation, voting, treasury management - Sovereign voice'
        });
        buildLog.push(governance.testimony);

        // Dust Economy
        const economy = await this.createTextChannel(guild, '💎-dust-economy', {
          categoryId: capitalCategory.category.id,
          topic: 'FRAG balance, staking, transactions - Pay-to-Adapt not Pay-to-Win'
        });
        buildLog.push(economy.testimony);

        // NFT Bazaar
        const bazaar = await this.createTextChannel(guild, '🎨-demons-bazaar', {
          categoryId: capitalCategory.category.id,
          topic: 'NFT creation, trading, identity achievements - Reputation-gated access'
        });
        buildLog.push(bazaar.testimony);
      }

      // 3. THE SENTINELS (Security & Validation)
      const sentinelsCategory = await this.createCategory(guild, '🛡️ THE SENTINELS', { position: 2 });
      buildLog.push(sentinelsCategory.testimony);

      if (sentinelsCategory.success) {
        // Security Analysis
        const analysis = await this.createTextChannel(guild, '🔍-security-analysis', {
          categoryId: sentinelsCategory.category.id,
          topic: 'Live security validation and threat intelligence - 5-role consensus'
        });
        buildLog.push(analysis.testimony);

        // System Health
        const health = await this.createTextChannel(guild, '💚-system-health', {
          categoryId: sentinelsCategory.category.id,
          topic: 'Circuit breaker status, resilience metrics, uptime monitoring'
        });
        buildLog.push(health.testimony);
      }

      // 4. THE OBSERVATORY (Analytics & Intelligence)
      const observatoryCategory = await this.createCategory(guild, '🔭 THE OBSERVATORY', { position: 3 });
      buildLog.push(observatoryCategory.testimony);

      if (observatoryCategory.success) {
        // AI Observer Feed
        const observer = await this.createTextChannel(guild, '🤖-ai-observer', {
          categoryId: observatoryCategory.category.id,
          topic: 'AI pattern detection, anomaly reports, emergent behavior analysis'
        });
        buildLog.push(observer.testimony);

        // Metadata Market
        const metadata = await this.createTextChannel(guild, '📊-metadata-market', {
          categoryId: observatoryCategory.category.id,
          topic: 'Processed intelligence for sale - Auto-monetization in action'
        });
        buildLog.push(metadata.testimony);
      }

      // 5. THE ARCHIVES (Historical Record)
      const archivesCategory = await this.createCategory(guild, '📚 THE ARCHIVES', { position: 4 });
      buildLog.push(archivesCategory.testimony);

      if (archivesCategory.success) {
        // Keds Declassified
        const keds = await this.createTextChannel(guild, '👾-keds-declassified', {
          categoryId: archivesCategory.category.id,
          topic: 'Kids Eat Demons - Archive of systemic pattern analysis'
        });
        buildLog.push(keds.testimony);

        // Transaction Ledger
        const ledger = await this.createTextChannel(guild, '📖-transaction-ledger', {
          categoryId: archivesCategory.category.id,
          topic: 'Public economic history - Glass house transparency'
        });
        buildLog.push(ledger.testimony);
      }

      // 6. VOICE CHANNELS
      const voiceCategory = await this.createCategory(guild, '🎙️ VOICE ASSEMBLY', { position: 5 });
      buildLog.push(voiceCategory.testimony);

      if (voiceCategory.success) {
        // General Voice
        const generalVoice = await this.createVoiceChannel(guild, '🗣️ General Assembly', {
          categoryId: voiceCategory.category.id,
          userLimit: 0
        });
        buildLog.push(generalVoice.testimony);

        // Strategy Room (Limited)
        const strategy = await this.createVoiceChannel(guild, '♟️ Strategy Room', {
          categoryId: voiceCategory.category.id,
          userLimit: 10
        });
        buildLog.push(strategy.testimony);

        // Private Council (Owner only)
        const council = await this.createVoiceChannel(guild, '👑 Private Council', {
          categoryId: voiceCategory.category.id,
          userLimit: 5,
          permissions: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ]
        });
        buildLog.push(council.testimony);
      }

      // Generate final Herald testimony for complete build
      const finalTestimony = this.herald.testify({
        event_type: 'commonwealth_structure_built',
        guild_id: guild.id,
        guild_name: guild.name,
        categories_created: buildLog.filter(t => t.event_type === 'category_created').length,
        channels_created: buildLog.filter(t => t.event_type === 'channel_created').length,
        timestamp: new Date().toISOString(),
        build_log: buildLog
      });

      return {
        success: true,
        testimony: finalTestimony,
        categories: buildLog.filter(t => t.event_type === 'category_created').length,
        channels: buildLog.filter(t => t.event_type === 'channel_created').length,
        build_log: buildLog
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        partial_build_log: buildLog
      };
    }
  }

  /**
   * Delete a channel with Herald testimony
   * @param {Channel} channel - Discord channel to delete
   * @param {string} reason - Reason for deletion
   * @returns {Object} - Result with Herald testimony
   */
  async deleteChannel(channel, reason = 'No reason provided') {
    try {
      const channelData = {
        name: channel.name,
        id: channel.id,
        type: channel.type
      };

      await channel.delete(reason);

      const testimony = this.herald.testify({
        event_type: 'channel_deleted',
        channel_name: channelData.name,
        channel_id: channelData.id,
        reason: reason,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        testimony: testimony
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current server structure report
   * @param {Guild} guild - Discord guild
   * @returns {Object} - Complete structure analysis
   */
  async analyzeServerStructure(guild) {
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);

    const structure = {
      guild_name: guild.name,
      guild_id: guild.id,
      total_categories: categories.size,
      total_text_channels: textChannels.size,
      total_voice_channels: voiceChannels.size,
      categories: []
    };

    categories.forEach(category => {
      const categoryData = {
        name: category.name,
        id: category.id,
        position: category.position,
        channels: []
      };

      guild.channels.cache
        .filter(c => c.parentId === category.id)
        .forEach(channel => {
          categoryData.channels.push({
            name: channel.name,
            id: channel.id,
            type: channel.type === ChannelType.GuildText ? 'text' : 'voice'
          });
        });

      structure.categories.push(categoryData);
    });

    return structure;
  }
}

module.exports = ServerArchitect;
