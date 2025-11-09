class ControlDial {
  constructor(name, defaultValue = 0.5) {
    this.name = name;
    this.value = defaultValue;
    this.history = [];
  }

  set(value) {
    this.value = Math.max(0, Math.min(1, value));
    this.history.push({ value: this.value, at: Date.now() });
    if (this.history.length > 100) {
      this.history.shift();
    }
    return this.value;
  }
}

class ControlPanel {
  constructor() {
    this.dials = new Map([
      ['engagement', new ControlDial('engagement', 0.5)],
      ['metaphor', new ControlDial('metaphor', 0.5)],
      ['mischief', new ControlDial('mischief', 0.5)]
    ]);
  }

  setDial(name, value) {
    if (!this.dials.has(name)) {
      this.dials.set(name, new ControlDial(name));
    }
    return this.dials.get(name).set(value);
  }

  getSnapshot() {
    return Array.from(this.dials.entries()).map(([name, dial]) => ({ name, value: dial.value }));
  }
}

module.exports = {
  ControlDial,
  ControlPanel
};
