/**
 * COMMAND ALIAS SYSTEM
 * 
 * Three-tier progressive disclosure:
 * - Tier 1 (Simple): User-friendly single words
 * - Tier 2 (Advanced): Detailed options and flags
 * - Tier 3 (Genius): Original complex command names
 * 
 * Makes the system accessible to beginners while preserving
 * the full power for advanced users.
 */

class CommandAliasSystem {
  constructor() {
    // Simple → Complex mappings
    this.simpleAliases = {
      // Economy & Balance
      'balance': 'frag_balance',
      'daily': 'bite',
      'send': 'transfer',
      'give': 'transfer',
      
      // System Operations
      'sync': 'quantum_reality_mesh',
      'scan': 'activate_n8ked_roach',
      'fix': 'loofah_breakthrough',
      'status': 'system_metrics',
      'health': 'quantum_health',
      'boost': 'upside_down_architecture',
      
      // Security
      'secure': 'become_apex',
      'protect': 'implement_drain_strategy',
      'check': 'drain_reality_check',
      
      // Testing
      'test': 'stress_test_menu',
      'run_test': 'stress_core_economy',
      'stop_test': 'emergency_stop',
      
      // NFTs
      'mint': 'create_nft',
      'gallery': 'nft_gallery',
      'sell': 'marketplace_list',
      'buy': 'marketplace_buy',
      
      // Governance
      'vote': 'vote',
      'propose': 'propose',
      
      // Info
      'help': 'help',
      'commands': 'help'
    };

    // Advanced flags (for detailed output)
    this.advancedFlags = {
      'detailed': true,
      'verbose': true,
      'full': true,
      'all': true
    };

    // Deprecated commands (warn users)
    this.deprecatedCommands = [
      'quantum_reality_mesh',
      'activate_n8ked_roach',
      'loofah_breakthrough',
      'become_apex',
      'upside_down_architecture',
      'drain_reality_check',
      'implement_drain_strategy',
      'transcend_problem',
      'quantum_escape_activated',
      'reality_mesh_status',
      'analyze_design_flaw'
    ];
  }

  /**
   * RESOLVE COMMAND
   * Convert user input to actual command name
   */
  resolveCommand(userInput) {
    const parts = userInput.trim().toLowerCase().split(/\s+/);
    const command = parts[0];
    const flags = parts.slice(1);

    // Check if it's a simple alias
    if (this.simpleAliases[command]) {
      return {
        command: this.simpleAliases[command],
        originalInput: command,
        flags: flags,
        tier: 'simple',
        deprecated: false
      };
    }

    // Check if it's a deprecated command
    if (this.deprecatedCommands.includes(command)) {
      return {
        command: command,
        originalInput: command,
        flags: flags,
        tier: 'genius',
        deprecated: true,
        suggestion: this.getSuggestion(command)
      };
    }

    // Otherwise it's either advanced or unknown
    return {
      command: command,
      originalInput: command,
      flags: flags,
      tier: 'advanced',
      deprecated: false
    };
  }

  /**
   * GET SUGGESTION
   * Suggest simple alternative for deprecated command
   */
  getSuggestion(deprecatedCommand) {
    const suggestions = {
      'quantum_reality_mesh': '!sync',
      'activate_n8ked_roach': '!scan',
      'loofah_breakthrough': '!fix',
      'become_apex': '!secure',
      'upside_down_architecture': '!boost',
      'drain_reality_check': '!check',
      'implement_drain_strategy': '!protect',
      'quantum_health': '!health',
      'system_metrics': '!status',
      'stress_test_menu': '!test'
    };

    return suggestions[deprecatedCommand] || null;
  }

  /**
   * GET DEPRECATION WARNING
   * Generate user-friendly warning message
   */
  getDeprecationWarning(resolvedCommand) {
    if (!resolvedCommand.deprecated) return null;

    const suggestion = resolvedCommand.suggestion;
    return {
      title: '⚠️ Deprecated Command',
      message: `\`!${resolvedCommand.command}\` is deprecated and will be removed in v2.0.`,
      suggestion: suggestion ? `Use \`${suggestion}\` instead for simpler syntax.` : null,
      help: 'Type `!help simple` to see all simple commands.'
    };
  }

  /**
   * GET HELP TEXT
   * Generate help based on tier
   */
  getHelpText(tier = 'simple') {
    if (tier === 'simple' || tier === 'basic') {
      return this.getSimpleHelp();
    } else if (tier === 'advanced') {
      return this.getAdvancedHelp();
    } else if (tier === 'genius' || tier === 'all') {
      return this.getGeniusHelp();
    }

    return this.getSimpleHelp();
  }

  getSimpleHelp() {
    return {
      title: '💡 Simple Commands',
      description: 'User-friendly commands for everyday use',
      categories: {
        'Economy': [
          '!balance - Check your fragments',
          '!daily - Claim daily reward',
          '!send @user amount - Transfer fragments'
        ],
        'System': [
          '!status - System health check',
          '!sync - Synchronize all data',
          '!scan - Run security scan',
          '!fix - Auto-solve problems'
        ],
        'NFTs': [
          '!mint template - Create NFT',
          '!gallery - View your collection',
          '!sell nft_id price - List for sale',
          '!buy listing_id - Purchase NFT'
        ],
        'Governance': [
          '!propose title | desc - Create proposal',
          '!vote id yes/no - Vote on proposal'
        ],
        'Help': [
          '!help - Show this menu',
          '!help advanced - Show advanced commands',
          '!help genius - Show all commands'
        ]
      },
      footer: 'Tip: Add "detailed" flag for more info (e.g., !status detailed)'
    };
  }

  getAdvancedHelp() {
    return {
      title: '🔧 Advanced Commands',
      description: 'Power user features with detailed options',
      categories: {
        'System Diagnostics': [
          '!status detailed - Full system metrics',
          '!health - Architecture integrity score',
          '!boost - Performance optimization',
          '!test - Stress test menu'
        ],
        'Security': [
          '!scan deep - Deep security analysis',
          '!secure - Maximum security mode',
          '!protect - Emergency protection',
          '!check - Survival status check'
        ],
        'Testing': [
          '!run_test - Execute stress tests',
          '!stop_test - Emergency stop all tests'
        ]
      },
      footer: 'Type !help genius to see original command names'
    };
  }

  getGeniusHelp() {
    return {
      title: '🧙 Genius Commands (Original Names)',
      description: 'Full command set with original complex names',
      warning: '⚠️ These commands are deprecated. Use simple alternatives instead.',
      categories: {
        'System': [
          '!quantum_reality_mesh → !sync',
          '!system_metrics → !status',
          '!quantum_health → !health'
        ],
        'Security': [
          '!activate_n8ked_roach → !scan',
          '!become_apex → !secure',
          '!implement_drain_strategy → !protect',
          '!drain_reality_check → !check'
        ],
        'Problem Solving': [
          '!loofah_breakthrough → !fix',
          '!transcend_problem → !fix (deprecated)'
        ],
        'Performance': [
          '!upside_down_architecture → !boost'
        ],
        'Testing': [
          '!stress_test_menu → !test',
          '!stress_core_economy → !run_test',
          '!emergency_stop → !stop_test'
        ]
      },
      footer: 'These complex names will be removed in v2.0. Please migrate to simple commands.'
    };
  }

  /**
   * IS ADVANCED MODE
   * Check if user wants detailed output
   */
  isAdvancedMode(flags) {
    return flags.some(flag => this.advancedFlags[flag.toLowerCase()]);
  }
}

module.exports = CommandAliasSystem;
