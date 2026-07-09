import config from '../../shared/generated/mastery-config.json';
import { IMasteryCalculator } from '../../domain/evaluation/IMasteryCalculator';

export class DefaultMasteryCalculator extends IMasteryCalculator {
  calculateMastery(progress, attempts = 0, hintsUsed = 0) {
    const { lessonWeight = 0.30, practiceWeight = 0.50, hintWeight = 0.20 } = config;

    // 1. Reading Lesson weight contribution
    const readingScore = (progress && progress.lessonCompleted) ? 1.0 : (progress ? progress.readingPercentage / 100 : 0);
    const lessonContribution = readingScore * lessonWeight * 100;

    // 2. Practice checking completed contribution
    const practiceScore = (progress && progress.practiceCompleted) ? 1.0 : 0;
    const practiceContribution = practiceScore * practiceWeight * 100;

    // 3. Hint Usage efficiency contribution (fewer hints = higher efficiency)
    let hintMultiplier = 1.0;
    if (hintsUsed > 0) {
      hintMultiplier = Math.max(0.1, 1.0 / (1.0 + hintsUsed));
    }
    // Attempts penalty
    let attemptMultiplier = 1.0;
    if (attempts > 1) {
      attemptMultiplier = Math.max(0.5, 1.0 / (1.0 + 0.1 * (attempts - 1)));
    }

    const hintContribution = hintMultiplier * attemptMultiplier * hintWeight * 100;

    const totalScore = Math.min(100, Math.round(lessonContribution + practiceContribution + hintContribution));
    return isNaN(totalScore) ? 0 : totalScore;
  }
}
export default DefaultMasteryCalculator;
