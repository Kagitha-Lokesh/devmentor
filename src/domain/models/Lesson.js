export class Lesson {
  constructor({
    topicId,
    markdownContent = '',
    examplesContent = '',
    revisionContent = '',
    cheatsheetContent = '',
    flashcards = [],
    quiz = [],
    interview = []
  }) {
    if (!topicId) throw new Error('Lesson requires a topicId reference.');

    this.topicId = topicId;
    this.markdownContent = markdownContent;
    this.examplesContent = examplesContent;
    this.revisionContent = revisionContent;
    this.cheatsheetContent = cheatsheetContent;
    this.flashcards = flashcards;
    this.quiz = quiz;
    this.interview = interview;
  }
}
