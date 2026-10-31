export const sentimentService = {
  /**
   * Determine if conversation requires escalation based on sentiment and confidence rules
   * Rules:
   * - 2 consecutive confidence < 0.35
   * - 3 consecutive negative sentiments
   * - explicit escalation request
   */
  shouldEscalate({ recentMessages = [], currentTurn = {} }) {
    if (currentTurn.intent === 'escalate' || (currentTurn.action && currentTurn.action.type === 'escalate_to_human')) {
      return { escalate: true, reason: 'Explicit customer request for human agent' };
    }

    // Check last 2 assistant turns confidence
    const assistantTurns = recentMessages.filter((m) => m.role === 'assistant');
    if (currentTurn.confidence !== undefined && currentTurn.confidence < 0.35) {
      if (assistantTurns.length > 0 && assistantTurns[assistantTurns.length - 1].confidence < 0.35) {
        return { escalate: true, reason: 'Multiple consecutive low confidence knowledge answers' };
      }
    }

    // Check last 3 user sentiments
    const userTurns = recentMessages.filter((m) => m.role === 'user');
    const lastSentiments = [...userTurns.slice(-2).map((m) => m.sentiment), currentTurn.sentiment];
    if (lastSentiments.length >= 3 && lastSentiments.every((s) => s === 'negative')) {
      return { escalate: true, reason: 'Persistent negative customer sentiment detected across 3 turns' };
    }

    return { escalate: false };
  },

  calculateRunningAverage(existingAvg = 0, currentScore = 0, totalTurns = 1) {
    if (totalTurns <= 1) return Number(currentScore.toFixed(2));
    const newAvg = (existingAvg * (totalTurns - 1) + currentScore) / totalTurns;
    return Number(newAvg.toFixed(2));
  }
};
