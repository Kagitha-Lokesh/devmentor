import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.resolve(__dirname, '../content');
const PUBLIC_CONTENT_DIR = path.resolve(__dirname, '../public/content');
const GENERATED_DIR = path.resolve(__dirname, '../src/shared/generated');

// Ensure target directories exist
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_CONTENT_DIR)) {
  fs.mkdirSync(PUBLIC_CONTENT_DIR, { recursive: true });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists ? fs.statSync(src) : null;
  const isDirectory = exists && stats && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function buildRegistry() {
  console.log('[Content Builder] Generating static registries...');
  
  const registry = {
    courses: {}
  };
  const searchIndex = [];
  const graphNodes = [];
  const flashcardIndex = [];
  const mindmapIndex = [];
  const revisionIndex = [];
  
  let totalChapters = 0;
  let totalTopics = 0;
  let totalHours = 0;
  let totalFlashcards = 0;
  let totalQuestions = 0;

  // 1. Process Courses
  const coursesPath = path.join(CONTENT_DIR, 'courses');
  if (fs.existsSync(coursesPath)) {
    const courses = fs.readdirSync(coursesPath);
    courses.forEach((courseId) => {
      const coursePath = path.join(coursesPath, courseId);
      if (!fs.statSync(coursePath).isDirectory()) return;

      registry.courses[courseId] = {
        id: courseId,
        title: courseId === 'java' ? 'Java Full Stack Career Path' : courseId.toUpperCase(),
        volumes: []
      };

      const volumes = fs.readdirSync(coursePath).filter(v => v.startsWith('volume-'));
      volumes.sort((a, b) => {
        const numA = parseInt(a.replace('volume-', ''));
        const numB = parseInt(b.replace('volume-', ''));
        return numA - numB;
      });

      volumes.forEach((volFolder) => {
        const volPath = path.join(coursePath, volFolder);
        if (!fs.statSync(volPath).isDirectory()) return;

        const volNum = parseInt(volFolder.replace('volume-', ''));
        const volumeMetaPath = path.join(volPath, 'metadata.json');
        let volumeTitle = `Volume ${volNum}`;
        if (fs.existsSync(volumeMetaPath)) {
          const meta = JSON.parse(fs.readFileSync(volumeMetaPath, 'utf-8'));
          volumeTitle = meta.title || volumeTitle;
        }

        const volumeNode = {
          num: volNum,
          folder: volFolder,
          title: volumeTitle,
          chapters: []
        };

        const chaptersPath = path.join(volPath, 'chapters');
        if (fs.existsSync(chaptersPath)) {
          const chapters = fs.readdirSync(chaptersPath);
          chapters.sort();

          chapters.forEach((chapFolder) => {
            const chapPath = path.join(chaptersPath, chapFolder);
            if (!fs.statSync(chapPath).isDirectory()) return;
            totalChapters++;

            const chapterMetaPath = path.join(chapPath, 'metadata.json');
            let chapterTitle = chapFolder.replace('chapter-', 'Chapter ');
            if (fs.existsSync(chapterMetaPath)) {
              const meta = JSON.parse(fs.readFileSync(chapterMetaPath, 'utf-8'));
              chapterTitle = meta.title || chapterTitle;
            }

            const chapterNode = {
              id: chapFolder,
              title: chapterTitle,
              topics: []
            };

            const topicsPath = path.join(chapPath, 'topics');
            if (fs.existsSync(topicsPath)) {
              const topics = fs.readdirSync(topicsPath);
              topics.forEach((topicFolder) => {
                const topicPath = path.join(topicsPath, topicFolder);
                if (!fs.statSync(topicPath).isDirectory()) return;
                totalTopics++;

                const topicMetaPath = path.join(topicPath, 'metadata.json');
                if (fs.existsSync(topicMetaPath)) {
                  const topicMeta = JSON.parse(fs.readFileSync(topicMetaPath, 'utf-8'));
                  const relativePathPrefix = `courses/${courseId}/${volFolder}/chapters/${chapFolder}/topics/${topicFolder}`;
                  
                  // Read interview.json to sum statistics
                  const qPath = path.join(topicPath, 'interview.json');
                  if (fs.existsSync(qPath)) {
                    try {
                      const qData = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
                      totalQuestions += qData.length;
                    } catch {}
                  }

                  // Process Flashcards, Mind Map, and Cheat Sheets
                  const fcPath = path.join(topicPath, 'flashcards.json');
                  const mmPath = path.join(topicPath, 'mindmap.json');
                  const csPath = path.join(topicPath, 'cheatsheet.md');

                  let hasFlashcards = false;
                  let hasMindMap = false;
                  let hasCheatSheet = false;
                  let flashcardCount = 0;

                  if (fs.existsSync(fcPath)) {
                    try {
                      const fcData = JSON.parse(fs.readFileSync(fcPath, 'utf-8'));
                      if (!Array.isArray(fcData)) {
                        console.error(`[ValidationError] Flashcards must be an array in topic "${topicMeta.id}": ${fcPath}`);
                        process.exit(1);
                      }

                      const fcIds = new Set();
                      const normalizedCards = fcData.map((card, idx) => {
                        const front = card.front || card.question;
                        const back = card.back || card.answer;
                        if (!front || !back) {
                          console.error(`[ValidationError] Flashcard missing front/back or question/answer in topic "${topicMeta.id}": card index ${idx}`);
                          process.exit(1);
                        }

                        const id = card.id || `${topicMeta.id}-fc-${idx + 1}`;
                        if (fcIds.has(id)) {
                          console.error(`[ValidationError] Duplicate flashcard ID "${id}" in topic "${topicMeta.id}"`);
                          process.exit(1);
                        }
                        fcIds.add(id);

                        return {
                          id,
                          front,
                          back,
                          tags: card.tags || []
                        };
                      });

                      // Ensure public directory layout exists before writing
                      const publicFcDir = path.dirname(path.join(PUBLIC_CONTENT_DIR, relativePathPrefix, 'flashcards.json'));
                      if (!fs.existsSync(publicFcDir)) {
                        fs.mkdirSync(publicFcDir, { recursive: true });
                      }
                      fs.writeFileSync(
                        path.join(PUBLIC_CONTENT_DIR, relativePathPrefix, 'flashcards.json'),
                        JSON.stringify(normalizedCards, null, 2),
                        'utf-8'
                      );

                      flashcardCount = normalizedCards.length;
                      totalFlashcards += flashcardCount;
                      hasFlashcards = true;

                      flashcardIndex.push({
                        topicId: topicMeta.id,
                        slug: topicMeta.slug,
                        title: topicMeta.title,
                        chapter: chapFolder,
                        volume: volNum,
                        count: flashcardCount,
                        path: `${relativePathPrefix}/flashcards.json`
                      });
                    } catch (e) {
                      console.error(`[ValidationError] Error processing flashcards for topic "${topicMeta.id}": ${e.message}`);
                      process.exit(1);
                    }
                  }

                  if (fs.existsSync(mmPath)) {
                    try {
                      const mmData = JSON.parse(fs.readFileSync(mmPath, 'utf-8'));
                      if (!mmData.nodes || !Array.isArray(mmData.nodes)) {
                        console.error(`[ValidationError] Mindmap missing nodes array in topic "${topicMeta.id}": ${mmPath}`);
                        process.exit(1);
                      }
                      const nodeIds = new Set(mmData.nodes.map(n => n.id));
                      mmData.nodes.forEach((node) => {
                        if (node.parentId && !nodeIds.has(node.parentId)) {
                          console.error(`[ValidationError] Mindmap node "${node.id}" references non-existent parentId "${node.parentId}" in topic "${topicMeta.id}"`);
                          process.exit(1);
                        }
                      });

                      // Ensure public directory layout exists before writing
                      const publicMmDir = path.dirname(path.join(PUBLIC_CONTENT_DIR, relativePathPrefix, 'mindmap.json'));
                      if (!fs.existsSync(publicMmDir)) {
                        fs.mkdirSync(publicMmDir, { recursive: true });
                      }
                      fs.writeFileSync(
                        path.join(PUBLIC_CONTENT_DIR, relativePathPrefix, 'mindmap.json'),
                        JSON.stringify(mmData, null, 2),
                        'utf-8'
                      );

                      hasMindMap = true;
                      mindmapIndex.push({
                        topicId: topicMeta.id,
                        slug: topicMeta.slug,
                        title: topicMeta.title,
                        path: `${relativePathPrefix}/mindmap.json`
                      });
                    } catch (e) {
                      console.error(`[ValidationError] Error processing mindmap for topic "${topicMeta.id}": ${e.message}`);
                      process.exit(1);
                    }
                  }

                  if (fs.existsSync(csPath)) {
                    hasCheatSheet = true;
                  } else if (topicMeta.cheatsheet === true) {
                    console.error(`[ValidationError] Topic "${topicMeta.id}" metadata references cheatsheet: true but cheatsheet.md is missing`);
                    process.exit(1);
                  }

                  revisionIndex.push({
                    topicId: topicMeta.id,
                    slug: topicMeta.slug,
                    title: topicMeta.title,
                    hasFlashcards,
                    hasCheatSheet,
                    hasMindMap,
                    estimatedRevisionTime: topicMeta.estimatedRevisionTime || 8
                  });

                  const estMinutes = topicMeta.estimatedMinutes || 15;
                  totalHours += estMinutes / 60;

                  const topicNode = {
                    id: topicMeta.id,
                    slug: topicMeta.slug,
                    title: topicMeta.title,
                    description: topicMeta.description,
                    estimatedMinutes: estMinutes,
                    difficulty: topicMeta.difficulty,
                    prerequisites: topicMeta.prerequisites || [],
                    nextTopics: topicMeta.nextTopics || [],
                    tags: topicMeta.tags || [],
                    paths: {
                      lesson: `${relativePathPrefix}/lesson.md`,
                      examples: `${relativePathPrefix}/examples.md`,
                      revision: `${relativePathPrefix}/revision.md`,
                      cheatsheet: `${relativePathPrefix}/cheatsheet.md`,
                      flashcards: `${relativePathPrefix}/flashcards.json`,
                      quiz: `${relativePathPrefix}/quiz.json`,
                      interview: `${relativePathPrefix}/interview.json`
                    }
                  };

                  chapterNode.topics.push(topicNode);

                  // Graph Node metadata mapping
                  graphNodes.push({
                    id: topicMeta.id,
                    slug: topicMeta.slug,
                    title: topicMeta.title,
                    description: topicMeta.description,
                    difficulty: topicMeta.difficulty,
                    volume: volNum,
                    chapter: chapFolder,
                    prerequisites: topicMeta.prerequisites || [],
                    nextTopics: topicMeta.nextTopics || [],
                    tags: topicMeta.tags || [],
                    estimatedReadingTime: estMinutes,
                    estimatedPracticeTime: 20,
                    estimatedRevisionTime: 8,
                    interviewImportance: topicMeta.interviewImportance || 3,
                    paths: topicNode.paths
                  });

                  searchIndex.push({
                    id: topicMeta.id,
                    slug: topicMeta.slug,
                    title: topicMeta.title,
                    description: topicMeta.description,
                    volume: volNum,
                    chapterTitle,
                    difficulty: topicMeta.difficulty,
                    tags: topicMeta.tags || [],
                    keywords: topicMeta.searchKeywords || [],
                    route: `/courses/${courseId}/topics/${topicMeta.slug}`,
                    paths: topicNode.paths
                  });
                }
              });
            }

            volumeNode.chapters.push(chapterNode);
          });
        }

        registry.courses[courseId].volumes.push(volumeNode);
      });
    });
  }

  // 2. Validate Knowledge Graph Links
  console.log('[Content Builder] Validating knowledge graph dependencies...');
  const allTopicIds = new Set(graphNodes.map(n => n.id));

  graphNodes.forEach((node) => {
    // Check prerequisites links
    node.prerequisites.forEach((prereqId) => {
      if (!allTopicIds.has(prereqId)) {
        console.error(`[ValidationError] Invalid dependency link: Topic "${node.id}" references non-existent prerequisite ID "${prereqId}"`);
        process.exit(1);
      }
    });

    // Check nextTopics links
    node.nextTopics.forEach((nextId) => {
      if (!allTopicIds.has(nextId)) {
        console.error(`[ValidationError] Invalid dependency link: Topic "${node.id}" references non-existent nextTopic ID "${nextId}"`);
        process.exit(1);
      }
    });
  });

  // 3. Process & Validate Coding Problems
  console.log('[Content Builder] Validating coding problems...');
  const problemsRegistry = [];
  const problemIds = new Set();

  const problemsPath = path.join(CONTENT_DIR, 'problems');
  if (fs.existsSync(problemsPath)) {
    const categories = fs.readdirSync(problemsPath);
    
    categories.forEach((cat) => {
      const catPath = path.join(problemsPath, cat);
      if (!fs.statSync(catPath).isDirectory()) return;

      const problemFolders = fs.readdirSync(catPath);
      problemFolders.forEach((slug) => {
        const probPath = path.join(catPath, slug);
        if (!fs.statSync(probPath).isDirectory()) return;

        const metadataFile = path.join(probPath, 'metadata.json');
        const descriptionFile = path.join(probPath, 'problem.md');
        const starterDir = path.join(probPath, 'starter');
        const testsFile = path.join(probPath, 'sample-tests.json');
        const hintsFile = path.join(probPath, 'hints.json');

        if (!fs.existsSync(metadataFile) || !fs.existsSync(descriptionFile) || !fs.existsSync(starterDir) || !fs.existsSync(testsFile) || !fs.existsSync(hintsFile)) {
          console.error(`[ValidationError] Missing files inside problem workspace: ${probPath}`);
          process.exit(1);
        }

        let metadata;
        try {
          metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        } catch (e) {
          console.error(`[ValidationError] Invalid JSON inside metadata.json in ${probPath}: ${e.message}`);
          process.exit(1);
        }

        const requiredKeys = ['id', 'slug', 'title', 'difficulty', 'topic', 'subtopic', 'estimatedMinutes'];
        requiredKeys.forEach((key) => {
          if (metadata[key] === undefined || metadata[key] === null) {
            console.error(`[ValidationError] Problem metadata missing key: "${key}" in ${metadataFile}`);
            process.exit(1);
          }
        });

        if (problemIds.has(metadata.id)) {
          console.error(`[ValidationError] Duplicate problem ID detected: "${metadata.id}" in ${metadataFile}`);
          process.exit(1);
        }
        problemIds.add(metadata.id);

        const starters = fs.readdirSync(starterDir);
        const relativePath = `problems/${cat}/${slug}`;
        problemsRegistry.push({
          id: metadata.id,
          slug: metadata.slug,
          title: metadata.title,
          difficulty: metadata.difficulty,
          topic: metadata.topic,
          subtopic: metadata.subtopic,
          estimatedMinutes: metadata.estimatedMinutes,
          companies: metadata.companies || [],
          patterns: metadata.patterns || [],
          timeComplexity: metadata.timeComplexity || '',
          spaceComplexity: metadata.spaceComplexity || '',
          prerequisites: metadata.prerequisites || [],
          related: metadata.related || [],
          next: metadata.next || [],
          interviewImportance: metadata.interviewImportance || 3,
          paths: {
            problem: `${relativePath}/problem.md`,
            tests: `${relativePath}/sample-tests.json`,
            hints: `${relativePath}/hints.json`,
            starter: starters.map(file => ({
              filename: file,
              language: file.endsWith('.java') ? 'java' : file.endsWith('.js') ? 'javascript' : file.endsWith('.sql') ? 'sql' : 'text',
              path: `${relativePath}/starter/${file}`
            }))
          }
        });
      });
    });
  }

  // 4. Compile Graph dependencies lookups & recommendation indices
  const topicDependencies = {};
  graphNodes.forEach((node) => {
    topicDependencies[node.id] = node.prerequisites;
  });

  const recommendationIndex = graphNodes.map(node => ({
    id: node.id,
    slug: node.slug,
    volume: node.volume,
    chapter: node.chapter,
    prerequisites: node.prerequisites
  }));

  const learningStatistics = {
    topics: totalTopics,
    chapters: totalChapters,
    estimatedHours: Math.ceil(totalHours),
    practiceProblems: problemsRegistry.length,
    interviewQuestions: totalQuestions,
    flashcards: totalFlashcards
  };

  const masteryConfig = {
    lessonWeight: 0.30,
    practiceWeight: 0.50,
    hintWeight: 0.20
  };

  const revisionConfig = {
    intervals: [0, 1, 3, 7, 14, 30, 90],
    defaultEaseFactor: 2.5,
    minEaseFactor: 1.3,
    masteryThreshold: 80,
    confidenceBonus: 1.2,
    weights: {
      urgency: 0.40,
      importance: 0.35,
      weakness: 0.25
    },
    minCardsPerSession: 5
  };

  const revisionManifest = {
    version: "1.0",
    flashcards: totalFlashcards,
    mindmaps: mindmapIndex.length,
    cheatsheets: revisionIndex.filter(r => r.hasCheatSheet).length,
    estimatedRevisionHours: Math.ceil(revisionIndex.reduce((sum, r) => sum + r.estimatedRevisionTime, 0) / 60)
  };

  // 3.5. Process & Validate Interviews
  console.log('[Content Builder] Processing & validating interviews...');
  const companiesRegistry = [];
  const allQuestions = [];
  const roadmapsRegistry = {};
  
  const interviewsPath = path.join(CONTENT_DIR, 'interviews');
  if (fs.existsSync(interviewsPath)) {
    // Process Companies
    const compPath = path.join(interviewsPath, 'companies');
    if (fs.existsSync(compPath)) {
      const companies = fs.readdirSync(compPath);
      companies.forEach((comp) => {
        const cPath = path.join(compPath, comp);
        if (!fs.statSync(cPath).isDirectory()) return;

        const metaFile = path.join(cPath, 'metadata.json');
        if (!fs.existsSync(metaFile)) {
          console.error(`[ValidationError] Missing metadata.json for company "${comp}"`);
          process.exit(1);
        }
        
        let meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
        companiesRegistry.push(meta);

        // Load roadmap.md and tips.md if they exist
        let roadmapContent = '';
        let tipsContent = '';
        const rdFile = path.join(cPath, 'roadmap.md');
        const tpFile = path.join(cPath, 'tips.md');
        if (fs.existsSync(rdFile)) roadmapContent = fs.readFileSync(rdFile, 'utf-8');
        if (fs.existsSync(tpFile)) tipsContent = fs.readFileSync(tpFile, 'utf-8');
        
        roadmapsRegistry[comp] = {
          companyId: comp,
          companyName: meta.name,
          roadmap: roadmapContent,
          tips: tipsContent
        };

        // Load questions
        const categories = ['technical', 'behavioral', 'system-design', 'hr'];
        categories.forEach((cat) => {
          const catFile = path.join(cPath, `${cat}.json`);
          if (fs.existsSync(catFile)) {
            try {
              const qs = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
              if (!Array.isArray(qs)) {
                console.error(`[ValidationError] Question list must be an array: ${catFile}`);
                process.exit(1);
              }
              qs.forEach((q) => {
                if (!q.id || !q.category || !q.type || !q.questionText) {
                  console.error(`[ValidationError] Invalid question structure in ${catFile}: ${JSON.stringify(q)}`);
                  process.exit(1);
                }
                allQuestions.push({
                  ...q,
                  companyId: comp,
                  companyName: meta.name
                });
              });
            } catch (e) {
              console.error(`[ValidationError] Invalid JSON inside ${catFile}: ${e.message}`);
              process.exit(1);
            }
          }
        });
      });
    }

    // Process General
    const genPath = path.join(interviewsPath, 'general');
    if (fs.existsSync(genPath)) {
      const files = fs.readdirSync(genPath);
      files.forEach((file) => {
        if (!file.endsWith('.json')) return;
        const filePath = path.join(genPath, file);
        try {
          const qs = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          qs.forEach((q) => {
            if (!q.id || !q.category || !q.type || !q.questionText) {
              console.error(`[ValidationError] Invalid general question structure in ${file}`);
              process.exit(1);
            }
            allQuestions.push({
              ...q,
              companyId: 'general',
              companyName: 'General Prep'
            });
          });
        } catch (e) {
          console.error(`[ValidationError] Invalid JSON in general question ${file}: ${e.message}`);
          process.exit(1);
        }
      });
    }
  }

  // Validate duplicate question IDs
  const qIds = new Set();
  allQuestions.forEach((q) => {
    if (qIds.has(q.id)) {
      console.error(`[ValidationError] Duplicate question ID detected: "${q.id}"`);
      process.exit(1);
    }
    qIds.add(q.id);
  });

  const interviewConfig = {
    scoringProfiles: {
      campus: {
        Technical: 50,
        Behavioral: 30,
        HR: 20,
        SystemDesign: 0
      },
      experienced: {
        Technical: 40,
        SystemDesign: 40,
        Behavioral: 20,
        HR: 0
      }
    }
  };

  const interviewManifest = {
    version: "1.0",
    companiesCount: companiesRegistry.length,
    totalQuestions: allQuestions.length,
    behavioralCount: allQuestions.filter(q => q.category === 'Behavioral').length,
    technicalCount: allQuestions.filter(q => q.category === 'Technical').length,
    systemDesignCount: allQuestions.filter(q => q.category === 'SystemDesign').length,
    hrCount: allQuestions.filter(q => q.category === 'HR').length
  };

  // ─── Phase 7 Assistant Compile & Validation ──────────────────────────────
  console.log('[Content Builder] Validating & generating assistant indexes...');
  
  // 1. Validate prompt templates
  const templatesPath = path.resolve(CONTENT_DIR, 'assistant/prompt-templates.json');
  if (!fs.existsSync(templatesPath)) {
    console.error(`[ValidationError] Missing assistant/prompt-templates.json`);
    process.exit(1);
  }
  let templates;
  try {
    templates = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));
  } catch (e) {
    console.error(`[ValidationError] Invalid JSON in prompt-templates.json: ${e.message}`);
    process.exit(1);
  }
  Object.entries(templates).forEach(([key, val]) => {
    if (!val.includes('{{context}}')) {
      console.error(`[ValidationError] Template "${key}" in prompt-templates.json is missing required marker "{{context}}"`);
      process.exit(1);
    }
  });

  // 2. Validate assistant config
  const configPath = path.resolve(CONTENT_DIR, 'assistant/assistant-config.json');
  if (!fs.existsSync(configPath)) {
    console.error(`[ValidationError] Missing assistant/assistant-config.json`);
    process.exit(1);
  }
  let assistantConfig;
  try {
    assistantConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    console.error(`[ValidationError] Invalid JSON in assistant-config.json: ${e.message}`);
    process.exit(1);
  }
  if (!['rule-based', 'ollama'].includes(assistantConfig.activeProvider)) {
    console.error(`[ValidationError] Invalid activeProvider "${assistantConfig.activeProvider}" in assistant-config.json`);
    process.exit(1);
  }

  // 3. Validate missing explanations
  graphNodes.forEach(node => {
    if (!node.paths || !node.paths.lesson || !node.paths.cheatsheet) {
      console.error(`[ValidationError] Topic "${node.id}" has missing paths in metadata`);
      process.exit(1);
    }
    const lessonPath = path.resolve(CONTENT_DIR, node.paths.lesson);
    const cheatsheetPath = path.resolve(CONTENT_DIR, node.paths.cheatsheet);
    if (!fs.existsSync(lessonPath)) {
      console.error(`[ValidationError] Missing lesson explanation (lesson.md) for topic: ${node.id} at ${lessonPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(cheatsheetPath)) {
      console.error(`[ValidationError] Missing cheatsheet explanation (cheatsheet.md) for topic: ${node.id} at ${cheatsheetPath}`);
      process.exit(1);
    }
  });

  // 4. Validate missing hints and build hint index
  const hintIndex = {};
  problemsRegistry.forEach(prob => {
    if (!prob.paths || !prob.paths.hints) {
      console.error(`[ValidationError] Problem "${prob.id}" has missing paths in metadata`);
      process.exit(1);
    }
    const hintsPath = path.resolve(CONTENT_DIR, prob.paths.hints);
    if (!fs.existsSync(hintsPath)) {
      console.error(`[ValidationError] Missing hints file for problem: ${prob.id} at ${hintsPath}`);
      process.exit(1);
    }
    try {
      const hints = JSON.parse(fs.readFileSync(hintsPath, 'utf-8'));
      if (!Array.isArray(hints) || hints.length === 0) {
        console.error(`[ValidationError] Problem ${prob.id} hints.json is empty or not an array`);
        process.exit(1);
      }
      hintIndex[prob.id] = hints;
    } catch (e) {
      console.error(`[ValidationError] Problem ${prob.id} hints.json has invalid JSON: ${e.message}`);
      process.exit(1);
    }
  });

  // 5. Validate broken topic references in graph
  const allNodeIds = new Set(graphNodes.map(n => n.id));
  graphNodes.forEach(node => {
    (node.prerequisites || []).forEach(prereq => {
      if (!allNodeIds.has(prereq)) {
        console.error(`[ValidationError] Topic "${node.id}" has broken prerequisite reference: "${prereq}"`);
        process.exit(1);
      }
    });
  });

  // 6. Compile knowledge and tool indexes
  const knowledgeIndex = graphNodes.map(node => ({
    id: node.id,
    slug: node.slug,
    title: node.title,
    description: node.description,
    difficulty: node.difficulty,
    tags: node.tags || [],
    keywords: node.searchKeywords || []
  }));

  const toolIndex = [
    {
      name: "explainConcept",
      description: "Explains curriculum concept by retrieving lesson.md and cheatsheet.md",
      parameters: ["topicId"]
    },
    {
      name: "recommendNextStep",
      description: "Generates the next study recommend based on current progress & weak topics",
      parameters: []
    },
    {
      name: "revealHint",
      description: "Retrieves a non-spoiler hint for a coding problem",
      parameters: ["problemId"]
    },
    {
      name: "explainCompilerError",
      description: "Interprets syntax, compilation or test execution verdicts errors",
      parameters: ["errorMessage"]
    },
    {
      name: "querySearch",
      description: "Searches curriculum, coding problems and interview questions for matching terms",
      parameters: ["keyword"]
    }
  ];

  const assistantIndex = {
    config: assistantConfig,
    templates: templates,
    tools: toolIndex
  };

  const assistantManifest = {
    version: "1.0",
    templatesCount: Object.keys(templates).length,
    toolsCount: toolIndex.length,
    hintsCount: Object.keys(hintIndex).length,
    activeProvider: assistantConfig.activeProvider
  };

  // Write registries files
  fs.writeFileSync(path.join(GENERATED_DIR, 'content-registry.json'), JSON.stringify(registry, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'problems-registry.json'), JSON.stringify(problemsRegistry, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'knowledge-graph.json'), JSON.stringify(graphNodes, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'topic-dependencies.json'), JSON.stringify(topicDependencies, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'recommendation-index.json'), JSON.stringify(recommendationIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'learning-statistics.json'), JSON.stringify(learningStatistics, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'mastery-config.json'), JSON.stringify(masteryConfig, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'flashcard-index.json'), JSON.stringify(flashcardIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'mindmap-index.json'), JSON.stringify(mindmapIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'revision-index.json'), JSON.stringify(revisionIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'revision-config.json'), JSON.stringify(revisionConfig, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'revision-manifest.json'), JSON.stringify(revisionManifest, null, 2), 'utf-8');

  // Assistant Specific Writes
  fs.writeFileSync(path.join(GENERATED_DIR, 'assistant-index.json'), JSON.stringify(assistantIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'assistant-manifest.json'), JSON.stringify(assistantManifest, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'knowledge-index.json'), JSON.stringify(knowledgeIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'tool-index.json'), JSON.stringify(toolIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'prompt-templates.json'), JSON.stringify(templates, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'hint-index.json'), JSON.stringify(hintIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'assistant-config.json'), JSON.stringify(assistantConfig, null, 2), 'utf-8');

  fs.writeFileSync(path.join(GENERATED_DIR, 'company-index.json'), JSON.stringify(companiesRegistry, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'question-index.json'), JSON.stringify(allQuestions, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'behavior-index.json'), JSON.stringify(allQuestions.filter(q => q.category === 'Behavioral'), null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'system-design-index.json'), JSON.stringify(allQuestions.filter(q => q.category === 'SystemDesign'), null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'interview-roadmap.json'), JSON.stringify(roadmapsRegistry, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'interview-config.json'), JSON.stringify(interviewConfig, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'interview-manifest.json'), JSON.stringify(interviewManifest, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'interview-statistics.json'), JSON.stringify({
    totalSolved: 0,
    averageConfidence: 0.0,
    sessionsCompleted: 0
  }, null, 2), 'utf-8');

  // ── Projects Platform ─────────────────────────────────────────────────────
  console.log('[Content Builder] Processing & validating project-based learning content...');

  const projectsPath = path.join(CONTENT_DIR, 'projects', 'tracks');
  const projectIndex = [];
  const projectRoadmap = {};
  const projectLearningMap = {};
  const resourceIndex = [];
  const templateIndex = [];
  const projectIds = new Set();

  const registeredProblemIds = new Set(problemsRegistry.map(p => p.id));
  const registeredQuestionIds = new Set(allQuestions.map(q => q.id));

  if (fs.existsSync(projectsPath)) {
    const tracks = fs.readdirSync(projectsPath).filter(t => fs.statSync(path.join(projectsPath, t)).isDirectory());

    tracks.forEach(track => {
      const trackPath = path.join(projectsPath, track);
      const projects = fs.readdirSync(trackPath).filter(p => fs.statSync(path.join(trackPath, p)).isDirectory());

      projects.forEach(projectFolder => {
        const projectDir = path.join(trackPath, projectFolder);
        const metaPath = path.join(projectDir, 'metadata.json');
        const milestonesPath = path.join(projectDir, 'milestones.json');
        const tasksPath = path.join(projectDir, 'tasks.json');
        const resourcesPath = path.join(projectDir, 'resources.json');

        // 1. Require metadata.json
        if (!fs.existsSync(metaPath)) {
          console.error(`[ValidationError] Project "${projectFolder}" in track "${track}" is missing metadata.json`);
          process.exit(1);
        }
        let meta;
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        } catch (e) {
          console.error(`[ValidationError] Invalid JSON in metadata.json for project "${projectFolder}": ${e.message}`);
          process.exit(1);
        }

        // 2. Require unique project ID
        if (!meta.id) {
          console.error(`[ValidationError] Project "${projectFolder}" metadata.json is missing "id" field`);
          process.exit(1);
        }
        if (projectIds.has(meta.id)) {
          console.error(`[ValidationError] Duplicate project ID "${meta.id}" found in track "${track}/${projectFolder}"`);
          process.exit(1);
        }
        projectIds.add(meta.id);

        // 3. Require milestones.json with at least 1 milestone
        if (!fs.existsSync(milestonesPath)) {
          console.error(`[ValidationError] Project "${meta.id}" is missing milestones.json`);
          process.exit(1);
        }
        let milestones;
        try {
          milestones = JSON.parse(fs.readFileSync(milestonesPath, 'utf-8'));
        } catch (e) {
          console.error(`[ValidationError] Invalid JSON in milestones.json for project "${meta.id}": ${e.message}`);
          process.exit(1);
        }
        if (!Array.isArray(milestones) || milestones.length === 0) {
          console.error(`[ValidationError] Project "${meta.id}" milestones.json must contain at least 1 milestone`);
          process.exit(1);
        }

        // 4. Require tasks.json
        if (!fs.existsSync(tasksPath)) {
          console.error(`[ValidationError] Project "${meta.id}" is missing tasks.json`);
          process.exit(1);
        }
        let tasks;
        try {
          tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
        } catch (e) {
          console.error(`[ValidationError] Invalid JSON in tasks.json for project "${meta.id}": ${e.message}`);
          process.exit(1);
        }

        // 5. Validate milestone order sequential and no duplicate milestone IDs
        const milestoneIdSet = new Set();
        milestones.forEach((m, idx) => {
          if (!m.id) {
            console.error(`[ValidationError] Project "${meta.id}" milestone at index ${idx} is missing "id"`);
            process.exit(1);
          }
          if (milestoneIdSet.has(m.id)) {
            console.error(`[ValidationError] Duplicate milestone ID "${m.id}" in project "${meta.id}"`);
            process.exit(1);
          }
          milestoneIdSet.add(m.id);
          if (m.order !== idx + 1) {
            console.error(`[ValidationError] Project "${meta.id}" milestone "${m.id}" has incorrect order (expected ${idx + 1}, got ${m.order})`);
            process.exit(1);
          }
        });

        // 6. Validate task learning references (warn only — graph may grow)
        const taskLearningMap = {};
        tasks.forEach(task => {
          if (!task.id) {
            console.error(`[ValidationError] Project "${meta.id}" has a task without an "id" field`);
            process.exit(1);
          }
          // Cross-ref lesson IDs
          (task.relatedLessons || []).forEach(topicId => {
            if (!allTopicIds.has(topicId)) {
              console.warn(`[BuildWarning] Project "${meta.id}" task "${task.id}" references unknown lesson topicId: "${topicId}"`);
            }
          });
          // Cross-ref problem IDs
          (task.relatedProblems || []).forEach(probId => {
            if (!registeredProblemIds.has(probId)) {
              console.warn(`[BuildWarning] Project "${meta.id}" task "${task.id}" references unknown problem: "${probId}"`);
            }
          });
          // Cross-ref question IDs
          (task.relatedQuestions || []).forEach(qId => {
            if (!registeredQuestionIds.has(qId)) {
              console.warn(`[BuildWarning] Project "${meta.id}" task "${task.id}" references unknown question: "${qId}"`);
            }
          });

          taskLearningMap[`${meta.id}:${task.id}`] = {
            lessons: task.relatedLessons || [],
            problems: task.relatedProblems || [],
            cards: task.relatedCards || [],
            questions: task.relatedQuestions || []
          };
        });

        // 7. Accumulate project-learning-map
        Object.assign(projectLearningMap, taskLearningMap);

        // 8. Accumulate project-roadmap
        projectRoadmap[meta.id] = {
          milestones: milestones.map(m => ({
            ...m,
            tasks: tasks.filter(t => t.milestoneId === m.id).map(t => ({
              id: t.id,
              title: t.title,
              estimatedMinutes: t.estimatedMinutes,
              difficulty: t.difficulty,
              isOptional: t.isOptional,
              dependsOn: t.dependsOn
            }))
          }))
        };

        // 9. Accumulate resource-index
        if (fs.existsSync(resourcesPath)) {
          try {
            const resources = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
            resources.forEach(r => {
              resourceIndex.push({ ...r, projectId: meta.id, track });
            });
          } catch {}
        }

        // 10. Build index entry
        const totalTasks = tasks.length;
        const totalMilestones = milestones.length;
        const totalHoursEst = milestones.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

        projectIndex.push({
          id: meta.id,
          title: meta.title,
          description: meta.description,
          track,
          templateType: meta.templateType || 'Intermediate',
          difficulty: meta.difficulty || 'Intermediate',
          estimatedHours: totalHoursEst,
          technologies: meta.technologies || [],
          skills: meta.skills || [],
          prerequisites: meta.prerequisites || [],
          dependsOn: meta.dependsOn || [],
          suggestsNext: meta.suggestsNext || [],
          tags: meta.tags || [],
          totalMilestones,
          totalTasks,
          paths: {
            overview: `projects/tracks/${track}/${projectFolder}/overview.md`,
            requirements: `projects/tracks/${track}/${projectFolder}/requirements.md`,
            architecture: `projects/tracks/${track}/${projectFolder}/architecture.md`,
            roadmap: `projects/tracks/${track}/${projectFolder}/roadmap.md`
          }
        });
      });
    });
  }

  // Build project dependency graph
  const projectDependencyGraph = {};
  projectIndex.forEach(p => {
    projectDependencyGraph[p.id] = {
      title: p.title,
      track: p.track,
      difficulty: p.difficulty,
      dependsOn: p.dependsOn || [],
      suggestsNext: p.suggestsNext || [],
      prerequisites: p.prerequisites || []
    };
  });

  // Build project statistics
  const projectStatistics = {
    totalProjects: projectIndex.length,
    totalTracks: [...new Set(projectIndex.map(p => p.track))].length,
    totalResources: resourceIndex.length,
    byTrack: {},
    byDifficulty: {},
    byTemplateType: {}
  };
  projectIndex.forEach(p => {
    projectStatistics.byTrack[p.track] = (projectStatistics.byTrack[p.track] || 0) + 1;
    projectStatistics.byDifficulty[p.difficulty] = (projectStatistics.byDifficulty[p.difficulty] || 0) + 1;
    projectStatistics.byTemplateType[p.templateType] = (projectStatistics.byTemplateType[p.templateType] || 0) + 1;
  });

  // Build project manifest
  const projectManifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalProjects: projectIndex.length,
    totalMilestones: Object.values(projectRoadmap).reduce((sum, r) => sum + r.milestones.length, 0),
    totalTasks: Object.values(projectLearningMap).length,
    totalResources: resourceIndex.length,
    tracks: [...new Set(projectIndex.map(p => p.track))]
  };

  // Write project registries
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-index.json'), JSON.stringify(projectIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-roadmap.json'), JSON.stringify(projectRoadmap, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-learning-map.json'), JSON.stringify(projectLearningMap, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-dependency-graph.json'), JSON.stringify(projectDependencyGraph, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-statistics.json'), JSON.stringify(projectStatistics, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'project-manifest.json'), JSON.stringify(projectManifest, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'resource-index.json'), JSON.stringify(resourceIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'template-index.json'), JSON.stringify(templateIndex, null, 2), 'utf-8');

  // ── Enterprise Experience Enhancements (v1.1) ───────────────────────────
  console.log('[Content Builder] Building Enterprise SaaS registry indices (v1.1)...');

  // 1. Career Data Loading
  let roadmaps = [];
  let resumeTemplates = [];
  let portfolioTemplates = [];
  const roadmapsPath = path.resolve(CONTENT_DIR, 'career/roadmaps.json');
  const resumeTemplatesPath = path.resolve(CONTENT_DIR, 'career/resume-templates.json');
  const portfolioTemplatesPath = path.resolve(CONTENT_DIR, 'career/portfolio-templates.json');

  if (fs.existsSync(roadmapsPath)) {
    roadmaps = JSON.parse(fs.readFileSync(roadmapsPath, 'utf-8'));
  }
  if (fs.existsSync(resumeTemplatesPath)) {
    resumeTemplates = JSON.parse(fs.readFileSync(resumeTemplatesPath, 'utf-8'));
  }
  if (fs.existsSync(portfolioTemplatesPath)) {
    portfolioTemplates = JSON.parse(fs.readFileSync(portfolioTemplatesPath, 'utf-8'));
  }

  // 2. Global Search Index Building
  const globalSearchIndex = [];

  // Add Courses
  Object.values(registry.courses).forEach(c => {
    globalSearchIndex.push({
      id: `course:${c.id}`,
      title: c.title,
      description: `Structured curriculum career path for learning ${c.title}.`,
      type: 'course',
      difficulty: 'Intermediate',
      technology: ['Java', 'Spring Boot', 'React'],
      track: c.title,
      route: `/courses`
    });
  });

  // Add Lessons/Topics
  searchIndex.forEach(t => {
    globalSearchIndex.push({
      id: `topic:${t.id}`,
      title: t.title,
      description: t.description,
      type: 'topic',
      difficulty: t.difficulty,
      technology: ['Java'],
      track: t.chapterTitle || 'Java',
      route: t.route,
      volume: t.volume,
      paths: t.paths
    });

    // Add Quiz reference
    if (t.paths && t.paths.quiz) {
      globalSearchIndex.push({
        id: `quiz:${t.id}`,
        title: `${t.title} Quiz`,
        description: `Test your understanding of ${t.title}.`,
        type: 'revision_card',
        difficulty: t.difficulty,
        technology: ['Java'],
        track: t.chapterTitle || 'Java',
        route: `/revision`
      });
    }
  });

  // Add Problems
  problemsRegistry.forEach(p => {
    globalSearchIndex.push({
      id: `problem:${p.id}`,
      title: p.title,
      description: `Coding practice problem: ${p.title}. Target topic: ${p.topic}.`,
      type: 'problem',
      difficulty: p.difficulty,
      technology: ['Java'],
      track: p.topic,
      estimatedTime: p.estimatedMinutes,
      route: `/compiler/problems/${p.id}`
    });
  });

  // Add Projects
  projectIndex.forEach(p => {
    globalSearchIndex.push({
      id: `project:${p.id}`,
      title: p.title,
      description: p.description,
      type: 'project',
      difficulty: p.difficulty,
      technology: p.technologies || [],
      track: p.track,
      estimatedTime: p.estimatedHours * 60,
      route: `/projects/${p.id}`
    });
  });

  // Add Career Roadmaps
  roadmaps.forEach(r => {
    globalSearchIndex.push({
      id: `roadmap:${r.id}`,
      title: r.title,
      description: r.description,
      type: 'career_roadmap',
      difficulty: r.difficulty,
      technology: r.technology || [],
      track: r.track,
      route: `/calendar` // linked to plans/calendar
    });
  });

  // Add Resume Templates
  resumeTemplates.forEach(r => {
    globalSearchIndex.push({
      id: `resume:${r.id}`,
      title: r.title,
      description: r.description,
      type: 'resume_template',
      difficulty: r.difficulty || 'Beginner',
      technology: r.technology || [],
      track: r.category,
      route: `/downloads`
    });
  });

  // Add Portfolio Templates
  portfolioTemplates.forEach(p => {
    globalSearchIndex.push({
      id: `portfolio:${p.id}`,
      title: p.title,
      description: p.description,
      type: 'portfolio_template',
      difficulty: 'Beginner',
      technology: p.technology || [],
      track: p.category,
      route: `/downloads`
    });
  });

  // Load Flashcards to include in Search Index
  flashcardIndex.forEach(fcIndex => {
    const fcFullPath = path.resolve(PUBLIC_CONTENT_DIR, fcIndex.path);
    if (fs.existsSync(fcFullPath)) {
      try {
        const cards = JSON.parse(fs.readFileSync(fcFullPath, 'utf-8'));
        cards.forEach((card, cidx) => {
          globalSearchIndex.push({
            id: `flashcard:${card.id || (fcIndex.topicId + '-fc-' + cidx)}`,
            title: `Flashcard: ${card.front}`,
            description: `Topic: ${fcIndex.title}. Answer preview: ${card.back.substring(0, 80)}...`,
            type: 'flashcard',
            difficulty: 'Intermediate',
            technology: ['Java'],
            track: 'Flashcards',
            route: `/revision/flashcards/${fcIndex.slug}`
          });
        });
      } catch {}
    }
  });

  // Load Interview Questions into Search Index
  allQuestions.forEach(q => {
    globalSearchIndex.push({
      id: `question:${q.id}`,
      title: q.question,
      description: `Interview Question: ${q.sampleAnswer ? q.sampleAnswer.substring(0, 100) + '...' : q.topic}`,
      type: 'interview_question',
      difficulty: q.difficulty || 'Medium',
      technology: [q.topic || 'General'],
      track: q.category || 'Interview',
      route: `/interviews`
    });
  });

  // 3. Command Index
  const commandPaletteIndex = [
    { "id": "nav-dashboard", "name": "Open Dashboard", "category": "Navigation", "route": "/" },
    { "id": "nav-courses", "name": "Open Courses & Lessons", "category": "Navigation", "route": "/courses" },
    { "id": "nav-compiler", "name": "Open Practice Compiler Sandbox", "category": "Navigation", "route": "/compiler" },
    { "id": "nav-interviews", "name": "Open Mock Interviews", "category": "Navigation", "route": "/interviews" },
    { "id": "nav-revision", "name": "Open Spaced Revision", "category": "Navigation", "route": "/revision" },
    { "id": "nav-projects", "name": "Open Guided Projects Platform", "category": "Navigation", "route": "/projects" },
    { "id": "nav-assistant", "name": "Open AI Learning Assistant", "category": "Navigation", "route": "/assistant" },
    { "id": "nav-calendar", "name": "Open Learning Calendar", "category": "Navigation", "route": "/calendar" },
    { "id": "nav-notes", "name": "Open Notes & Highlights Center", "category": "Navigation", "route": "/notes" },
    { "id": "nav-bookmarks", "name": "Open Unified Bookmarks", "category": "Navigation", "route": "/bookmarks" },
    { "id": "nav-timeline", "name": "Open Activity Timeline", "category": "Navigation", "route": "/timeline" },
    { "id": "nav-achievements", "name": "Open Achievement Board", "category": "Navigation", "route": "/achievements" },
    { "id": "nav-downloads", "name": "Open Download Center", "category": "Navigation", "route": "/downloads" },
    { "id": "nav-exports", "name": "Open Export Center", "category": "Navigation", "route": "/exports" },
    { "id": "cmd-theme", "name": "Toggle Color Theme (Dark/Light)", "category": "Preferences", "action": "toggleTheme" },
    { "id": "cmd-sidebar", "name": "Toggle Navigation Sidebar", "category": "Preferences", "action": "toggleSidebar" }
  ];

  // 4. Achievement Index
  const achievementIndex = [
    { "id": "ach-java-volume-1", "title": "Java Fundamentals Champion", "description": "Complete all topics in Java Volume 1.", "type": "volume", "target": 1, "skills": ["Java Syntax", "Core OOP"] },
    { "id": "ach-java-course", "title": "Java Master Developer", "description": "Complete the entire Java Full Stack Career Path.", "type": "course", "target": 1, "skills": ["Enterprise Java", "Spring Boot", "React Integration"] },
    { "id": "ach-solve-100", "title": "Problem Solver (Bronze)", "description": "Solve 100 coding problems in the Practice Sandbox.", "type": "problems", "target": 100, "skills": ["Algorithm Design", "Code Debugging"] },
    { "id": "ach-solve-500", "title": "Problem Solver (Gold)", "description": "Solve 500 coding problems in the Practice Sandbox.", "type": "problems", "target": 500, "skills": ["Advanced Algorithms", "Competitive Coding"] },
    { "id": "ach-revision-cycle", "title": "Revision Master", "description": "Complete a full spaced repetition revision session.", "type": "revision", "target": 1, "skills": ["Spaced Repetition", "Active Recall"] },
    { "id": "ach-interview-ready", "title": "Interview Ready", "description": "Complete 5 company mock interview sessions.", "type": "interview", "target": 5, "skills": ["Interview Communication", "Technical QA"] },
    { "id": "ach-project-completed", "title": "Shipped to Production", "description": "Complete a full-stack guided project with all milestones.", "type": "project", "target": 1, "skills": ["Architecture Design", "Deployment Pipelines"] },
    { "id": "ach-resume-generated", "title": "Career Launchpad", "description": "Generate your professional developer resume.", "type": "resume", "target": 1, "skills": ["Career Assets", "Resume Building"] },
    { "id": "ach-portfolio-published", "title": "Portfolio Creator", "description": "Customize and export your portfolio template.", "type": "portfolio", "target": 1, "skills": ["Portfolio Development", "Web Showcase"] },
    { "id": "ach-career-ready", "title": "Enterprise Career Ready", "description": "Unlock career roadmap achievements, resume, and portfolio.", "type": "career", "target": 1, "skills": ["Job Hunt Strategy", "Full Stack Competence"] }
  ];

  // 5. Download Index
  const downloadIndex = [
    { "id": "dl-java-cheat-sheet", "title": "Java Cheat Sheet Quick Reference", "type": "CheatSheet", "format": "Markdown", "path": "courses/java/volume-1/chapters/chapter-1/topics/variables/cheatsheet.md", "sizeBytes": 1500 },
    { "id": "dl-resume-java-junior", "title": "Junior Java Full Stack Resume Template", "type": "Resume", "format": "JSON", "path": "career/resume-templates.json", "sizeBytes": 1200 },
    { "id": "dl-portfolio-minimalist", "title": "Minimalist Developer Portfolio Template", "type": "Portfolio", "format": "JSON", "path": "career/portfolio-templates.json", "sizeBytes": 850 }
  ];

  // Add lessons cheatsheets as downloadable resources automatically
  searchIndex.forEach(t => {
    if (t.paths && t.paths.cheatsheet) {
      downloadIndex.push({
        id: `dl-cs-${t.id}`,
        title: `${t.title} Reference Cheat Sheet`,
        type: 'CheatSheet',
        format: 'Markdown',
        path: t.paths.cheatsheet,
        sizeBytes: 2500
      });
    }
  });

  // ── Build-time Validation ───────────────────────────────────────────────
  console.log('[Content Builder] Validating generated index integrity...');
  const globalIds = new Set();
  const duplicateIds = [];
  const brokenLinks = [];

  // Check unique IDs in global search index
  globalSearchIndex.forEach(item => {
    if (!item.id) {
      console.error('[ValidationError] Search index item is missing unique ID:', item);
      process.exit(1);
    }
    if (globalIds.has(item.id)) {
      duplicateIds.push(item.id);
    }
    globalIds.add(item.id);

    // Verify static content paths if present
    if (item.paths) {
      Object.entries(item.paths).forEach(([key, relPath]) => {
        const fullP = path.resolve(CONTENT_DIR, relPath);
        if (!fs.existsSync(fullP)) {
          brokenLinks.push(`Item ID ${item.id} field paths.${key} broken reference: ${relPath}`);
        }
      });
    }
  });

  // Verify command IDs
  commandPaletteIndex.forEach(cmd => {
    if (globalIds.has(cmd.id)) {
      duplicateIds.push(cmd.id);
    }
    globalIds.add(cmd.id);
  });

  // Verify achievements IDs
  achievementIndex.forEach(ach => {
    if (globalIds.has(ach.id)) {
      duplicateIds.push(ach.id);
    }
    globalIds.add(ach.id);
  });

  // Verify downloads paths
  downloadIndex.forEach(dl => {
    if (globalIds.has(dl.id)) {
      duplicateIds.push(dl.id);
    }
    globalIds.add(dl.id);

    const fullP = path.resolve(CONTENT_DIR, dl.path);
    if (!fs.existsSync(fullP)) {
      brokenLinks.push(`Download Asset ID ${dl.id} broken path reference: ${dl.path}`);
    }
  });

  if (duplicateIds.length > 0) {
    console.error('[ValidationError] Build failed due to duplicate registry IDs:', duplicateIds);
    process.exit(1);
  }

  if (brokenLinks.length > 0) {
    console.error('[ValidationError] Build failed due to broken file references:', brokenLinks);
    process.exit(1);
  }

  console.log('[Content Builder] Validation passed. All IDs are unique and references are intact.');

  // Write registries files
  fs.writeFileSync(path.join(GENERATED_DIR, 'global-search-index.json'), JSON.stringify(globalSearchIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'command-index.json'), JSON.stringify(commandPaletteIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'achievement-index.json'), JSON.stringify(achievementIndex, null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'download-index.json'), JSON.stringify(downloadIndex, null, 2), 'utf-8');

  // Schema placeholders
  fs.writeFileSync(path.join(GENERATED_DIR, 'calendar-index.json'), JSON.stringify([], null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'bookmark-index.json'), JSON.stringify([], null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'export-index.json'), JSON.stringify([], null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'timeline-index.json'), JSON.stringify([], null, 2), 'utf-8');
  fs.writeFileSync(path.join(GENERATED_DIR, 'notes-index.json'), JSON.stringify([], null, 2), 'utf-8');

  console.log('[Content Builder] All Enterprise v1.1 index files successfully generated and written.');

  console.log('[Content Builder] All graph & registry files written to src/shared/generated/');
  copyRecursiveSync(CONTENT_DIR, PUBLIC_CONTENT_DIR);
  console.log('[Content Builder] Asset resources copied to public/content/');
}

buildRegistry();
