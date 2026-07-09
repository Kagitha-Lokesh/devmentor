/**
 * IMetadataRepository Interface
 * Contract for retrieving the flat search metadata index.
 */
export class IMetadataRepository {
  async getSearchIndex() {
    throw new Error('Method not implemented: getSearchIndex');
  }
}
export default IMetadataRepository;
