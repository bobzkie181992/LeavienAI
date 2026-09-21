export type ItemStatus = 'Draft' | 'For Validation' | 'Validated' | 'Active' | 'Inactive';

export const isValidatedOrActive = (problem: Problem): boolean => {
  if (!problem.status) return true; // Default legacy items to Active
  return problem.status === 'Validated' || problem.status === 'Active';
};

export interface Problem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  topic: string;
  competency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyParameter: number;
  discriminationParameter: number;
  cognitiveLevel: string;
  misconceptionCategory: string;
  hint1: string;
  hint2: string;
  hint3?: string;
  hints?: string[];
  explanation: string;
  remediation: string;
  status?: ItemStatus;
}

export interface AIMistakeGuidance {
  coachingMessage: string;
  hint1Conceptual: string;
  hint2Procedural: string;
  hint3FirstStep: string;
  category: MathErrorCategory;
  remediationTip?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topicId: string;
  problems: Problem[];
  xpReward: number;
  quizType?: 'diagnostic' | 'assessment';
  level?: number;
}

export type MathErrorCategory = 
  | 'Sign error'
  | 'Formula error'
  | 'Computational error'
  | 'Conceptual misunderstanding'
  | 'Incorrect procedure'
  | 'Misreading the problem'
  | 'Algebraic manipulation error';

export interface ErrorPatternOccurrence {
  id?: string;
  category: MathErrorCategory;
  problemId: string;
  questionText: string;
  competency: string;
  selectedOptionText: string;
  correctOptionText: string;
  timestamp: string;
  explanation?: string;
  specificDiagnosis?: string;
}

export interface ErrorRemediationModule {
  category: MathErrorCategory;
  triggerReason: string;
  misconceptionAnalysis: string;
  shortExplanation: {
    title: string;
    rules: string[];
    keyTakeaways: string;
  };
  workedExample: {
    title: string;
    problemText: string;
    commonMistake: string;
    correctMethod: string;
    stepByStep: string[];
  };
  practiceQuestions: Problem[];
  reassessmentQuestions: Problem[];
}

export interface ItemResponse {
  problemId: string;
  topic?: string;
  questionText?: string;
  competency: string;
  selectedOption: number;
  selectedOptionText?: string;
  isCorrect: boolean;
  difficultyParameter: number; // IRT b parameter
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  discriminationParameter: number; // IRT a parameter
  responseTimeMs: number;
  abilityEstimateBefore?: number; // theta before this item
  abilityBandBefore?: string; // ability band before item
  abilityEstimateAfter?: number; // theta after this item
  abilityBandAfter?: string; // ability band after item
  attemptsCount?: number;
  hintsUsed?: number;
  remediationProvided?: boolean;
  errorCategory?: MathErrorCategory;
  errorFeedback?: string;
}

export interface ItemStats {
  problemId: string;
  timesAnswered: number;
  timesCorrect: number;
  pValue: number; // Proportion correct (0 to 1)
  avgResponseTimeMs: number;
  optionCounts: [number, number, number, number];
  discriminationIndex: number;
}

export interface QuizResult {
  id?: string;
  userId: string;
  quizId: string;
  score: number;
  total: number;
  timestamp: string;
  itemResponses?: ItemResponse[];
  attemptNumber?: number;
  abilityEstimate?: string;
  mathAbilityDiagnosis?: string;
  violations?: number;
  quizMode?: 'diagnostic' | 'assessment' | 'adaptive' | 'timed' | 'standard' | 'summative';
  isCompetent?: boolean;
  summativeTranscript?: SummativeTranscript;
}

export type CognitiveDomain = 
  | 'Remembering / Understanding' 
  | 'Applying' 
  | 'Analyzing / Evaluating' 
  | 'Evaluating / Proving'
  | 'Creating / Problem Solving';

export interface IntendedOutcome {
  id: string;
  code: string; // e.g., 'M11GM-Ia-1'
  title: string;
  description: string;
  statement?: string; // Optional alias for description
  cognitiveDomain: CognitiveDomain;
  weightPercentage: number;
  targetItemsCount: number;
}

export interface TableOfSpecificationItem {
  outcomeId: string;
  outcomeCode: string;
  competencyTitle: string;
  cognitiveDomain: string;
  itemNumbers: number[];
  percentageWeight: number;
  totalItems?: number; // Optional alias or helper for itemNumbers.length
}

