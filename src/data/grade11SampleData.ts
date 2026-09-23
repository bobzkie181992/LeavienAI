/**
 * Grade 11 Senior High School Sample Data Model
 * Aligned with Department of Education (DepEd) K-to-12 SHS Curriculum
 * Structured for easy API / Firestore backend synchronization.
 */

export interface Grade11Subject {
  id: string;
  code: string;
  title: string;
  strand: 'Core' | 'Applied' | 'Specialized';
  description: string;
  instructor: string;
  unitCount: number;
  completedUnits: number;
  masteryPercent: number;
  iconName: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'teal' | 'sky' | 'purple';
}

export interface Grade11Section {
  id: string;
  name: string;
  trackStrand: 'STEM' | 'ABM' | 'HUMSS' | 'TVL-ICT' | 'GAS';
  adviser: string;
  studentCount: number;
  averageMastery: number;
  roomNumber: string;
  scheduleTime: string;
}

export interface Grade11Student {
  uid: string;
  lrn: string; // 12-digit Learner Reference Number
  displayName: string;
  email: string;
  gradeLevel: 'Grade 11' | 'Grade 12';
  section: string;
  trackStrand: string;
  xp: number;
  level: number;
  streak: number;
  attendanceRate: number;
  overallGpa: number;
  atRiskStatus?: 'low' | 'moderate' | 'high';
  needAttentionReason?: string;
  subjectScores: Record<string, number>; // subjectId -> percentage
}

// 1. DepEd Grade 11 Core & Applied Subjects
export const GRADE_11_SUBJECTS: Grade11Subject[] = [
  {
    id: 'genmath',
    code: 'GENMATH-11',
    title: 'General Mathematics',
    strand: 'Core',
    description: 'Functions, business mathematics, logic, and real-world mathematical modeling.',
    instructor: 'Prof. Maria Santos, LPT',
    unitCount: 12,
    completedUnits: 8,
    masteryPercent: 86,
    iconName: 'Sigma',
    color: 'indigo'
  },
  {
    id: 'oralcom',
    code: 'ORALCOM-11',
    title: 'Oral Communication in Context',
    strand: 'Core',
    description: 'Functions, nature, and process of communication across diverse contexts.',
    instructor: 'Mr. Juan Dela Cruz, MAEd',
    unitCount: 10,
    completedUnits: 7,
    masteryPercent: 82,
    iconName: 'MessageSquare',
    color: 'teal'
  },
  {
    id: 'earthsci',
    code: 'EARTHSCI-11',
    title: 'Earth and Life Science',
    strand: 'Core',
    description: 'Earth history, geologic processes, bioenergetics, and ecosystem dynamics.',
    instructor: 'Dr. Roberto Mendoza',
    unitCount: 10,
    completedUnits: 6,
    masteryPercent: 78,
    iconName: 'Compass',
    color: 'emerald'
  },
  {
    id: 'physsci',
    code: 'PHYSSCI-11',
    title: 'Physical Science',
    strand: 'Core',
    description: 'Evolution of elements, chemical bonding, laws of motion, optics, and relativity.',
    instructor: 'Prof. Elena Reyes, MSc',
    unitCount: 12,
    completedUnits: 5,
    masteryPercent: 75,
    iconName: 'Zap',
    color: 'amber'
  },
  {
    id: 'filipino11',
    code: 'FILIPINO-11',
    title: 'Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino',
    strand: 'Core',
    description: 'Pag-aaral tungo sa pananaliksik sa wika at kulturang Pilipino sa lipunang Pilipino.',
    instructor: 'G. Aris Bautista, LPT',
    unitCount: 8,
    completedUnits: 6,
    masteryPercent: 88,
    iconName: 'BookOpen',
    color: 'rose'
  },
  {
    id: 'english11',
    code: 'ENGLISH-11',
    title: '21st Century Literature & Reading and Writing',
    strand: 'Core',
    description: 'Critical reading, academic writing, and contemporary global literature analysis.',
    instructor: 'Ms. Clarissa Ramos',
    unitCount: 10,
    completedUnits: 7,
    masteryPercent: 84,
    iconName: 'FileText',
    color: 'purple'
  },
  {
    id: 'research1',
    code: 'RESEARCH-1',
    title: 'Practical Research 1 (Qualitative)',
    strand: 'Applied',
    description: 'Qualitative research methodologies, data collection, coding, and thematic analysis.',
    instructor: 'Dr. Fernando Aquino',
    unitCount: 8,
    completedUnits: 4,
    masteryPercent: 80,
    iconName: 'Layers',
    color: 'sky'
  },
  {
    id: 'empowertech',
    code: 'EMPOWER-11',
    title: 'Empowerment Technologies (ICT for Professional Tracks)',
    strand: 'Applied',
    description: 'Information technologies, web design, collaborative ICT tools, and online safety.',
    instructor: 'Engr. Liza Gonzales',
    unitCount: 10,
    completedUnits: 8,
    masteryPercent: 91,
    iconName: 'Cpu',
    color: 'indigo'
  }
];

