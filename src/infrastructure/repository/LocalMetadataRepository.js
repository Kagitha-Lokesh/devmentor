import searchIndex from '../../shared/generated/search-index.json';
import { IMetadataRepository } from '../../domain/repository/IMetadataRepository';

export class LocalMetadataRepository extends IMetadataRepository {
  async getSearchIndex() {
    return searchIndex;
  }
}
export default LocalMetadataRepository;
