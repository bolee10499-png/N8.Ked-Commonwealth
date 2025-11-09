class DataPipes {
  constructor() {
    this.pipelines = new Map();
    this.registerDefaultPipelines();
  }

  registerDefaultPipelines() {
    this.pipelines.set('default', [
      (payload) => ({ ...payload, stage: 'normalized' }),
      (payload) => ({ ...payload, stage: 'patterned' }),
      (payload) => ({ ...payload, stage: 'ready' })
    ]);
  }

  flow(data, pipelineName = 'default') {
    const pipeline = this.pipelines.get(pipelineName) ?? [];
    return pipeline.reduce((acc, fn) => {
      try {
        return fn(acc);
      } catch (error) {
        return { ...acc, error };
      }
    }, data);
  }

  register(name, stages) {
    this.pipelines.set(name, stages);
  }
}

module.exports = {
  DataPipes
};
