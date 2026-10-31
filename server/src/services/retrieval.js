import { knowledgeRepo } from '../repositories/knowledge.js';
import { logger } from '../utils/logger.js';

export const retrievalService = {
  /**
   * Hybrid multi-stage knowledge retrieval
   * Combines Postgres full-text search with trigram fuzzy fallback across English and original query text
   * @param {string} originalQuery - The raw user input (may be Tamil, Hindi, or Tanglish)
   * @param {string} englishQuery - Extracted English search keywords from LLM or heuristic
   * @param {number} limit - Maximum number of knowledge items to return (default: 4)
   */
  async retrieveContext(originalQuery, englishQuery = '', limit = 4) {
    const start = Date.now();
    const seenIds = new Set();
    const results = [];

    const queriesToTest = [englishQuery, originalQuery].filter((q) => q && q.trim().length > 1);

    // Stage 1: Full-text search with 'simple' configuration
    for (const q of queriesToTest) {
      if (results.length >= limit) break;
      try {
        const matches = await knowledgeRepo.searchFullText(q, limit);
        for (const m of matches) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            results.push(m);
            if (results.length >= limit) break;
          }
        }
      } catch (err) {
        logger.warn('Full-text retrieval attempt failed', { query: q, error: err.message });
      }
    }

    // Stage 2: Trigram fuzzy similarity fallback if fewer than 2 results found
    if (results.length < 2) {
      for (const q of queriesToTest) {
        if (results.length >= limit) break;
        try {
          const fuzzyMatches = await knowledgeRepo.searchTrigram(q, limit - results.length);
          for (const m of fuzzyMatches) {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              results.push(m);
              if (results.length >= limit) break;
            }
          }
        } catch (err) {
          logger.warn('Trigram retrieval fallback failed', { query: q, error: err.message });
        }
      }
    }

    const duration = Date.now() - start;
    logger.debug('Knowledge retrieval finished', {
      originalQuery: originalQuery.slice(0, 40),
      englishQuery,
      matchesFound: results.length,
      durationMs: duration
    });

    return results;
  }
};
