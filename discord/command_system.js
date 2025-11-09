class CommandSystem {
  constructor(prefix = '!') {
    this.prefix = prefix;
    this.commands = new Map();
  }

  register(name, handler) {
    this.commands.set(name, handler);
  }

  async handle(message) {
    if (!message.content.startsWith(this.prefix)) {
      return null;
    }

    const [commandName, ...args] = message.content
      .slice(this.prefix.length)
      .trim()
      .split(/\s+/);

    const command = this.commands.get(commandName);
    if (!command) {
      return message.reply(`Unknown command: ${commandName}`);
    }

    return command(message, args);
  }
}

module.exports = {
  CommandSystem
};
