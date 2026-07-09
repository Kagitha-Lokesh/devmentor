export class InterviewQuestion {
  constructor({
    id,
    category,
    type,
    questionText,
    sampleAnswer = '',
    keyPoints = [],
    starFramework = null, // Situation, Task, Action, Result guidelines (for behavioral)
    commonMistakes = [],
    strongExample = '',
    weakExample = '',
    estimatedMinutes = 10,
    difficulty,
    tags = [],
    companyId = 'general',
    companyName = 'General Prep'
  }) {
    if (!id) throw new Error('InterviewQuestion requires an id.');
    if (!category) throw new Error('InterviewQuestion requires a category.');
    if (!type) throw new Error('InterviewQuestion requires a type.');
    if (!questionText) throw new Error('InterviewQuestion requires questionText.');

    this.id = id;
    this.category = category;
    this.type = type;
    this.questionText = questionText;
    this.sampleAnswer = sampleAnswer;
    this.keyPoints = keyPoints;
    this.starFramework = starFramework;
    this.commonMistakes = commonMistakes;
    this.strongExample = strongExample;
    this.weakExample = weakExample;
    this.estimatedMinutes = estimatedMinutes;
    this.difficulty = difficulty || 'Medium';
    this.tags = tags;
    this.companyId = companyId;
    this.companyName = companyName;
  }
}

export default InterviewQuestion;