export interface SummativeAssessment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  topicId: string;
  topicTitle: string;
  gradeLevel: string;
  term: string;
  durationMinutes: number;
  passingScorePercentage: number;
  passingScore?: number; // Optional alias for passingScorePercentage
  totalPoints: number;
  xpReward: number;
  intendedOutcomes: IntendedOutcome[];
  tableOfSpecifications: TableOfSpecificationItem[];
  problems: (Problem & { intendedOutcomeId: string; outcomeCode: string })[];
}

export interface OutcomeMasteryResult {
  outcomeId: string;
  code: string;
  title: string;
  cognitiveDomain: string;
  score: number;
  total: number;
  percentage: number;
  status: 'Mastered' | 'Proficient' | 'Developing' | 'Needs Remediation';
  remediationRecommendation?: string;
}

export interface SummativeTranscript {
  id: string;
  userId: string;
  studentName: string;
  assessmentId: string;
  assessmentTitle: string;
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  depEdDescriptor: 'Outstanding (90-100%)' | 'Very Satisfactory (85-89%)' | 'Satisfactory (80-84%)' | 'Fairly Satisfactory (75-79%)' | 'Did Not Meet Expectations (<75%)';
  outcomeMastery: OutcomeMasteryResult[];
  timeSpentSeconds: number;
  completedAt: string;
  xpEarned: number;
}

export interface LessonProcedureStep {
  phase: 'Motivation / Priming' | 'Direct Instruction' | 'Guided Practice' | 'Independent Practice / Assessment' | 'Generalization & Homework' | 'Intentions' | 'Learning Experience' | 'Assessing Learning' | 'Ways Forward';
  durationMinutes: number;
  teacherActivity: string;
  studentActivity: string;
  assessmentStrategy?: string;
  ilawPillar?: 'I - Intentions' | 'L - Learning Experience' | 'A - Assessing Learning' | 'W - Ways Forward';
}

export interface ILAWFramework {
  intentions: {
    learningIntentions: string;
    successCriteria: string[];
    competencies: string[];
  };
  learningExperience: {
    primingActivity: string;
    coreInstruction: string;
    guidedExercises: string;
  };
  assessingLearning: {
    formativeAssessment: string;
    diagnosticQuizPlan: string;
    successThreshold: string;
    summativeAssessmentPlan?: string;
  };
  waysForward: {
    nextSteps: string;
    remediationAction: string;
    enrichmentChallenge: string;
  };
}

export interface DailyScheduleItem {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  date: string;
  lessonTitle: string;
  objective?: string;
}

export interface LessonPlan {
  id: string;
  topicId: string;
  title: string;
  gradeLevel: string;
  duration: string;
  subject: string;
  term?: string;
  week?: string;
  dates?: string;
  section?: string;
  doOrderRef?: string;
  weeklySchedule?: DailyScheduleItem[];
  references?: string[];
  framework?: 'ILAW' | 'DepEd-5Es' | 'Standard';
  ilaw?: ILAWFramework;
  prerequisites: string[];
  learningCompetencies: string[];
  objectives: {
    cognitive: string;
    psychomotor: string;
    affective: string;
  };
  materialsNeeded: string[];
  keyConcepts: {
    term: string;
    definition: string;
    formula?: string;
  }[];
  workedExamples: {
    title: string;
    problem: string;
    stepByStepSolution: string[];
  }[];
  procedures: LessonProcedureStep[];
  differentiation: {
    remediation: string;
    enrichment: string;
  };
  assessmentPlan: string;
  reflectionNotes?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  quizzes: Quiz[];
  lessonPlan?: LessonPlan;
  summativeAssessment?: SummativeAssessment;
}

export type PathwayStepType = 'concept' | 'lesson' | 'example' | 'practice_easy' | 'practice_moderate' | 'practice_difficult' | 'mastery';

export interface PathwayStep {
  id: string;
  type: PathwayStepType;
  title: string;
  isCompleted: boolean;
  description?: string;
  score?: number;
}

export interface LearningPathway {
  topicId: string;
  topicTitle: string;
  competencyId?: string;
  competencyName?: string;
  currentStepIndex: number;
  steps: PathwayStep[];
  weaknessReason?: string;
  masteryDemonstrated?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  lrn?: string; // Learner Reference Number
  password?: string;
  temporaryPassword?: string;
  grade?: string;
  section?: string;
  role: 'student' | 'faculty';
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  badges: string[];
  diagnosticCompleted?: boolean;
  diagnosticAbility?: string;
  diagnosticScores?: Record<string, number>;
  diagnosticViolations?: number;
  mathAbility?: string;
  competencyScores?: Record<string, number>;
  activePathway?: LearningPathway;
  errorFrequencies?: Record<string, number>;
  errorHistory?: ErrorPatternOccurrence[];
  resolvedErrors?: string[];
  oralRecitationPoints?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

export type StudyRequestStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface StudyRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  topicId: string;
  topicTitle: string;
  quizId?: string;
  quizTitle?: string;
  message?: string;
  status: StudyRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  participants: string[];
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  createdAt: string;
  read: boolean;
  studyRequestId?: string;
  studyRequestData?: {
    topicId: string;
    topicTitle: string;
    quizId?: string;
    quizTitle?: string;
    status: StudyRequestStatus;
  };
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  topicId: string;
  topicTitle: string;
  grade: string;
  section: string;
  createdAt: string;
}

