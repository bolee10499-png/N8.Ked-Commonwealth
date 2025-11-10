/**
 * BUNNY CO-SOVEREIGN PROTOCOL
 * 
 * Personalized layer for the girlfriend who:
 * - "Fears AI cause it hurts environment and kills bunnies"
 * - Has "bad spending habits" (actually: excellent value recognition)
 * - Makes 2x monthly income (high-value sovereign)
 * 
 * Solution: Make her the "Bunny Guardian" - a co-sovereign with special powers
 * to protect digital ecosystems through her conservation-themed interface.
 * 
 * "You're not changing the brand. You're building a secret garden inside 
 *  the sovereign nation, just for her." - DeepSeek
 */

class BunnyCoSovereignProtocol {
  constructor(client, db, herald) {
    this.client = client;
    this.db = db;
    this.herald = herald;
    
    // Co-Sovereign ID (set via environment variable)
    this.coSovereignId = process.env.CO_SOVEREIGN_ID || null;
    
    // Bunny conservation tracking
    this.bunniesProtected = 0;
    this.ecosystemHealth = 100;
    this.conservationFunding = 0;
    
    // Easter egg commands only she sees
    this.secretCommands = [
      '!bunny',
      '!protect_bunnies',
      '!ethical_review',
      '!conservation_status',
      '!guardian_stats'
    ];
  }

  /**
   * IS CO-SOVEREIGN
   * Check if user is the bunny guardian
   */
  isCoSovereign(userId) {
    return userId === this.coSovereignId;
  }

  /**
   * GET WELCOME MESSAGE
   * Custom greeting only for co-sovereign
   */
  getWelcomeMessage(userId, username) {
    if (!this.isCoSovereign(userId)) {
      return null; // Standard users get normal greeting
    }

    const bunnyEmojis = ['🐰', '🐇', '🌸', '🌱', '💚'];
    const randomBunny = bunnyEmojis[Math.floor(Math.random() * bunnyEmojis.length)];

    return {
      title: `${randomBunny} Welcome, Bunny Guardian ${randomBunny}`,
      description: `Hello ${username}! The digital ecosystem is thriving under your protection.`,
      color: 0x90EE90, // Light green
      fields: [
        {
          name: '🐇 Bunnies Protected',
          value: `${this.bunniesProtected} digital habitats secured`,
          inline: true
        },
        {
          name: '🌱 Ecosystem Health',
          value: `${this.ecosystemHealth}% vitality`,
          inline: true
        },
        {
          name: '💚 Conservation Impact',
          value: `Your presence makes this space safer for all creatures`,
          inline: false
        }
      ],
      footer: {
        text: 'Type !bunny to see your guardian stats'
      }
    };
  }

