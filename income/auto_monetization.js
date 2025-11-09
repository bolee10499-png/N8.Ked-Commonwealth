class AutoMonetization {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.streams = [];
    if (this.enabled) {
      this.setupAutomaticRevenue();
    }
  }

  setupAutomaticRevenue() {
    this.streams = [
      {
        name: 'data_brokerage',
        intervalMs: 3600000,
        lastRun: null
      },
      {
        name: 'training_data',
        intervalMs: 86400000,
        lastRun: null
      },
      {
        name: 'insight_subscriptions',
        intervalMs: 2592000000,
        lastRun: null
      },
      {
        name: 'consulting_reports',
        intervalMs: 604800000,
        lastRun: null
      }
    ];
  }

  runDueStreams(now = Date.now()) {
    const triggered = [];
    this.streams.forEach((stream) => {
      if (!stream.lastRun || now - stream.lastRun >= stream.intervalMs) {
        stream.lastRun = now;
        triggered.push(stream.name);
      }
    });
    return triggered;
  }
}

module.exports = {
  AutoMonetization
};