export interface ChatConversation {
  conversationId: string;
  peerId: string;
  peerName: string;
  peerMathAbility?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export type DocumentFormat = 'DOCX' | 'PDF' | 'PPTX' | 'XLSX' | 'TXT' | 'IMAGE' | 'JSON';
export type DocumentStatus = 'Draft' | 'Published' | 'Archived' | 'Imported';

export interface ComparisonMappingRow {
  id: string;
  importedContent: string;
  ilawSection: 'Intentions' | 'Learning Experience' | 'Assessing Learning' | 'Ways Forward';
  aiAction: 'Imported' | 'AI Suggested';
  source: 'Original Content' | 'AI-Generated Content';
  details: string;
  status: 'Accepted' | 'Edited' | 'Rejected';
}

export interface DepEdValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  recommendation: string;
}

export interface DepEdValidationReport {
  passed: boolean;
  score: number;
  issues: DepEdValidationIssue[];
}

export interface MathAdaptPipeline {
  targetCompetency: string;
  prerequisiteSkills: string[];
  learningActivities: string[];
  assessmentQuestions: string[];
  masteryCriteria: string;
  adaptiveLoop: string;
}

export interface ExtractedDocumentMetadata {
  schoolName: string;
  teacherName: string;
  gradeLevel: string;
  section: string;
  subject: string;
  quarter: string;
  dateOrWeek: string;
  lessonTopic: string;
  learningCompetency: string;
  melcInformation: string;
  contentStandards: string;
  performanceStandards: string;
  learningObjectives: string[];
  learningActivities: string[];
  assessmentActivities: string[];
  performanceTasks: string;
  learningResources: string[];
  references: string[];
  assignmentEnrichment: string;
}

export interface ImportedDocument {
  id: string;
  fileName: string;
  format: DocumentFormat;
  status: DocumentStatus;
  uploadedAt: string;
  extractedMetadata: ExtractedDocumentMetadata;
  lessonPlan?: LessonPlan;
  topicTitle: string;
  comparisonRows?: ComparisonMappingRow[];
  validationReport?: DepEdValidationReport;
  pipeline?: MathAdaptPipeline;
}

export type SlideLayout = 
  | 'title' 
  | 'concept' 
  | 'formula_breakdown' 
  | 'worked_example' 
  | 'interactive_check' 
  | 'summary' 
  | 'key_takeaways';

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  layout?: SlideLayout;
  content: string[];
  keyFormula?: string;
  formulaExplanation?: string;
  exampleProblem?: {
    problemStatement: string;
    steps: string[];
    finalAnswer: string;
  };
  quickCheck?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  speakerNotes?: string;
  diagramDescription?: string;
  iconName?: string;
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  topicId: string;
  topicTitle: string;
  grade: string;
  section: string;
  authorFacultyId?: string;
  authorFacultyName?: string;
  originalFileName?: string;
  format?: 'PPTX' | 'PDF' | 'DOCX' | 'INTERACTIVE_DECK';
  slides: PresentationSlide[];
  totalSlides: number;
  connectedQuizId?: string;
  connectedQuizTitle?: string;
  suggestedAssessmentType?: 'quiz' | 'diagnostic' | 'both';
  createdAt: string;
  updatedAt?: string;
  viewsCount?: number;
  completionsCount?: number;
}

export interface PresentationViewRecord {
  id?: string;
  presentationId: string;
  presentationTitle: string;
  topicId: string;
  topicTitle: string;
  studentUid: string;
  studentName: string;
  grade?: string;
  section?: string;
  startedAt: string;
  completedAt?: string;
  slidesViewed: number;
  totalSlides: number;
  isCompleted: boolean;
  proceededToQuiz?: boolean;
  quizScore?: number;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  topic: string;
  competency: string;
  explanation: string;
  hint1?: string;
  hint2?: string;
  createdAt?: string;
}

export interface DiagnosticSettings {
  itemsCount: number;
}




