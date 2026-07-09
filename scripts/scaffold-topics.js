import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const topics = [
  {
    id: "V1-C1-T2",
    slug: "loops",
    title: "Loops in Java",
    description: "Master control flow structures using for, while, and do-while loops in Java.",
    searchKeywords: ["loops", "for loop", "while loop", "do while", "iteration", "control flow"],
    tags: ["Java Core", "Control Flow"],
    lessonContent: "# Loops in Java\n\nLoops allow you to execute a block of code repeatedly.\n\n## For Loop\nUsed when the number of iterations is known.\n```java\nfor(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\n```\n\n## While Loop\nUsed when the number of iterations is unknown.\n```java\nwhile(condition) {\n    // code\n}\n```",
    cheatsheetContent: "# Loops Cheatsheet\n- **for**: Known iterations\n- **while**: Unknown iterations, check before execute\n- **do-while**: Execute at least once",
    flashcards: [
      {
        "id": "V1-C1-T2-fc-1",
        "question": "What is the difference between while and do-while?",
        "answer": "A while loop checks the condition before executing, whereas a do-while loop executes at least once before checking the condition.",
        "tags": ["Control Flow"]
      }
    ],
    quiz: [
      {
        "id": "V1-C1-T2-q1",
        "question": "Which loop is best when you know exactly how many times you want to loop?",
        "options": ["while loop", "do-while loop", "for loop", "foreach loop"],
        "correctAnswerIndex": 2,
        "explanation": "A for loop is designed specifically for when you know the start and end conditions."
      }
    ],
    interview: [
      {
        "id": "V1-C1-T2-int1",
        "question": "Can you declare multiple variables in a for loop initialization?",
        "answer": "Yes, as long as they are of the same type. Example: `for(int i=0, j=10; i < j; i++, j--)`"
      }
    ],
    mindmap: {
      "nodes": [
        { "id": "loops", "label": "Loops" },
        { "id": "for", "label": "For Loop", "parentId": "loops" },
        { "id": "while", "label": "While Loop", "parentId": "loops" }
      ]
    }
  },
  {
    id: "V1-C1-T3",
    slug: "methods",
    title: "Methods in Java",
    description: "Learn how to encapsulate code into reusable blocks using methods.",
    searchKeywords: ["method", "function", "return", "parameters", "arguments", "method overloading"],
    tags: ["Java Core", "Methods"],
    lessonContent: "# Methods in Java\n\nA method is a block of code that only runs when it is called.\n\n## Syntax\n```java\npublic int add(int a, int b) {\n    return a + b;\n}\n```",
    cheatsheetContent: "# Methods Cheatsheet\n- **Access Modifier**: public, private, protected\n- **Return Type**: void, int, String, etc.\n- **Method Name**: camelCase\n- **Parameters**: (type name)",
    flashcards: [
      {
        "id": "V1-C1-T3-fc-1",
        "question": "What is method overloading?",
        "answer": "Having multiple methods with the same name but different parameters within the same class.",
        "tags": ["Methods"]
      }
    ],
    quiz: [
      {
        "id": "V1-C1-T3-q1",
        "question": "What is the return type of a method that does not return any value?",
        "options": ["null", "void", "empty", "none"],
        "correctAnswerIndex": 1,
        "explanation": "The 'void' keyword is used to indicate that the method does not return a value."
      }
    ],
    interview: [
      {
        "id": "V1-C1-T3-int1",
        "question": "What is the difference between method overloading and overriding?",
        "answer": "Overloading happens in the same class (compile-time polymorphism), overriding happens in a subclass (runtime polymorphism)."
      }
    ],
    mindmap: {
      "nodes": [
        { "id": "methods", "label": "Methods" },
        { "id": "overloading", "label": "Overloading", "parentId": "methods" },
        { "id": "overriding", "label": "Overriding", "parentId": "methods" }
      ]
    }
  }
];

const basePath = path.join(__dirname, 'content/courses/java/volume-1/chapters/chapter-1/topics');

topics.forEach(t => {
  const dir = path.join(basePath, t.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const metadata = {
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description,
    volume: 1,
    chapter: "chapter-1",
    estimatedMinutes: 20,
    difficulty: "Beginner",
    prerequisites: ["V1-C1-T1"],
    nextTopics: [],
    tags: t.tags,
    searchKeywords: t.searchKeywords,
    interviewImportance: "High",
    revisionPriority: "High",
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(dir, 'lesson.md'), t.lessonContent);
  fs.writeFileSync(path.join(dir, 'cheatsheet.md'), t.cheatsheetContent);
  fs.writeFileSync(path.join(dir, 'examples.md'), '# Examples\n\nCode examples go here.');
  fs.writeFileSync(path.join(dir, 'revision.md'), '# Revision Notes\n\nRevision points go here.');
  fs.writeFileSync(path.join(dir, 'flashcards.json'), JSON.stringify(t.flashcards, null, 2));
  fs.writeFileSync(path.join(dir, 'quiz.json'), JSON.stringify(t.quiz, null, 2));
  fs.writeFileSync(path.join(dir, 'interview.json'), JSON.stringify(t.interview, null, 2));
  fs.writeFileSync(path.join(dir, 'mindmap.json'), JSON.stringify(t.mindmap, null, 2));
  
  console.log(`Created topic: ${t.slug}`);
});
