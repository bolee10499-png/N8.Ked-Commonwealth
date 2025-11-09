class ResponseEngine {
  generate(context) {
    const mood = context?.identitySeed?.mood ?? 'neutral';
    const angle = context?.identitySeed?.angle ?? 'reflective';
    const authorId = context?.identitySeed?.authorId ?? 'someone';
    const metaphors = context?.generatedMetaphors ?? [];
    const metaphorLine = metaphors.length ? ` // Metaphors: ${metaphors.join(', ')}` : '';

    const baseMessage = `(${mood}/${angle}) <@${authorId}> ${this.composeBody(context)}`;

    return {
      ...context,
      output: `${baseMessage}${metaphorLine}`.trim()
    };
  }

  composeBody(context) {
    const content = context?.payload?.content ?? '';
    if (!content) {
      return 'say something worth biting.';
    }
    if (context?.patterns?.containsQuestion) {
      return `question logged: "${content}". keep digging.`;
    }
    return `noted: "${content}". feed accepted.`;
  }
}

module.exports = {
  ResponseEngine
};
