import { describe, it, expect } from 'vitest';
import { resolveLearningStatus, LearningStatus } from '../LearningStatus';
import { Progress } from '../Progress';

describe('resolveLearningStatus State Machine', () => {
  it('should lock when prerequisites are not met', () => {
    const prerequisites = ['intro-java'];
    const progressMap = new Map(); // Empty map means not completed
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.LOCKED);
  });

  it('should be available when prerequisites are completed', () => {
    const prerequisites = ['intro-java'];
    const progressMap = new Map([
      ['intro-java', new Progress({ topicId: 'intro-java', lessonCompleted: true })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.AVAILABLE);
  });

  it('should transition to READING when readingPercentage > 0', () => {
    const prerequisites = [];
    const progressMap = new Map([
      ['oop-basics', new Progress({ topicId: 'oop-basics', readingPercentage: 45 })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.READING);
  });

  it('should transition to PRACTICE when lesson is completed but practice is not', () => {
    const prerequisites = [];
    const progressMap = new Map([
      ['oop-basics', new Progress({ topicId: 'oop-basics', lessonCompleted: true, practiceCompleted: false })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.PRACTICE);
  });

  it('should transition to QUIZ when practice is completed but quiz is not passed', () => {
    const prerequisites = [];
    const progressMap = new Map([
      ['oop-basics', new Progress({ topicId: 'oop-basics', lessonCompleted: true, practiceCompleted: true, quizPassed: false })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.QUIZ);
  });

  it('should transition to REVISION when quiz is passed but flashcards are not reviewed', () => {
    const prerequisites = [];
    const progressMap = new Map([
      ['oop-basics', new Progress({ topicId: 'oop-basics', lessonCompleted: true, practiceCompleted: true, quizPassed: true, flashcardsReviewed: false })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.REVISION);
  });

  it('should transition to MASTERED when all criteria are complete', () => {
    const prerequisites = [];
    const progressMap = new Map([
      ['oop-basics', new Progress({ topicId: 'oop-basics', lessonCompleted: true, practiceCompleted: true, quizPassed: true, flashcardsReviewed: true })]
    ]);
    const masteryMap = new Map();

    const status = resolveLearningStatus('oop-basics', prerequisites, progressMap, masteryMap);
    expect(status).toBe(LearningStatus.MASTERED);
  });
});
