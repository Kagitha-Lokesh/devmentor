/**
 * LearningStatus — Learning OS Topic State Machine
 *
 * Represents the rich learning lifecycle of a single topic, providing
 * more granular state than the legacy ProgressStatus enum.
 *
 * State transitions:
 *   LOCKED → AVAILABLE → STARTED → READING → PRACTICE → QUIZ → REVISION → MASTERED
 */
export const LearningStatus = {
  LOCKED: 'Locked',       // Prerequisites not met; topic is inaccessible
  AVAILABLE: 'Available', // Prerequisites met; not yet started
  STARTED: 'Started',     // Lesson opened at least once
  READING: 'Reading',     // Active reading in progress (scroll > 0%)
  PRACTICE: 'Practice',   // Lesson complete; practice not yet solved
  QUIZ: 'Quiz',           // Practice done; quiz not yet passed
  REVISION: 'Revision',   // Quiz passed; flashcard review due
  MASTERED: 'Mastered',   // All objectives complete (lesson + practice + quiz)
};

/**
 * Resolve the LearningStatus for a single topic given full system state.
 *
 * @param {string}   topicId
 * @param {string[]} prerequisites   - list of prerequisite topicIds
 * @param {Map}      progressMap     - Map<topicId, Progress>
 * @param {Map}      masteryMap      - Map<topicId, Mastery>
 * @returns {string} LearningStatus value
 */
export function resolveLearningStatus(topicId, prerequisites, progressMap, masteryMap) {
  // 1. Locked if any prerequisite topic is not completed
  const prerequisitesMet = prerequisites.every((preId) => {
    const prereqProgress = progressMap.get(preId);
    return prereqProgress && prereqProgress.lessonCompleted;
  });

  if (!prerequisitesMet) {
    return LearningStatus.LOCKED;
  }

  const progress = progressMap.get(topicId);

  if (!progress) {
    return LearningStatus.AVAILABLE;
  }

  // Revision step: quiz passed, flashcards pending
  if (progress.quizPassed && !progress.flashcardsReviewed) {
    return LearningStatus.REVISION;
  }

  // Mastered: all objectives complete
  if (progress.isFullyComplete) {
    return LearningStatus.MASTERED;
  }

  // Quiz step: practice done but quiz not passed
  if (progress.practiceCompleted && !progress.quizPassed) {
    return LearningStatus.QUIZ;
  }

  // Practice step: lesson complete, practice pending
  if (progress.lessonCompleted && !progress.practiceCompleted) {
    return LearningStatus.PRACTICE;
  }

  // Reading: lesson started but not complete
  if (progress.readingPercentage > 0) {
    return LearningStatus.READING;
  }

  return LearningStatus.STARTED;
}

export default LearningStatus;
