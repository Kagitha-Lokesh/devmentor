/**
 * ICurriculumRepository — Domain interface for curriculum manifest + index queries.
 *
 * Provides read-only access to the canonical curriculum structure defined in
 * curriculum-manifest.json and the build-time curriculum-index.json.
 *
 * Follows the repository pattern used throughout JavaMentor's Clean Architecture.
 */
export class ICurriculumRepository {
  /**
   * Returns the full curriculum manifest (module/volume/chapter hierarchy).
   * @returns {Promise<object>} The parsed curriculum-manifest.json
   */
  async getManifest() {
    throw new Error('Method not implemented: getManifest');
  }

  /**
   * Returns the build-time ordered topic index.
   * @returns {Promise<object>} The parsed curriculum-index.json
   */
  async getCurriculumIndex() {
    throw new Error('Method not implemented: getCurriculumIndex');
  }

  /**
   * Returns all modules in canonical order (order asc).
   * @returns {Promise<Array>} Module definitions from the manifest
   */
  async getModules() {
    throw new Error('Method not implemented: getModules');
  }

  /**
   * Returns a single module by ID.
   * @param {string} moduleId
   * @returns {Promise<object|null>}
   */
  async getModule(moduleId) {
    throw new Error('Method not implemented: getModule');
  }

  /**
   * Returns a single volume definition within a module.
   * @param {string} moduleId
   * @param {number} volumeOrder
   * @returns {Promise<object|null>}
   */
  async getVolume(moduleId, volumeOrder) {
    throw new Error('Method not implemented: getVolume');
  }

  /**
   * Returns a single chapter definition within a volume.
   * @param {string} moduleId
   * @param {number} volumeOrder
   * @param {number} chapterOrder
   * @returns {Promise<object|null>}
   */
  async getChapter(moduleId, volumeOrder, chapterOrder) {
    throw new Error('Method not implemented: getChapter');
  }
}

export default ICurriculumRepository;
