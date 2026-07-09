import { IRevisionStrategy } from '../../domain/evaluation/IRevisionStrategy';
import { RevisionCard } from '../../domain/models/RevisionCard';

export class SM2SpacedRepetitionStrategy extends IRevisionStrategy {
  /**
   * Calculates the next spaced repetition state using the SM-2 algorithm.
   * @param {RevisionCard} card - Current RevisionCard state
   * @param {number} rating - RevisionRating (0: Again, 1: Hard, 2: Good, 3: Easy)
   * @param {number} [recallTime] - Recall time in seconds
   * @param {object} [config] - Parameters config
   * @returns {RevisionCard} Updated RevisionCard instance
   */
  computeNextReview(card, rating, recallTime = 0, config = {}) {
    const minEaseFactor = config.minEaseFactor || 1.3;
    const defaultEaseFactor = config.defaultEaseFactor || 2.5;

    // Map RevisionRating (0-3) to SM-2 Quality index (0-5)
    // Again -> 0 (Blackout)
    // Hard -> 2 (Incorrect but familiar)
    // Good -> 4 (Correct with effort)
    // Easy -> 5 (Perfect recall)
    let q = 0;
    if (rating === 1) q = 2;
    else if (rating === 2) q = 4;
    else if (rating === 3) q = 5;

    let easeFactor = card.easeFactor || defaultEaseFactor;
    let repetitions = card.repetitions || 0;
    let interval = card.interval || 0;

    if (q < 3) {
      // Failed recall, reset consecutive successful recall cycles
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 4; // Standard SM-2 defaults: 1 day then 4 days, then interval * EF
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update Ease Factor (standard SM-2 formula)
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(minEaseFactor, easeFactor);

    // Recall statistics updates
    const reviewCount = (card.reviewCount || 0) + 1;
    const lastDuration = recallTime;
    const averageRecallTime = Math.round(
      (((card.averageRecallTime || 0) * (card.reviewCount || 0)) + recallTime) / reviewCount * 10
    ) / 10; // Keep 1 decimal place

    // Confidence mapping rating to index (0 = 0%, 1 = 33%, 2 = 66%, 3 = 100%)
    const confidence = Math.round((rating / 3) * 100);

    // Compute next due date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    // Reset hours, minutes, seconds for clean daily boundary checks
    nextReviewDate.setHours(0, 0, 0, 0);

    return new RevisionCard({
      flashcardId: card.flashcardId,
      topicId: card.topicId,
      easeFactor,
      interval,
      repetitions,
      nextReviewDate,
      lastRating: rating,
      lastReviewedAt: new Date(),
      averageRecallTime,
      reviewCount,
      lastDuration,
      confidence
    });
  }
}

export default SM2SpacedRepetitionStrategy;
