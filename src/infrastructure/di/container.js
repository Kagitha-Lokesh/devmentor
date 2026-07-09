import { environment } from '../env/environment';
import { CentralizedLogger } from '../logger/CentralizedLogger';
import { LiveFirebaseAuthService, MockFirebaseAuthService } from '../firebase/auth/FirebaseAuthService';
import { FirestoreUserRepository } from '../repository/FirestoreUserRepository';
import { FirebaseAnalyticsService } from '../firebase/analytics/FirebaseAnalyticsService';
import { LocalCourseRepository } from '../repository/LocalCourseRepository';
import { LocalContentRepository } from '../repository/LocalContentRepository';
import { LocalMetadataRepository } from '../repository/LocalMetadataRepository';
import { StaticProblemRepository } from '../repository/StaticProblemRepository';
import { FirestoreSubmissionRepository } from '../repository/FirestoreSubmissionRepository';
import { PistonExecutionProvider } from '../execution/PistonExecutionProvider';
import { IEvaluationService } from '../../domain/evaluation/IEvaluationService';
import { StaticKnowledgeGraphRepository } from '../repository/StaticKnowledgeGraphRepository';
import { FirestoreProgressRepository } from '../repository/FirestoreProgressRepository';
import { FirestoreMasteryRepository } from '../repository/FirestoreMasteryRepository';
import { FirestoreActivityRepository } from '../repository/FirestoreActivityRepository';
import { DefaultMasteryCalculator } from '../calculator/DefaultMasteryCalculator';
import { RecommendationEngine } from '../recommendation/RecommendationEngine';
import { LearningUseCase } from '../../application/learning/LearningUseCase';
import { StaticFlashcardRepository } from '../repository/StaticFlashcardRepository';
import { StaticCheatSheetRepository } from '../repository/StaticCheatSheetRepository';
import { StaticMindMapRepository } from '../repository/StaticMindMapRepository';
import { DefaultRevisionScheduler } from '../spaced-repetition/DefaultRevisionScheduler';
import { FirestoreRevisionRepository } from '../repository/FirestoreRevisionRepository';
import { RevisionUseCase } from '../../application/revision/RevisionUseCase';
import { StaticCompanyRepository } from '../repository/StaticCompanyRepository';
import { StaticInterviewRepository } from '../repository/StaticInterviewRepository';
import { FirestoreInterviewRepository } from '../repository/FirestoreInterviewRepository';
import { InterviewUseCase } from '../../application/interview/InterviewUseCase';
import { FirestoreConversationRepository } from '../repository/FirestoreConversationRepository';
import { LocalPreferencesRepository } from '../repository/LocalPreferencesRepository';
import { RuleBasedAssistantProvider } from '../assistant/RuleBasedAssistantProvider';
import { OllamaAssistantProvider } from '../assistant/OllamaAssistantProvider';
import { AssistantUseCase } from '../../application/assistant/AssistantUseCase';
import { StaticProjectRepository } from '../repository/StaticProjectRepository';
import { FirestoreProjectProgressRepository } from '../repository/FirestoreProjectProgressRepository';
import { ProjectUseCase } from '../../application/projects/ProjectUseCase';
import { SearchRepository } from '../repository/SearchRepository';
import { NotesRepository } from '../repository/NotesRepository';
import { BookmarkRepository } from '../repository/BookmarkRepository';
import { TimelineRepository } from '../repository/TimelineRepository';
import { AchievementRepository } from '../repository/AchievementRepository';
import { CalendarRepository } from '../repository/CalendarRepository';
import { DownloadRepository } from '../repository/DownloadRepository';
import { ExportRepository } from '../repository/ExportRepository';
import { SearchUseCase } from '../../application/search/SearchUseCase';
import { BookmarkUseCase } from '../../application/bookmarks/BookmarkUseCase';
import { NotesUseCase } from '../../application/notes/NotesUseCase';
import { TimelineUseCase } from '../../application/timeline/TimelineUseCase';
import { AchievementUseCase } from '../../application/achievements/AchievementUseCase';
import { CalendarUseCase } from '../../application/calendar/CalendarUseCase';
import { DownloadUseCase } from '../../application/downloads/DownloadUseCase';
import { ExportUseCase } from '../../application/exports/ExportUseCase';

class Container {
  constructor() {
    this.services = new Map();
  }

