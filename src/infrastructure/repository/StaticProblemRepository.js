import registry from '../../shared/generated/problems-registry.json';
import { Problem } from '../../domain/models/Problem';
import { IProblemRepository } from '../../domain/repository/IProblemRepository';

export class StaticProblemRepository extends IProblemRepository {
  async listProblems() {
    return registry.map(p => new Problem(p));
  }

  async getProblem(problemId) {
    const data = registry.find(p => p.id === problemId);
    if (!data) return null;
    return new Problem(data);
  }
}
export default StaticProblemRepository;
