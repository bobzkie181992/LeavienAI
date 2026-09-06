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
  hints?: string[];
  explanation: string;
  remediation: string;
  status?: ItemStatus;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topicId: string;
  problems: Problem[];
  xpReward: number;
}

export interface ItemResponse {
  problemId: string;
  competency: string;
  selectedOption: number;
  isCorrect: boolean;
  difficultyParameter: number;
  discriminationParameter: number;
  responseTimeMs: number;
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
}

export type PathwayStepType = 'concept' | 'lesson' | 'example' | 'practice_easy' | 'practice_moderate' | 'practice_difficult' | 'mastery';

export interface PathwayStep {
  id: string;
  type: PathwayStepType;
  title: string;
  isCompleted: boolean;
}

export interface LearningPathway {
  topicId: string;
  topicTitle: string;
  currentStepIndex: number;
  steps: PathwayStep[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  lrn?: string; // Learner Reference Number
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
  mathAbility?: string;
  competencyScores?: Record<string, number>;
  activePathway?: LearningPathway;
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