  initialize() {
    // Register Logger & Environment
    const logger = new CentralizedLogger();
    this.services.set('ILogger', logger);
    this.services.set('environment', environment);

    // Register Auth Service (Live vs Mock)
    const authService = environment.isMock 
      ? new MockFirebaseAuthService() 
      : new LiveFirebaseAuthService();
    this.services.set('IAuthService', authService);

    // Register Analytics Service
    const analyticsService = new FirebaseAnalyticsService();
    this.services.set('IAnalyticsService', analyticsService);

    // Register Repositories
    const userRepository = new FirestoreUserRepository();
    this.services.set('IUserRepository', userRepository);

    const courseRepository = new LocalCourseRepository();
    this.services.set('ICourseRepository', courseRepository);

    const contentRepository = new LocalContentRepository();
    this.services.set('IContentRepository', contentRepository);

    const metadataRepository = new LocalMetadataRepository();
    this.services.set('IMetadataRepository', metadataRepository);

    const problemRepository = new StaticProblemRepository();
    this.services.set('IProblemRepository', problemRepository);

    const submissionRepository = new FirestoreSubmissionRepository();
    this.services.set('ISubmissionRepository', submissionRepository);

    const executionProvider = new PistonExecutionProvider();
    this.services.set('IExecutionProvider', executionProvider);

    const evaluationService = new IEvaluationService();
    this.services.set('IEvaluationService', evaluationService);

    const knowledgeGraphRepository = new StaticKnowledgeGraphRepository();
    this.services.set('IKnowledgeGraphRepository', knowledgeGraphRepository);

    const progressRepository = new FirestoreProgressRepository();
    this.services.set('IProgressRepository', progressRepository);

    const masteryRepository = new FirestoreMasteryRepository();
    this.services.set('IMasteryRepository', masteryRepository);

    const activityRepository = new FirestoreActivityRepository();
    this.services.set('IActivityRepository', activityRepository);

    const masteryCalculator = new DefaultMasteryCalculator();
    this.services.set('IMasteryCalculator', masteryCalculator);

    const recommendationEngine = new RecommendationEngine();
    this.services.set('IRecommendationEngine', recommendationEngine);

    // Register Spaced Repetition / Revision Repositories
    const staticFlashcardRepo = new StaticFlashcardRepository();
    this.services.set('IFlashcardRepository', staticFlashcardRepo);

    const staticCheatSheetRepo = new StaticCheatSheetRepository();
    this.services.set('ICheatSheetRepository', staticCheatSheetRepo);

    const staticMindMapRepo = new StaticMindMapRepository();
    this.services.set('IMindMapRepository', staticMindMapRepo);

    const srEngine = new DefaultRevisionScheduler();
    this.services.set('ISpacedRepetitionEngine', srEngine);

    const revisionRepo = new FirestoreRevisionRepository();
    this.services.set('IRevisionRepository', revisionRepo);

    // Register UseCases last to resolve repository dependencies
    const learningUseCase = new LearningUseCase();
    this.services.set('LearningUseCase', learningUseCase);

    const revisionUseCase = new RevisionUseCase();
    this.services.set('RevisionUseCase', revisionUseCase);

    // Register Interview Platform Repositories
    const companyRepository = new StaticCompanyRepository();
    this.services.set('ICompanyRepository', companyRepository);

    const interviewRepository = new StaticInterviewRepository();
    this.services.set('IInterviewRepository', interviewRepository);

    const interviewSessionRepository = new FirestoreInterviewRepository();
    this.services.set('IInterviewSessionRepository', interviewSessionRepository);
    this.services.set('IInterviewStatisticsRepository', interviewSessionRepository); // same adapter

    // Register Interview Use Case
    const interviewUseCase = new InterviewUseCase();
    this.services.set('InterviewUseCase', interviewUseCase);

    // Register Assistant Repositories & Preferences
    const convRepository = new FirestoreConversationRepository();
    this.services.set('IConversationRepository', convRepository);

    const prefRepository = new LocalPreferencesRepository();
    this.services.set('IAssistantPreferencesRepository', prefRepository);

    // Register Providers
    const ruleBasedProvider = new RuleBasedAssistantProvider();
    this.services.set('RuleBasedAssistantProvider', ruleBasedProvider);

    const ollamaProvider = new OllamaAssistantProvider();
    this.services.set('OllamaAssistantProvider', ollamaProvider);

    // Register Assistant Use Case
    const assistantUseCase = new AssistantUseCase();
    this.services.set('AssistantUseCase', assistantUseCase);

    // Register Projects Platform Repositories & Use Cases
    const projectRepo = new StaticProjectRepository();
    this.services.set('IProjectRepository', projectRepo);

    const projectProgressRepo = new FirestoreProjectProgressRepository();
    this.services.set('IProjectProgressRepository', projectProgressRepo);

    const projectUseCase = new ProjectUseCase();
    this.services.set('ProjectUseCase', projectUseCase);

    // Register v1.1 Enterprise Enhancement Repositories
    const searchRepo = new SearchRepository();
    this.services.set('ISearchRepository', searchRepo);

    const notesRepo = new NotesRepository();
    this.services.set('INotesRepository', notesRepo);

    const bookmarkRepo = new BookmarkRepository();
    this.services.set('IBookmarkRepository', bookmarkRepo);

    const timelineRepo = new TimelineRepository();
    this.services.set('ITimelineRepository', timelineRepo);

    const achievementRepo = new AchievementRepository();
    this.services.set('IAchievementRepository', achievementRepo);

    const calendarRepo = new CalendarRepository();
    this.services.set('ICalendarRepository', calendarRepo);

    const downloadRepo = new DownloadRepository();
    this.services.set('IDownloadRepository', downloadRepo);

    const exportRepo = new ExportRepository();
    this.services.set('IExportRepository', exportRepo);

    // Register v1.1 Enterprise Enhancement Use Cases
    const searchUseCase = new SearchUseCase();
    this.services.set('SearchUseCase', searchUseCase);

    const bookmarkUseCase = new BookmarkUseCase();
    this.services.set('BookmarkUseCase', bookmarkUseCase);

    const notesUseCase = new NotesUseCase();
    this.services.set('NotesUseCase', notesUseCase);

    const timelineUseCase = new TimelineUseCase();
    this.services.set('TimelineUseCase', timelineUseCase);

    const achievementUseCase = new AchievementUseCase();
    this.services.set('AchievementUseCase', achievementUseCase);

    const calendarUseCase = new CalendarUseCase();
    this.services.set('CalendarUseCase', calendarUseCase);

    const downloadUseCase = new DownloadUseCase();
    this.services.set('DownloadUseCase', downloadUseCase);

    const exportUseCase = new ExportUseCase();
    this.services.set('ExportUseCase', exportUseCase);
  }

  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not registered in the DI Container.`);
    }
    return service;
  }
}

export const container = new Container();
container.initialize();
export default container;
