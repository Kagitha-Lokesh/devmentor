export const ActivityType = {
  LessonStarted: 'Lesson Started',
  LessonCompleted: 'Lesson Completed',
  ProblemAttempted: 'Problem Attempted',
  ProblemSolved: 'Problem Solved',
  RevisionStarted: 'Revision Started',
  RevisionCompleted: 'Revision Completed',
  FlashcardFlipped: 'Flashcard Flipped',
  CheatSheetViewed: 'Cheat Sheet Viewed',
  MindMapViewed: 'Mind Map Viewed',
  Search: 'Search Query',
  Bookmark: 'Bookmark Toggle',
  RecommendationAccepted: 'Recommendation Accepted',
  // Learning OS v1.2 extensions
  QuizPassed: 'Quiz Passed',
  FlashcardsReviewed: 'Flashcards Reviewed',
  TopicMastered: 'Topic Mastered',
  QueueItemStarted: 'Queue Item Started'
};

export class Activity {
  constructor({
    id,
    type,
    topicId,
    problemId = null,
    duration = 0, // seconds
    timestamp = new Date()
  }) {
    if (!type) throw new Error('Activity requires a type.');
    if (!topicId) throw new Error('Activity requires a topicId.');

    this.id = id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.type = type; // ActivityType value
    this.topicId = topicId;
    this.problemId = problemId;
    this.duration = duration;
    this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
  }
}
export default Activity;
