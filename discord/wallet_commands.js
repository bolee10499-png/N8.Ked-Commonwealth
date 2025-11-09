/**
 * Multi-Wallet Federation Discord Commands
 * 
 * Slash commands for wallet linking, verification, and cross-chain management
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WalletFederation } = require('../lib/wallet_federation');

const walletFederation = new WalletFederation();

/**
 * /link-wallet command
 * Links a wallet to user's sovereign identity via cryptographic signature
 */
const linkWalletCommand = {
  data: new SlashCommandBuilder()
    .setName('link-wallet')
    .setDescription('Link a blockchain wallet to your sovereign identity')
    .addStringOption(option =>
      option.setName('chain')
        .setDescription('Blockchain network')
        .setRequired(true)
        .addChoices(
          { name: 'Solana (Speed)', value: 'solana' },
          { name: 'Ethereum (Composability)', value: 'ethereum' },
          { name: 'Bitcoin (Security)', value: 'bitcoin' },
          { name: 'XRP Ledger (Bridging)', value: 'xrp' }
        ))
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Your wallet address')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('signature')
        .setDescription('Cryptographic signature (use /wallet-verify to get message)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('provider')
        .setDescription('Wallet provider (optional)')
        .setRequired(false)
        .addChoices(
          { name: 'Phantom', value: 'phantom' },
          { name: 'Coinbase Wallet', value: 'coinbase_wallet' },
          { name: 'Electrum', value: 'electrum' },
          { name: 'Ledger', value: 'ledger' },
          { name: 'Crypto.com', value: 'crypto_com' },
          { name: 'MetaMask', value: 'metamask' }
        ))
    .addBooleanOption(option =>
      option.setName('primary')
        .setDescription('Set as primary wallet for this chain?')
        .setRequired(false)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const chain = interaction.options.getString('chain');
    const address = interaction.options.getString('address');
    const signature = interaction.options.getString('signature');
    const provider = interaction.options.getString('provider');
    const setPrimary = interaction.options.getBoolean('primary') || false;

    // Generate verification message for this user
    const message = WalletFederation.generateVerificationMessage(userId);

    await interaction.deferReply({ ephemeral: true });

    // Link wallet with signature verification
    const result = await walletFederation.linkWallet(
      userId,
      chain,
      address,
      signature,
      message,
      provider,
      setPrimary
    );

    if (result.success) {
      const embed = new EmbedBuilder()
        .setTitle('🔗 Wallet Linked Successfully')
        .setDescription('Cross-chain federation activated')
        .setColor(0x00FF00)
        .addFields(
          { name: 'Chain', value: result.wallet.chain.toUpperCase(), inline: true },
          { name: 'Address', value: `${result.wallet.address.slice(0, 8)}...${result.wallet.address.slice(-6)}`, inline: true },
          { name: 'Primary', value: result.wallet.isPrimary ? 'Yes' : 'No', inline: true },
          { name: 'Archetype', value: result.wallet.archetype, inline: true },
          { name: 'Wisdom', value: result.wallet.wisdom, inline: false }
        )
        .setFooter({ text: 'All activity on this wallet now contributes to your unified dust balance' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('❌ Wallet Linking Failed')
        .setDescription(result.message)
        .setColor(0xFF0000)
        .addFields(
          { name: 'Error Code', value: result.error, inline: true },
          { name: 'Chain', value: chain.toUpperCase(), inline: true }
        )
        .setFooter({ text: 'Use /wallet-verify to get the correct message to sign' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  }
};

/**
 * /wallet-verify command
 * Generates verification message for wallet signature
 */
const walletVerifyCommand = {
  data: new SlashCommandBuilder()
    .setName('wallet-verify')
    .setDescription('Get verification message to sign with your wallet'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const timestamp = Date.now();
    const message = WalletFederation.generateVerificationMessage(userId, timestamp);

    const embed = new EmbedBuilder()
      .setTitle('📝 Wallet Verification Message')
      .setDescription('Sign this message with your wallet to prove ownership')
      .setColor(0x3498DB)
      .addFields(
        { name: 'Instructions', value: 
          '1. Copy the message below\n' +
          '2. Sign it with your wallet (Phantom/Coinbase/Electrum/etc)\n' +
          '3. Use `/link-wallet` with the signature\n' +
          '4. Message expires in 10 minutes', 
          inline: false 
        },
        { name: 'Message to Sign', value: `\`\`\`${message}\`\`\``, inline: false },
        { name: 'Timestamp', value: new Date(timestamp).toISOString(), inline: true }
      )
      .setFooter({ text: 'Glass House Transparency | Constitutional Voice' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

/**
 * /my-wallets command
 * Display all linked wallets and aggregated dust
 */
const myWalletsCommand = {
  data: new SlashCommandBuilder()
    .setName('my-wallets')
    .setDescription('View all your linked wallets and cross-chain dust balance'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const wallets = walletFederation.getLinkedWallets(userId);
    const aggregated = walletFederation.getAggregatedDust(userId);

    if (wallets.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('💼 No Wallets Linked')
        .setDescription('Use `/wallet-verify` to get started with cross-chain wallet federation')
        .setColor(0x95A5A6)
        .addFields(
          { name: 'Available Chains', value: 
            '• Solana (Speed)\n' +
            '• Ethereum (Composability)\n' +
            '• Bitcoin (Security)\n' +
            '• XRP Ledger (Bridging)', 
            inline: false 
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const walletFields = wallets.map(wallet => ({
      name: `${wallet.chain.toUpperCase()} ${wallet.is_primary ? '⭐' : ''}`,
      value: 
        `**Address:** \`${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}\`\n` +
        `**Provider:** ${wallet.provider || 'Unknown'}\n` +
        `**Activity:** ${wallet.activity_count} transactions\n` +
        `**Dust Earned:** ${wallet.dust_earned.toFixed(2)}`,
      inline: true
    }));

    const embed = new EmbedBuilder()
      .setTitle('💼 Your Wallet Federation')
      .setDescription(`**Total Dust Across All Chains:** ${aggregated.totalDust.toFixed(2)}`)
      .setColor(0x9B59B6)
      .addFields(walletFields)
      .addFields(
        { name: 'Federation Stats', value: 
          `**Total Wallets:** ${wallets.length}\n` +
          `**Chains Connected:** ${aggregated.chains.join(', ').toUpperCase()}\n` +
          `**Cross-Chain Synergy:** Active`, 
          inline: false 
        }
      )
      .setFooter({ text: 'Tree of Life Protocol: Each chain teaches archetypal wisdom' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

/**
 * /unlink-wallet command
 * Remove a wallet from cross-chain federation
 */
const unlinkWalletCommand = {
  data: new SlashCommandBuilder()
    .setName('unlink-wallet')
    .setDescription('Remove a wallet from your sovereign identity')
    .addStringOption(option =>
      option.setName('chain')
        .setDescription('Blockchain network')
        .setRequired(true)
        .addChoices(
          { name: 'Solana', value: 'solana' },
          { name: 'Ethereum', value: 'ethereum' },
          { name: 'Bitcoin', value: 'bitcoin' },
          { name: 'XRP Ledger', value: 'xrp' }
        ))
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Wallet address to unlink')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const chain = interaction.options.getString('chain');
    const address = interaction.options.getString('address');

    const success = walletFederation.unlinkWallet(userId, chain, address);

    if (success) {
      const embed = new EmbedBuilder()
        .setTitle('🔓 Wallet Unlinked')
        .setDescription('Cross-chain connection severed')
        .setColor(0xE74C3C)
        .addFields(
          { name: 'Chain', value: chain.toUpperCase(), inline: true },
          { name: 'Address', value: `${address.slice(0, 8)}...${address.slice(-6)}`, inline: true }
        )
        .setFooter({ text: 'You can relink this wallet at any time with /link-wallet' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('❌ Unlink Failed')
        .setDescription('Wallet not found or not owned by you')
        .setColor(0x95A5A6)
        .addFields(
          { name: 'Chain', value: chain.toUpperCase(), inline: true },
          { name: 'Address', value: address, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};

/**
 * /federation-stats command
 * Global wallet federation statistics (public)
 */
const federationStatsCommand = {
  data: new SlashCommandBuilder()
    .setName('federation-stats')
    .setDescription('View global wallet federation statistics'),

  async execute(interaction) {
    const stats = walletFederation.getStats();

    const chainFields = stats.chainStats.map(chain => ({
      name: `${chain.chain.toUpperCase()} (${chain.archetype})`,
      value: 
        `**Wallets:** ${chain.wallet_count}\n` +
        `**Activity:** ${chain.total_activity} transactions\n` +
        `**Dust:** ${chain.total_dust.toFixed(2)}\n` +
        `**Wisdom:** ${chain.wisdom}`,
      inline: true
    }));

    const embed = new EmbedBuilder()
      .setTitle('🌳 Tree of Life Federation Statistics')
      .setDescription(
        `**Total Wallets:** ${stats.totalWallets}\n` +
        `**Sovereign Citizens:** ${stats.totalUsers}\n` +
        `**Total Dust Generated:** ${stats.totalDust.toFixed(2)}\n` +
        `**Avg Wallets/User:** ${stats.averageWalletsPerUser}`
      )
      .setColor(0x27AE60)
      .addFields(chainFields)
      .setFooter({ text: 'Glass House Transparency: All metrics publicly verifiable' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

module.exports = {
  linkWalletCommand,
  walletVerifyCommand,
  myWalletsCommand,
  unlinkWalletCommand,
  federationStatsCommand
};
