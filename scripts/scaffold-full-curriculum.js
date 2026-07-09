import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curriculum = [
  // ─── Java Core (Volume 1 - Chapter 1 - continuing from T3) ───
  {
    course: "java",
    volume: 1,
    chapter: "chapter-1",
    id: "V1-C1-T4",
    slug: "arrays",
    title: "Arrays in Java",
    description: "Learn how to store and manipulate collections of elements using arrays.",
    tags: ["Java Core", "Arrays", "Data Structures"],
    searchKeywords: ["array", "arrays", "index", "length", "multidimensional", "collections"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-1",
    id: "V1-C1-T5",
    slug: "strings",
    title: "Strings in Java",
    description: "Master Java String manipulation, String methods, and immutability.",
    tags: ["Java Core", "Strings"],
    searchKeywords: ["string", "strings", "stringbuilder", "substring", "concat", "immutable", "string methods"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-1",
    id: "V1-C1-T6",
    slug: "oop-basics",
    title: "OOP Fundamentals",
    description: "Understand Object-Oriented Programming: classes, objects, encapsulation, and constructors.",
    tags: ["Java Core", "OOP"],
    searchKeywords: ["oop", "classes", "objects", "encapsulation", "constructors", "object oriented"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-2",
    id: "V1-C2-T1",
    slug: "inheritance",
    title: "Inheritance in Java",
    description: "Learn how subclasses extend parent classes and reuse code with inheritance.",
    tags: ["Java Core", "OOP", "Inheritance"],
    searchKeywords: ["inheritance", "extends", "superclass", "subclass", "is-a", "oop"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-2",
    id: "V1-C2-T2",
    slug: "polymorphism",
    title: "Polymorphism in Java",
    description: "Understand compile-time and runtime polymorphism, method overloading and overriding.",
    tags: ["Java Core", "OOP", "Polymorphism"],
    searchKeywords: ["polymorphism", "overloading", "overriding", "runtime", "compile-time", "oop"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-2",
    id: "V1-C2-T3",
    slug: "abstraction",
    title: "Abstraction & Interfaces",
    description: "Learn abstract classes and interfaces to design clean and extensible Java applications.",
    tags: ["Java Core", "OOP", "Abstraction", "Interface"],
    searchKeywords: ["abstraction", "interface", "abstract class", "implements", "oop"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-2",
    id: "V1-C2-T4",
    slug: "exception-handling",
    title: "Exception Handling",
    description: "Handle runtime errors gracefully using try-catch-finally blocks and custom exceptions.",
    tags: ["Java Core", "Exception Handling"],
    searchKeywords: ["exception", "try", "catch", "finally", "throw", "throws", "custom exception", "error handling"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-3",
    id: "V1-C3-T1",
    slug: "collections",
    title: "Java Collections Framework",
    description: "Master List, Set, Map, and Queue interfaces with their common implementations.",
    tags: ["Java Core", "Collections", "Data Structures"],
    searchKeywords: ["collections", "list", "arraylist", "linkedlist", "set", "hashset", "map", "hashmap", "queue"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-3",
    id: "V1-C3-T2",
    slug: "generics",
    title: "Generics in Java",
    description: "Write type-safe code with generic classes, methods, and bounded type parameters.",
    tags: ["Java Core", "Generics"],
    searchKeywords: ["generics", "type safety", "bounded type", "wildcard", "generic class", "type parameter"]
  },
  {
    course: "java",
    volume: 1,
    chapter: "chapter-3",
    id: "V1-C3-T3",
    slug: "lambda-streams",
    title: "Lambda Expressions & Streams",
    description: "Embrace functional programming with Java 8 lambdas, Stream API, and method references.",
    tags: ["Java Core", "Functional Programming", "Java 8"],
    searchKeywords: ["lambda", "streams", "functional", "map", "filter", "reduce", "java 8", "method reference"]
  },
  // ─── Frontend: CSS & HTML (Volume 1) ───
  {
    course: "frontend",
    volume: 1,
    chapter: "chapter-1",
    id: "FE-V1-C1-T2",
    slug: "css-flexbox",
    title: "CSS Flexbox",
    description: "Build flexible and responsive layouts using the CSS Flexbox model.",
    tags: ["Frontend", "CSS", "Layouts"],
    searchKeywords: ["css", "flexbox", "flex", "layout", "responsive", "justify-content", "align-items"]
  },
  {
    course: "frontend",
    volume: 1,
    chapter: "chapter-1",
    id: "FE-V1-C1-T3",
    slug: "css-grid",
    title: "CSS Grid",
    description: "Create two-dimensional grid-based layouts for modern responsive web design.",
    tags: ["Frontend", "CSS", "Layouts"],
    searchKeywords: ["css", "grid", "layout", "columns", "rows", "responsive", "grid-template"]
  },
  {
    course: "frontend",
    volume: 1,
    chapter: "chapter-2",
    id: "FE-V1-C2-T2",
    slug: "js-dom",
    title: "JavaScript DOM Manipulation",
    description: "Interact with the browser Document Object Model to make web pages dynamic.",
    tags: ["Frontend", "JavaScript", "DOM"],
    searchKeywords: ["dom", "document", "queryselector", "event listener", "javascript", "html manipulation"]
  },
  {
    course: "frontend",
    volume: 1,
    chapter: "chapter-2",
    id: "FE-V1-C2-T3",
    slug: "js-async",
    title: "Async JavaScript",
    description: "Handle asynchronous operations using Promises, async/await, and Fetch API.",
    tags: ["Frontend", "JavaScript", "Async"],
    searchKeywords: ["async", "await", "promise", "fetch api", "callbacks", "javascript", "http"]
  },
  {
    course: "frontend",
    volume: 2,
    chapter: "chapter-2",
    id: "FE-V2-C2-T1",
    slug: "react-state",
    title: "State Management in React",
    description: "Manage complex application state with Context API and useReducer.",
    tags: ["Frontend", "React", "State Management"],
    searchKeywords: ["react", "state", "context api", "usereducer", "state management", "global state"]
  },
  {
    course: "frontend",
    volume: 2,
    chapter: "chapter-2",
    id: "FE-V2-C2-T2",
    slug: "react-forms",
    title: "Forms in React",
    description: "Handle user input efficiently using controlled components and form validation.",
    tags: ["Frontend", "React", "Forms"],
    searchKeywords: ["react", "forms", "controlled components", "validation", "input", "formik", "react hook form"]
  },
  // ─── Database (DB) ───
  {
    course: "database",
    volume: 1,
    chapter: "chapter-1",
    id: "DB-V1-C1-T1",
    slug: "sql-basics",
    title: "SQL Basics",
    description: "Learn the fundamentals of SQL: SELECT, INSERT, UPDATE, DELETE with real examples.",
    tags: ["Database", "SQL", "Relational DB"],
    searchKeywords: ["sql", "database", "select", "insert", "update", "delete", "query", "db"]
  },
  {
    course: "database",
    volume: 1,
    chapter: "chapter-1",
    id: "DB-V1-C1-T2",
    slug: "sql-joins",
    title: "SQL Joins",
    description: "Combine data from multiple tables using INNER JOIN, LEFT JOIN, RIGHT JOIN and more.",
    tags: ["Database", "SQL", "Joins"],
    searchKeywords: ["sql", "join", "inner join", "left join", "right join", "outer join", "database"]
  },
  {
    course: "database",
    volume: 1,
    chapter: "chapter-1",
    id: "DB-V1-C1-T3",
    slug: "sql-aggregations",
    title: "SQL Aggregations & Grouping",
    description: "Summarize data using GROUP BY, HAVING, COUNT, SUM, AVG, MIN, and MAX.",
    tags: ["Database", "SQL", "Analytics"],
    searchKeywords: ["sql", "group by", "having", "count", "sum", "avg", "aggregate", "database"]
  },
  {
    course: "database",
    volume: 1,
    chapter: "chapter-2",
    id: "DB-V1-C2-T1",
    slug: "postgresql-setup",
    title: "PostgreSQL Setup & Basics",
    description: "Install PostgreSQL, create databases and tables, and run queries from the command line.",
    tags: ["Database", "PostgreSQL"],
    searchKeywords: ["postgresql", "postgres", "database", "psql", "schema", "setup", "sql"]
  },
  {
    course: "database",
    volume: 1,
    chapter: "chapter-2",
    id: "DB-V1-C2-T2",
    slug: "database-design",
    title: "Database Design & Normalization",
    description: "Design efficient databases using 1NF, 2NF, 3NF and ER diagrams.",
    tags: ["Database", "Design", "Normalization"],
    searchKeywords: ["database design", "normalization", "1nf", "2nf", "3nf", "er diagram", "primary key", "foreign key"]
  },
  // ─── Backend: Spring (Volume 1 - Chapter 2) ───
  {
    course: "backend",
    volume: 1,
    chapter: "chapter-2",
    id: "BE-V1-C2-T1",
    slug: "spring-security",
    title: "Spring Security",
    description: "Secure your Spring Boot APIs with authentication, authorization, and JWT tokens.",
    tags: ["Backend", "Spring", "Security", "JWT"],
    searchKeywords: ["spring security", "jwt", "authentication", "authorization", "security", "token", "spring"]
  },
  {
    course: "backend",
    volume: 1,
    chapter: "chapter-2",
    id: "BE-V1-C2-T2",
    slug: "spring-data-jpa",
    title: "Spring Data JPA",
    description: "Persist data to relational databases using Spring Data JPA and Hibernate ORM.",
    tags: ["Backend", "Spring", "JPA", "Database"],
    searchKeywords: ["jpa", "spring data", "hibernate", "entity", "repository", "orm", "database", "spring"]
  },
  {
    course: "backend",
    volume: 1,
    chapter: "chapter-2",
    id: "BE-V1-C2-T3",
    slug: "microservices",
    title: "Microservices Architecture",
    description: "Design and build scalable microservices with Spring Boot and REST communication.",
    tags: ["Backend", "Microservices", "Architecture", "Spring Boot"],
    searchKeywords: ["microservices", "architecture", "spring boot", "api gateway", "service registry", "eureka"]
  }
];

const contentDir = path.join(__dirname, '../content/courses');

curriculum.forEach(t => {
  const dir = path.join(contentDir, t.course, `volume-${t.volume}`, `chapters`, t.chapter, `topics`, t.slug);
  if (fs.existsSync(dir)) {
    console.log(`Skipping (exists): ${t.course} / ${t.slug}`);
    return;
  }
  fs.mkdirSync(dir, { recursive: true });

  const metadata = {
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description,
    volume: t.volume,
    chapter: t.chapter,
    estimatedMinutes: 35,
    difficulty: "Intermediate",
    prerequisites: [],
    nextTopics: [],
    tags: t.tags,
    searchKeywords: t.searchKeywords,
    interviewImportance: "High",
    revisionPriority: "Medium",
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(dir, 'lesson.md'), `# ${t.title}\n\n${t.description}\n\n## Introduction\n\nContent coming soon.`);
  fs.writeFileSync(path.join(dir, 'cheatsheet.md'), `# ${t.title} Cheatsheet\n\nKey concepts: ${t.searchKeywords.join(', ')}.`);
  fs.writeFileSync(path.join(dir, 'examples.md'), `# ${t.title} Examples\n\nCode examples go here.`);
  fs.writeFileSync(path.join(dir, 'revision.md'), `# ${t.title} Revision Notes\n\nRevision points go here.`);

  const fc = [{ id: `${t.id}-fc-1`, question: `What is the main purpose of ${t.title}?`, answer: t.description, tags: t.tags }];
  fs.writeFileSync(path.join(dir, 'flashcards.json'), JSON.stringify(fc, null, 2));

  const quiz = [{ id: `${t.id}-q1`, question: `Is ${t.title} essential for a full-stack developer?`, options: ["Yes, absolutely", "No", "Only for backend", "Only for frontend"], correctAnswerIndex: 0, explanation: t.description }];
  fs.writeFileSync(path.join(dir, 'quiz.json'), JSON.stringify(quiz, null, 2));

  const interview = [{ id: `${t.id}-int1`, question: `Explain ${t.title} in your own words.`, answer: t.description }];
  fs.writeFileSync(path.join(dir, 'interview.json'), JSON.stringify(interview, null, 2));

  const mindmap = { nodes: [{ id: t.slug, label: t.title }, ...t.tags.map((tag, i) => ({ id: `${t.slug}-${i}`, label: tag, parentId: t.slug }))] };
  fs.writeFileSync(path.join(dir, 'mindmap.json'), JSON.stringify(mindmap, null, 2));

  console.log(`✓ Created: ${t.course} / ${t.slug}`);
});

console.log('\n✅ Full curriculum scaffold complete!');
