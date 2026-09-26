import mammoth from 'mammoth';
import { LessonPlan, DailyScheduleItem } from '../types';

export interface ParsedDocxLesson {
  fileName: string;
  fileSize: number;
  rawText: string;
  rawHtml?: string;
  confidence: number;
  lesson: Partial<LessonPlan> & { title: string };
  detectedSections: {
    title: boolean;
    competencies: boolean;
    intentions: boolean;
    learningExperience: boolean;
    assessingLearning: boolean;
    waysForward: boolean;
    weeklySchedule: boolean;
  };
}

/**
 * Parses raw text extracted from a .docx file into structured DepEd ILAW Lesson Plan
 */
export function parseIlawText(rawText: string, fileName: string): ParsedDocxLesson {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const fullLower = rawText.toLowerCase();

  // Helper to extract text between section headers
  const extractSection = (keywords: string[], stopKeywords: string[]): string => {
    let capturing = false;
    const captured: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const isStart = keywords.some(k => lowerLine.includes(k.toLowerCase()));
      const isStop = stopKeywords.some(s => lowerLine.includes(s.toLowerCase()));

      if (isStart) {
        capturing = true;
        // Strip out the keyword prefix if on the same line
        let clean = line;
        for (const k of keywords) {
          const regex = new RegExp(`^.*?${k}[:\\-\\s]*`, 'i');
          clean = clean.replace(regex, '');
        }
        if (clean.trim()) captured.push(clean.trim());
        continue;
      }

      if (capturing) {
        if (isStop && !keywords.some(k => lowerLine.includes(k.toLowerCase()))) {
          break;
        }
        captured.push(line);
      }
    }

    return captured.join('\n').trim();
  };

  // 1. Title detection
  let title = '';
  const titleLine = lines.find(l => /^topic|^lesson|^title|^subject/i.test(l));
  if (titleLine) {
    title = titleLine.replace(/^(topic|lesson|title|subject)\s*[:\-\.]\s*/i, '').trim();
  }
  if (!title && lines.length > 0) {
    // Find first non-generic heading
    const candidate = lines.find(l => 
      !/department of education|republic of the philippines|daily lesson log|daily lesson plan|senior high school|grade 11/i.test(l) &&
      l.length > 4 && l.length < 90
    );
    title = candidate || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }
  if (!title) {
    title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  // 2. Term / Quarter & Week detection
  let term = 'Term 1';
  let week = 'Week 1';

  if (/quarter 1|term 1|q1/i.test(fullLower)) term = 'Term 1';
  else if (/quarter 2|term 2|q2/i.test(fullLower)) term = 'Term 2';
  else if (/quarter 3|term 3|q3/i.test(fullLower)) term = 'Term 3';
  else if (/quarter 4|term 4|q4/i.test(fullLower)) term = 'Term 4';

  const weekMatch = rawText.match(/week\s*([0-9]{1,2})/i);
  if (weekMatch && weekMatch[1]) {
    week = `Week ${weekMatch[1]}`;
  }

  // 3. Competencies detection
  const competencyRegex = /M11[A-Z]{2,4}-[I|V|X]+[a-z]?-[0-9]+/g;
  const foundCodes = rawText.match(competencyRegex) || [];
  
  const competencySection = extractSection(
    ['learning competency', 'competencies', 'melcs', 'code:'],
    ['learning intentions', 'objectives', 'procedures', 'content', 'materials']
  );

  const learningCompetencies: string[] = [];
  if (competencySection) {
    const compLines = competencySection.split('\n').filter(l => l.length > 5);
    learningCompetencies.push(...compLines);
  } else if (foundCodes.length > 0) {
    learningCompetencies.push(...foundCodes.map(c => `MELCs: ${c}`));
  } else {
    learningCompetencies.push(`M11GM-Ia-1: Represents and solves real-life mathematical situations for ${title}.`);
  }

  // 4. Pillar 1: Intentions (I)
  const intentionsRaw = extractSection(
    ['i. intentions', 'intentions', 'learning intentions', 'i. objectives', 'objectives', 'content standards'],
    ['ii. learning experience', 'learning experience', 'procedures', 'materials', 'assessing learning', 'assessment']
  );

  // 5. Pillar 2: Learning Experience (L)
  const experienceRaw = extractSection(
    ['ii. learning experience', 'learning experience', 'procedures', 'activities', "4a's", 'direct instruction', 'priming'],
    ['iii. assessing learning', 'assessing learning', 'assessment', 'evaluating learning', 'ways forward']
  );

  // 6. Pillar 3: Assessing Learning (A)
  const assessingRaw = extractSection(
    ['iii. assessing learning', 'assessing learning', 'assessment', 'evaluating learning', 'formative', 'evaluation'],
    ['iv. ways forward', 'ways forward', 'remediation', 'enrichment', 'assignment', 'reflection', 'remarks']
  );

  // 7. Pillar 4: Ways Forward (W)
  const waysForwardRaw = extractSection(
    ['iv. ways forward', 'ways forward', 'remediation', 'enrichment', 'application', 'careers', 'reflection', 'assignment'],
    ['v. remarks', 'prepared by', 'checked by', 'submitted by']
  );

  // 8. Weekly schedule detection (Monday - Friday)
  const weeklySchedule: DailyScheduleItem[] = [
    { day: 'MONDAY', date: 'Day 1', lessonTitle: `Introduction & Priming: ${title}`, activityType: 'Whole Class', objective: 'Establish purpose and explore core concepts.' },
    { day: 'TUESDAY', date: 'Day 2', lessonTitle: 'Core Concept & Derivations', activityType: 'Direct Instruction', objective: 'Master theoretical definitions and formulas.' },
    { day: 'WEDNESDAY', date: 'Day 3', lessonTitle: 'Guided Collaborative Practice', activityType: 'Pair Work', objective: 'Solve multi-step guided exercises.' },
    { day: 'THURSDAY', date: 'Day 4', lessonTitle: 'Contextual Word Problems', activityType: 'Group Work', objective: 'Apply mathematical modeling to real scenarios.' },
    { day: 'FRIDAY', date: 'Day 5', lessonTitle: 'Formative Assessment & Review', activityType: 'Individual Assessment', objective: 'Evaluate 80% mastery benchmark.' }
  ];

  // Calculate detection confidence score
  let detectedCount = 0;
  if (title && title !== fileName) detectedCount += 20;
  if (learningCompetencies.length > 0) detectedCount += 20;
  if (intentionsRaw) detectedCount += 20;
  if (experienceRaw) detectedCount += 20;
  if (assessingRaw) detectedCount += 10;
  if (waysForwardRaw) detectedCount += 10;

  const timestampId = `ilaw-docx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const completeLesson: Partial<LessonPlan> & { title: string } = {
    id: timestampId,
    topicId: `topic-${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`,
    title,
    term,
    week,
    subject: 'General Mathematics',
    gradeLevel: 'Grade 11 - General Mathematics',
    section: 'Grade 11 – Gauss (STEM-A)',
    duration: '60 minutes',
    doOrderRef: 'DepEd MATATAG / D.O. No. 016, s. 2024 (Imported from DOCX)',
    framework: 'ILAW',
    status: 'Published',
    updatedAt: `Imported on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    learningCompetencies,
    objectives: {
      cognitive: intentionsRaw || 'Understand core definitions and mathematical models.',
      psychomotor: 'Perform step-by-step procedural calculations accurately.',
      affective: 'Demonstrate persistence, accuracy, and critical reasoning in problem solving.'
    },
    ilaw: {
      intentions: {
        learningIntentions: intentionsRaw || 'Master fundamental principles, problem-solving, and applications.',
        successCriteria: [
          'Differentiate between key conditions and mathematical representations.',
          'Execute procedural equations with high accuracy.',
          'Solve contextual situational problems systematically.'
        ],
        competencies: learningCompetencies,
        priorKnowledge: 'Prerequisite foundational mathematics and algebraic equations.'
      },
      learningExperience: {
        primingActivity: experienceRaw || 'Real-world priming scenario engaging student inquiry and intuition.',
        coreInstruction: 'Teacher-led conceptual modeling, theorem discussions, and step-by-step worked examples.',
        guidedExercises: 'Collaborative pair exercises and board demonstration with immediate teacher feedback.',
        keyFormulas: [
          { name: 'Core Equation', formula: 'f(x) = y', explanation: 'Mathematical transformation relating inputs to outputs.' }
        ]
      },
      assessingLearning: {
        formativeAssessment: assessingRaw || '5-question immediate feedback quiz with step-by-step remediation hints.',
        diagnosticQuizPlan: '5-item adaptive baseline diagnostic check.',
        successThreshold: '80% mastery benchmark.',
        summativeAssessmentPlan: '10-item unit summative exam aligned with Table of Specifications (TOS).'
      },
      waysForward: {
        nextSteps: waysForwardRaw || 'Student reflection entry in learning journal on real-world connections.',
        remediationAction: 'Targeted 7-step review pathway and scaffolded substitution templates.',
        enrichmentChallenge: 'Higher-order modeling challenge and Olympiad-style math sprint.',
        realWorldCareers: ['Data Analytics', 'Software Engineering', 'Financial Mathematics', 'Actuarial Science']
      }
    },
    weeklySchedule
  };

  return {
    fileName,
    fileSize: rawText.length,
    rawText,
    confidence: Math.min(100, detectedCount),
    lesson: completeLesson,
    detectedSections: {
      title: Boolean(title),
      competencies: learningCompetencies.length > 0,
      intentions: Boolean(intentionsRaw),
      learningExperience: Boolean(experienceRaw),
      assessingLearning: Boolean(assessingRaw),
      waysForward: Boolean(waysForwardRaw),
      weeklySchedule: true
    }
  };
}

/**
 * Reads a .docx file from an ArrayBuffer and converts it to a structured ILAW Lesson Plan
 */
export async function parseDocxFile(file: File): Promise<ParsedDocxLesson> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract text and html using mammoth
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ arrayBuffer }),
    mammoth.convertToHtml({ arrayBuffer })
  ]);

  const rawText = textResult.value || '';
  const rawHtml = htmlResult.value || '';

  const parsed = parseIlawText(rawText, file.name);
  parsed.rawHtml = rawHtml;
  parsed.fileSize = file.size;

  return parsed;
}
