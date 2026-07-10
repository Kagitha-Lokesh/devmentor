/**
 * StaticCurriculumRepository — Static implementation of ICurriculumRepository.
 *
 * Loads the build-time generated curriculum-manifest.json and curriculum-index.json.
 * All lookups are O(1) via pre-built Maps initialized on construction.
 */
import { ICurriculumRepository } from '../../domain/repository/ICurriculumRepository';
import manifest from '../../shared/config/curriculum-manifest.json';
import curriculumIndex from '../../shared/generated/curriculum-index.json';

export class StaticCurriculumRepository extends ICurriculumRepository {
  constructor() {
    super();

    // Pre-build lookup maps for O(1) queries
    this._manifest = manifest;
    this._index    = curriculumIndex;

    // moduleId → module definition
    this._moduleMap = new Map(
      (manifest.modules || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(m => [m.id, m])
    );

    // "moduleId:volumeOrder" → volume definition
    this._volumeMap = new Map();
    // "moduleId:volumeOrder:chapterOrder" → chapter definition
    this._chapterMap = new Map();

    for (const mod of manifest.modules || []) {
      for (const vol of mod.volumes || []) {
        this._volumeMap.set(`${mod.id}:${vol.order}`, vol);
        for (const chap of vol.chapters || []) {
          this._chapterMap.set(`${mod.id}:${vol.order}:${chap.order}`, chap);
        }
      }
    }
  }

  async getManifest() {
    return this._manifest;
  }

  async getCurriculumIndex() {
    return this._index;
  }

  async getModules() {
    return [...this._moduleMap.values()];
  }

  async getModule(moduleId) {
    return this._moduleMap.get(moduleId) ?? null;
  }

  async getVolume(moduleId, volumeOrder) {
    return this._volumeMap.get(`${moduleId}:${volumeOrder}`) ?? null;
  }

  async getChapter(moduleId, volumeOrder, chapterOrder) {
    return this._chapterMap.get(`${moduleId}:${volumeOrder}:${chapterOrder}`) ?? null;
  }
}

export default StaticCurriculumRepository;