// 2. Sample Grade 11 Class Sections
export const GRADE_11_SECTIONS: Grade11Section[] = [
  {
    id: 'stem-a',
    name: 'Grade 11 - STEM A (Gauss)',
    trackStrand: 'STEM',
    adviser: 'Prof. Maria Santos',
    studentCount: 42,
    averageMastery: 87,
    roomNumber: 'Building B - Room 301',
    scheduleTime: '6:00 AM – 12:00 PM'
  },
  {
    id: 'stem-b',
    name: 'Grade 11 - STEM B (Euler)',
    trackStrand: 'STEM',
    adviser: 'Dr. Roberto Mendoza',
    studentCount: 40,
    averageMastery: 83,
    roomNumber: 'Building B - Room 302',
    scheduleTime: '6:00 AM – 12:00 PM'
  },
  {
    id: 'abm-a',
    name: 'Grade 11 - ABM A (Pacat)',
    trackStrand: 'ABM',
    adviser: 'Prof. Elena Reyes',
    studentCount: 38,
    averageMastery: 81,
    roomNumber: 'Building C - Room 201',
    scheduleTime: '12:30 PM – 6:30 PM'
  },
  {
    id: 'humss-a',
    name: 'Grade 11 - HUMSS A (Rizal)',
    trackStrand: 'HUMSS',
    adviser: 'G. Aris Bautista',
    studentCount: 44,
    averageMastery: 84,
    roomNumber: 'Building C - Room 202',
    scheduleTime: '12:30 PM – 6:30 PM'
  },
  {
    id: 'tvl-ict-a',
    name: 'Grade 11 - TVL ICT A (Turing)',
    trackStrand: 'TVL-ICT',
    adviser: 'Engr. Liza Gonzales',
    studentCount: 36,
    averageMastery: 89,
    roomNumber: 'ICT Lab 1',
    scheduleTime: '6:00 AM – 12:00 PM'
  }
];

// 3. Sample Grade 11 Student Roster
export const GRADE_11_STUDENTS: Grade11Student[] = [
  {
    uid: 'student-101',
    lrn: '109283748291',
    displayName: 'Juan Dela Cruz',
    email: 'juan.delacruz@deped.gov.ph',
    gradeLevel: 'Grade 11',
    section: 'STEM-A',
    trackStrand: 'STEM',
    xp: 2450,
    level: 7,
    streak: 12,
    attendanceRate: 98,
    overallGpa: 89.5,
    subjectScores: {
      genmath: 88,
      oralcom: 90,
      earthsci: 86,
      physsci: 85,
      filipino11: 92,
      english11: 89,
      research1: 87,
      empowertech: 94
    }
  },
  {
    uid: 'student-102',
    lrn: '109283748292',
    displayName: 'Maria Clara Reyes',
    email: 'maria.reyes@deped.gov.ph',
    gradeLevel: 'Grade 11',
    section: 'STEM-A',
    trackStrand: 'STEM',
    xp: 3800,
    level: 10,
    streak: 21,
    attendanceRate: 100,
    overallGpa: 94.2,
    subjectScores: {
      genmath: 95,
      oralcom: 92,
      earthsci: 94,
      physsci: 93,
      filipino11: 96,
      english11: 95,
      research1: 91,
      empowertech: 97
    }
  },
  {
    uid: 'student-103',
    lrn: '109283748293',
    displayName: 'Crisostomo Ibarra',
    email: 'cris.ibarra@deped.gov.ph',
    gradeLevel: 'Grade 11',
    section: 'STEM-B',
    trackStrand: 'STEM',
    xp: 1250,
    level: 4,
    streak: 3,
    attendanceRate: 88,
    overallGpa: 76.8,
    atRiskStatus: 'moderate',
    needAttentionReason: 'Trouble with piecewise functions & composite evaluations in GenMath',
    subjectScores: {
      genmath: 68,
      oralcom: 82,
      earthsci: 75,
      physsci: 72,
      filipino11: 85,
      english11: 80,
      research1: 78,
      empowertech: 84
    }
  },
  {
    uid: 'student-104',
    lrn: '109283748294',
    displayName: 'Elias Salcedo',
    email: 'elias.salcedo@deped.gov.ph',
    gradeLevel: 'Grade 11',
    section: 'HUMSS-A',
    trackStrand: 'HUMSS',
    xp: 850,
    level: 3,
    streak: 1,
    attendanceRate: 82,
    overallGpa: 72.4,
    atRiskStatus: 'high',
    needAttentionReason: 'Overdue Formative Checkpoint 2 and low diagnostic score (54%)',
    subjectScores: {
      genmath: 58,
      oralcom: 88,
      earthsci: 70,
      physsci: 65,
      filipino11: 90,
      english11: 86,
      research1: 82,
      empowertech: 79
    }
  },
  {
    uid: 'student-105',
    lrn: '109283748295',
    displayName: 'Sisa Ilustre',
    email: 'sisa.ilustre@deped.gov.ph',
    gradeLevel: 'Grade 11',
    section: 'ABM-A',
    trackStrand: 'ABM',
    xp: 2900,
    level: 8,
    streak: 14,
    attendanceRate: 96,
    overallGpa: 88.0,
    subjectScores: {
      genmath: 84,
      oralcom: 89,
      earthsci: 83,
      physsci: 82,
      filipino11: 91,
      english11: 90,
      research1: 86,
      empowertech: 92
    }
  }
];

/**
 * Backend Data Provider abstraction layer
 * Allows seamless switching between mock local state and Firebase Firestore REST API
 */
export const Grade11DataService = {
  getSubjects: (): Promise<Grade11Subject[]> => Promise.resolve(GRADE_11_SUBJECTS),
  getSections: (): Promise<Grade11Section[]> => Promise.resolve(GRADE_11_SECTIONS),
  getStudents: (sectionId?: string): Promise<Grade11Student[]> => {
    if (!sectionId || sectionId === 'all') {
      return Promise.resolve(GRADE_11_STUDENTS);
    }
    return Promise.resolve(
      GRADE_11_STUDENTS.filter((s) => s.section.toLowerCase() === sectionId.toLowerCase())
    );
  },
  getAtRiskStudents: (): Promise<Grade11Student[]> => {
    return Promise.resolve(GRADE_11_STUDENTS.filter((s) => s.atRiskStatus));
  }
};
