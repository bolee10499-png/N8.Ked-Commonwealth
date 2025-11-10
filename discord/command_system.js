const CommandAliasSystem = require('./command_aliases');

class CommandSystem {
  constructor(prefix = '!') {
    this.prefix = prefix;
    this.commands = new Map();
    this.aliasSystem = new CommandAliasSystem();
  }

  register(name, handler) {
    this.commands.set(name, handler);
  }

  async handle(message) {
    if (!message.content.startsWith(this.prefix)) {
      return null;
    }

    const userInput = message.content.slice(this.prefix.length).trim();
    const [commandName, ...args] = userInput.split(/\s+/);

    // Resolve command through alias system
    const resolved = this.aliasSystem.resolveCommand(userInput);

    // Show deprecation warning if needed
    if (resolved.deprecated) {
      const warning = this.aliasSystem.getDeprecationWarning(resolved);
      if (warning) {
        const warningMsg = [
          `${warning.title}`,
          warning.message,
          warning.suggestion ? `💡 ${warning.suggestion}` : '',
          warning.help ? `📚 ${warning.help}` : ''
        ].filter(Boolean).join('\n');
        
        await message.reply(warningMsg);
      }
    }

    // Handle help command specially
    if (resolved.command === 'help') {
      const tier = args[0] || 'simple';
      const helpText = this.aliasSystem.getHelpText(tier);
      return this.sendHelpMessage(message, helpText);
    }

    // Get the actual command handler
    const command = this.commands.get(resolved.command);
    if (!command) {
      return message.reply({
        content: `❌ Unknown command: \`!${commandName}\`\n💡 Type \`!help\` to see available commands.`
      });
    }

    // Execute command with resolved info
    return command(message, args, {
      tier: resolved.tier,
      advancedMode: this.aliasSystem.isAdvancedMode(resolved.flags),
      originalInput: resolved.originalInput
    });
  }

  /**
   * SEND HELP MESSAGE
   * Format and send help text
   */
  async sendHelpMessage(message, helpText) {
    let content = `**${helpText.title}**\n${helpText.description}\n\n`;

    if (helpText.warning) {
      content += `${helpText.warning}\n\n`;
    }

    for (const [category, commands] of Object.entries(helpText.categories)) {
      content += `**${category}:**\n`;
      content += commands.map(cmd => `  ${cmd}`).join('\n');
      content += '\n\n';
    }

    if (helpText.footer) {
      content += `\n*${helpText.footer}*`;
    }

    return message.reply({ content });
  }
}

module.exports = {
  CommandSystem
};

