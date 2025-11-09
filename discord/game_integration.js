class GameIntegration {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.players = new Map();
  }

  ensurePlayer(id) {
    if (!this.players.has(id)) {
      this.players.set(id, { dust: 0, badges: [] });
    }
    return this.players.get(id);
  }

  awardDust(id, amount) {
    const player = this.ensurePlayer(id);
    player.dust += amount;
    return player.dust;
  }

  getProfile(id) {
    return this.players.get(id) ?? { dust: 0, badges: [] };
  }
}

module.exports = {
  GameIntegration
};