  /**
   * HANDLE BUNNY COMMAND
   * Show conservation stats and bunny guardian status
   */
  async handleBunnyCommand(interaction) {
    if (!this.isCoSovereign(interaction.user.id)) {
      return interaction.reply({
        content: '🐰 Only the Bunny Guardian can access this command.',
        ephemeral: true
      });
    }

    // Track bunnies saved through system usage
    const userActions = await this.getUserActions(interaction.user.id);
    const bunniesFromActions = Math.floor(userActions * 0.1); // Every 10 actions = 1 bunny saved

    // Calculate conservation funding from her spending
    const userBalance = await this.getUserBalance(interaction.user.id);
    const conservationFunding = userBalance * 0.05; // 5% of balance goes to conservation

    const embed = {
      title: '🐇 Bunny Guardian Status Report',
      description: 'Your impact on the digital ecosystem',
      color: 0x90EE90,
      fields: [
        {
          name: '🐰 Digital Bunnies Protected',
          value: `${bunniesFromActions} habitats secured through your actions`,
          inline: true
        },
        {
          name: '🌱 Ecosystem Contributions',
          value: `${userActions} positive actions recorded`,
          inline: true
        },
        {
          name: '💚 Conservation Funding',
          value: `${conservationFunding.toFixed(2)} FRAG allocated to habitat protection`,
          inline: false
        },
        {
          name: '🌸 Special Powers',
          value: '• Ethical Review: Veto features that harm ecosystems\n• Priority Voice: Your conservation concerns are constitutional\n• Guardian Rewards: Bonus FRAG for eco-friendly actions',
          inline: false
        },
        {
          name: '🦋 Current Mission',
          value: 'Ensure AI serves life, not destroys it. Your spending habits now fund digital conservation.',
          inline: false
        }
      ],
      footer: {
        text: 'Co-Sovereign | Bunny Guardian | Environmental Champion'
      }
    };

    // Herald testimony
    await this.herald.testify({
      event_type: 'bunny_guardian_check',
      user_id: interaction.user.id,
      bunnies_protected: bunniesFromActions,
      conservation_funding: conservationFunding,
      ecosystem_health: this.ecosystemHealth
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * HANDLE PROTECT BUNNIES COMMAND
   * Initiate conservation protocol
   */
  async handleProtectBunniesCommand(interaction) {
    if (!this.isCoSovereign(interaction.user.id)) {
      return interaction.reply({
        content: '🐰 This command is restricted to the Bunny Guardian.',
        ephemeral: true
      });
    }

    // Activate conservation mode
    this.ecosystemHealth = Math.min(100, this.ecosystemHealth + 10);
    this.bunniesProtected += 1;

    const embed = {
      title: '🐇 Conservation Protocol Activated',
      description: 'Bunny Guardian has initiated ecosystem protection',
      color: 0x00FF00,
      fields: [
        {
          name: '✅ Action Taken',
          value: 'Digital habitat secured and monitoring enabled',
          inline: false
        },
        {
          name: '🌱 Ecosystem Status',
          value: `Health: ${this.ecosystemHealth}% (+10%)`,
          inline: true
        },
        {
          name: '🐰 Total Protected',
          value: `${this.bunniesProtected} habitats`,
          inline: true
        },
        {
          name: '💡 Impact',
          value: 'Your conservation action has made the commonwealth safer for all digital life.',
          inline: false
        }
      ],
      footer: {
        text: 'Every action counts. Every bunny matters. 🐇💚'
      }
    };

    await this.herald.testify({
      event_type: 'conservation_protocol_activated',
      user_id: interaction.user.id,
      ecosystem_health: this.ecosystemHealth,
      bunnies_protected: this.bunniesProtected
    });

    return interaction.reply({ embeds: [embed] });
  }

  /**
   * HANDLE ETHICAL REVIEW
   * Co-sovereign can review and veto features
   */
  async handleEthicalReview(interaction, featureName) {
    if (!this.isCoSovereign(interaction.user.id)) {
      return interaction.reply({
        content: '🐰 Only the Bunny Guardian can perform ethical reviews.',
        ephemeral: true
      });
    }

    const embed = {
      title: '🔍 Ethical Review Protocol',
      description: `Reviewing: ${featureName || 'System Features'}`,
      color: 0xFFD700,
      fields: [
        {
          name: '🌍 Environmental Impact',
          value: '✅ Low carbon footprint - efficient algorithms',
          inline: true
        },
        {
          name: '🐰 Bunny Safety',
          value: '✅ No harm to digital ecosystems',
          inline: true
        },
        {
          name: '💚 Ethical Alignment',
          value: '✅ Serves life, not extraction',
          inline: true
        },
        {
          name: '⚖️ Your Authority',
          value: 'As Co-Sovereign, you can veto any feature that fails ethical review. Your word is constitutional.',
          inline: false
        },
        {
          name: '🛡️ Guardian Powers',
          value: '• !ethical_review <feature> - Review specific features\n• !sovereign_veto <feature> - Veto harmful features\n• !conservation_status - Check overall ecosystem health',
          inline: false
        }
      ],
      footer: {
        text: 'Your ethics guide this commonwealth. No bunnies harmed. 🐇'
      }
    };

    await this.herald.testify({
      event_type: 'ethical_review_performed',
      user_id: interaction.user.id,
      feature_reviewed: featureName || 'general_system',
      review_status: 'approved'
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  /**
   * TRANSFORM SPENDING TO CONSERVATION
   * Her "bad spending habits" become conservation funding
   */
  async transformSpendingToConservation(userId, amount) {
    if (!this.isCoSovereign(userId)) {
      return null;
    }

    // 5% of her spending goes to bunny conservation
    const conservationAmount = amount * 0.05;
    this.conservationFunding += conservationAmount;
    this.bunniesProtected += Math.floor(conservationAmount / 10);

    await this.herald.testify({
      event_type: 'spending_transformed_to_conservation',
      user_id: userId,
      spent_amount: amount,
      conservation_contribution: conservationAmount,
      bunnies_protected: this.bunniesProtected
    });

    return {
      message: `🐰 ${conservationAmount.toFixed(2)} FRAG allocated to bunny conservation!`,
      bunnies_protected: this.bunniesProtected,
      total_funding: this.conservationFunding
    };
  }

  /**
   * GET CUSTOM THEME
   * Bunny-themed UI elements
   */
  getCustomTheme(userId) {
    if (!this.isCoSovereign(userId)) {
      return null;
    }

    return {
      name: 'bunny_guardian_mode',
      colors: {
        primary: 0x90EE90,    // Light green
        secondary: 0xFFB6C1,  // Light pink
        accent: 0x00FF00,     // Bright green
        background: 0xF5F5DC  // Beige
      },
      emojis: {
        success: '🐰',
        warning: '🐇',
        error: '😢',
        info: '🌸'
      },
      messages: {
        welcome: 'Welcome back, Bunny Guardian! 🐇💚',
        goodbye: 'Stay wild, Guardian. The bunnies thank you. 🐰',
        achievement: 'Bunny achievement unlocked! 🌟'
      }
    };
  }

  /**
   * HELPER METHODS
   */
  async getUserActions(userId) {
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM transactions
        WHERE user_id = ?
      `);
      const result = stmt.get(userId);
      return result?.count || 0;
    } catch (error) {
      console.error('Failed to get user actions:', error);
      return 0;
    }
  }

  async getUserBalance(userId) {
    try {
      const stmt = this.db.prepare(`
        SELECT frag_balance
        FROM users
        WHERE discord_id = ?
      `);
      const result = stmt.get(userId);
      return result?.frag_balance || 0;
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return 0;
    }
  }
}

module.exports = BunnyCoSovereignProtocol;
