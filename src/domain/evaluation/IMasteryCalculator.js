/**
 * IMasteryCalculator Interface
 * Contract for computing topic mastery scores based on config configurations.
 */
export class IMasteryCalculator {
  /**
   * Evaluates topic mastery.
   * @param {Progress} progress Granular lesson progress
   * @param {number} attempts User practice submissions
   * @param {number} hintsUsed Clues revealed count
   * @returns {number} Evaluated mastery score between 0 and 100
   */
  calculateMastery(progress, attempts, hintsUsed) {
    throw new Error('Method not implemented: calculateMastery');
  }
}
export default IMasteryCalculator;
