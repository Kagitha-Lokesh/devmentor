/**
 * patch-topic-metadata.js
 * Batch-adds courseId, moduleId, volumeOrder, chapterOrder, topicOrder
 * to all 35 topic metadata.json files.
 * Run once: node scripts/patch-topic-metadata.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../content/courses');

// Canonical assignment table — derived from curriculum-manifest.json + topic IDs
// Format: topicId → { courseId, moduleId, volumeOrder, chapterOrder, topicOrder }
const TOPIC_ASSIGNMENTS = {
  // Java Core & Advanced — Volume 1, Chapter 1 (Core Syntax)
  'V1-C1-T1': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 1 },
  'V1-C1-T2': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 2 },
  'V1-C1-T3': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 3 },
  'V1-C1-T4': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 4 },
  'V1-C1-T5': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 5 },
  'V1-C1-T6': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 1, topicOrder: 6 },
  // Java Core & Advanced — Volume 1, Chapter 2 (OOP)
  'V1-C2-T1': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 2, topicOrder: 1 },
  'V1-C2-T2': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 2, topicOrder: 2 },
  'V1-C2-T3': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 2, topicOrder: 3 },
  'V1-C2-T4': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 2, topicOrder: 4 },
  // Java Core & Advanced — Volume 1, Chapter 3 (Advanced Java)
  'V1-C3-T1': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 3, topicOrder: 1 },
  'V1-C3-T2': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 3, topicOrder: 2 },
  'V1-C3-T3': { courseId: 'java',     moduleId: 'java',    volumeOrder: 1, chapterOrder: 3, topicOrder: 3 },
  // React & Frontend — Volume 1 (CSS)
  'FE-V1-C1-T1': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 1, topicOrder: 1 },
  'FE-V1-C1-T2': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 1, topicOrder: 2 },
  'FE-V1-C1-T3': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 1, topicOrder: 3 },
  // React & Frontend — Volume 1 (JavaScript)
  'FE-V1-C2-T1': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 2, topicOrder: 1 },
  'FE-V1-C2-T2': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 2, topicOrder: 2 },
  'FE-V1-C2-T3': { courseId: 'frontend', moduleId: 'react', volumeOrder: 1, chapterOrder: 2, topicOrder: 3 },
  // React & Frontend — Volume 2 (React Core)
  'FE-V2-C1-T1': { courseId: 'frontend', moduleId: 'react', volumeOrder: 2, chapterOrder: 1, topicOrder: 1 },
  'FE-V2-C1-T2': { courseId: 'frontend', moduleId: 'react', volumeOrder: 2, chapterOrder: 1, topicOrder: 2 },
  'FE-V2-C1-T3': { courseId: 'frontend', moduleId: 'react', volumeOrder: 2, chapterOrder: 1, topicOrder: 3 },
  // React & Frontend — Volume 2 (Advanced React)
  'FE-V2-C2-T1': { courseId: 'frontend', moduleId: 'react', volumeOrder: 2, chapterOrder: 2, topicOrder: 1 },
  'FE-V2-C2-T2': { courseId: 'frontend', moduleId: 'react', volumeOrder: 2, chapterOrder: 2, topicOrder: 2 },
  // SQL & Databases — Volume 1, Chapter 1
  'DB-V1-C1-T1': { courseId: 'database', moduleId: 'sql', volumeOrder: 1, chapterOrder: 1, topicOrder: 1 },
  'DB-V1-C1-T2': { courseId: 'database', moduleId: 'sql', volumeOrder: 1, chapterOrder: 1, topicOrder: 2 },
  'DB-V1-C1-T3': { courseId: 'database', moduleId: 'sql', volumeOrder: 1, chapterOrder: 1, topicOrder: 3 },
  // SQL & Databases — Volume 1, Chapter 2
  'DB-V1-C2-T1': { courseId: 'database', moduleId: 'sql', volumeOrder: 1, chapterOrder: 2, topicOrder: 1 },
  'DB-V1-C2-T2': { courseId: 'database', moduleId: 'sql', volumeOrder: 1, chapterOrder: 2, topicOrder: 2 },
  // Spring Boot & Backend — Volume 1, Chapter 1
  'BE-V1-C1-T1': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 1, topicOrder: 1 },
  'BE-V1-C1-T2': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 1, topicOrder: 2 },
  'BE-V1-C1-T3': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 1, topicOrder: 3 },
  // Spring Boot & Backend — Volume 1, Chapter 2
  'BE-V1-C2-T1': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 2, topicOrder: 1 },
  'BE-V1-C2-T2': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 2, topicOrder: 2 },
  'BE-V1-C2-T3': { courseId: 'backend',  moduleId: 'backend', volumeOrder: 1, chapterOrder: 2, topicOrder: 3 },
};

let updated = 0;
let skipped = 0;
let errors  = 0;

function walkTopics(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walkTopics(full);
    else if (entry === 'metadata.json' && full.includes(`${path.sep}topics${path.sep}`)) {
      patchMetadata(full);
    }
  }
}

function patchMetadata(filePath) {
  try {
    const raw  = fs.readFileSync(filePath, 'utf-8');
    const meta = JSON.parse(raw);
    const assignment = TOPIC_ASSIGNMENTS[meta.id];

    if (!assignment) {
      console.warn(`[WARN] No assignment found for id "${meta.id}" in ${filePath}`);
      skipped++;
      return;
    }

    // Only patch if fields are missing or differ
    const needsPatch = (
      meta.courseId     !== assignment.courseId     ||
      meta.moduleId     !== assignment.moduleId     ||
      meta.volumeOrder  !== assignment.volumeOrder  ||
      meta.chapterOrder !== assignment.chapterOrder ||
      meta.topicOrder   !== assignment.topicOrder
    );

    if (!needsPatch) {
      skipped++;
      return;
    }

    // Inject fields after 'id' for clean JSON ordering
    const patched = {
      id:           meta.id,
      slug:         meta.slug,
      title:        meta.title,
      description:  meta.description,
      courseId:     assignment.courseId,
      moduleId:     assignment.moduleId,
      volumeOrder:  assignment.volumeOrder,
      chapterOrder: assignment.chapterOrder,
      topicOrder:   assignment.topicOrder,
      // Preserve all other existing fields
      ...Object.fromEntries(
        Object.entries(meta).filter(([k]) =>
          !['id','slug','title','description','courseId','moduleId','volumeOrder','chapterOrder','topicOrder'].includes(k)
        )
      )
    };

    fs.writeFileSync(filePath, JSON.stringify(patched, null, 2) + '\n', 'utf-8');
    console.log(`[PATCHED] ${meta.id} → ${assignment.moduleId} v${assignment.volumeOrder}.ch${assignment.chapterOrder}.t${assignment.topicOrder}`);
    updated++;
  } catch (err) {
    console.error(`[ERROR] Failed to patch ${filePath}: ${err.message}`);
    errors++;
  }
}

console.log('[Metadata Patcher] Starting...');
walkTopics(CONTENT_DIR);
console.log(`\n[Metadata Patcher] Done. Updated: ${updated} | Already correct: ${skipped} | Errors: ${errors}`);

if (errors > 0) {
  console.error('[Metadata Patcher] Completed with errors — check output above.');
  process.exit(1);
}
