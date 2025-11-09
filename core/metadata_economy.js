const { MetadataEconomy } = require('../income/metadata_market');
const { AutoMonetization } = require('../income/auto_monetization');

class CoreMetadataEconomy {
  constructor(options = {}) {
    this.market = new MetadataEconomy(options.marketConfig);
    this.autoMonetization = new AutoMonetization({
      enabled: options.enableAutoStreams ?? false
    });
  }

  async process(message) {
    const income = await this.market.processMessageForIncome(message);
    return { income, assets: this.market.calculateAssetGrowth?.() ?? 0 };
  }

  getIncomeReport() {
    return this.market.getIncomeReport?.() ?? {
      immediate: 0,
      assets: 0,
      reinvested: 0,
      total: 0
    };
  }
}

module.exports = {
  CoreMetadataEconomy
};
