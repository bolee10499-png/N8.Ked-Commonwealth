const { DustEconomy } = require('./dust_economy');

class KedsDeclassifiedBrand {
  constructor() {
    this.dust = new DustEconomy();
  }

  applyVoice(response) {
    if (!response) {
      return 'silence';
    }
    const base = typeof response === 'string' ? response : response.output;
    if (!base) {
      return 'silence';
    }
    return `🜁 **n8.ked** // ${base}`;
  }

  formatDeclassification(insight, income) {
    const incomeLine = income ? ` | value: $${income.immediateIncome?.toFixed?.(2) ?? '0.00'}` : '';
    return `🔍 Declassified: ${insight ?? 'no insight yet'}${incomeLine}`;
  }

  registerDustTransfer(actorId, amount) {
    return this.dust.credit(actorId, amount);
  }

  getDustBalance(actorId) {
    return this.dust.balance(actorId);
  }
}

module.exports = {
  KedsDeclassifiedBrand
};
