import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  LogOut, 
  Zap, 
  FileText,
  Menu,
  ShieldCheck,
  UserCheck,
  Bell,
  Sparkles,
  Trophy,
  ClipboardList,
  Edit3,
  BookOpen,
  ArrowRight,
  Target
} from 'lucide-react';
import { UserProfile } from '../types';
import { topics } from '../data/curriculum';
import { useAllStudents, useTeacherReports } from '../hooks/useFirebase';

import TeacherSidebar, { TeacherNavSection } from '../components/TeacherSidebar';
import TopNavHeader from '../components/TopNavHeader';
import TeacherCurriculumView from '../components/teacher-views/TeacherCurriculumView';
import TeacherLessonManagerView from '../components/teacher-views/TeacherLessonManagerView';
import TeacherActivitiesView from '../components/teacher-views/TeacherActivitiesView';
import TeacherAssessmentsView from '../components/teacher-views/TeacherAssessmentsView';
import TeacherClassesView from '../components/teacher-views/TeacherClassesView';
import TeacherAnalyticsView from '../components/teacher-views/TeacherAnalyticsView';
import TeacherResourcesView from '../components/teacher-views/TeacherResourcesView';
import TeacherNotificationsView from '../components/teacher-views/TeacherNotificationsView';
import TeacherSettingsView from '../components/teacher-views/TeacherSettingsView';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ModernTeacherDashboard from '../components/ModernTeacherDashboard';

interface FacultyModuleProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function FacultyModule({ profile, onLogout }: FacultyModuleProps) {
  const [currentSection, setCurrentSection] = useState<TeacherNavSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reportPreselectedStudent, setReportPreselectedStudent] = useState<UserProfile | null>(null);

  const { students, loading: studentsLoading } = useAllStudents();
  const { reports, loading: reportsLoading, saveReport, deleteReport } = useTeacherReports();

  const handleOpenAddReportForStudent = (student?: UserProfile) => {
    setReportPreselectedStudent(student || null);
    setCurrentSection('analytics-reports');
  };

  const getSectionTitle = (sec: TeacherNavSection) => {
    switch (sec) {
      case 'dashboard': return { title: 'Faculty Dashboard', subtitle: 'Academic Command & Monitoring Overview' };
      // Curriculum & Lessons
      case 'curriculum-overview': return { title: 'Curriculum & Lessons • Overview', subtitle: 'Master course outline and quarterly pacing across Grade 11 General Mathematics' };
      case 'curriculum-ilaw': 
      case 'lessons-my': return { title: 'Curriculum & Lessons • DepEd ILAW Lessons & DLP', subtitle: 'DepEd Order No. 016, s. 2024 four-pillar lesson plans and printable DLPs' };
      case 'lessons-create': return { title: 'Curriculum & Lessons • Create Lesson', subtitle: 'Author new DepEd ILAW lesson plan with Intentions, Experience, Assessing & Ways Forward' };
      case 'lessons-import': return { title: 'Curriculum & Lessons • Import from DOCX', subtitle: 'Extract and import DepEd ILAW Daily Lesson Plans directly from Microsoft Word documents' };
      case 'lessons-drafts': return { title: 'Curriculum & Lessons • Draft Lessons', subtitle: 'Work-in-progress lesson plans' };
      case 'lessons-published': return { title: 'Curriculum & Lessons • Published Lessons', subtitle: 'Active lessons available to students' };
      case 'curriculum-competencies': return { title: 'Curriculum & Lessons • Learning Competencies', subtitle: 'Most Essential Learning Competencies (MELCs) directory' };
      case 'curriculum-map': return { title: 'Curriculum & Lessons • Course Map & Pacing', subtitle: 'Sequential progression and 18-week term distribution' };
      case 'curriculum-hierarchy': return { title: 'Curriculum & Lessons • Structure Tree', subtitle: 'Grade 11 curriculum hierarchy by strand, term, and unit' };
      case 'lessons-templates': return { title: 'Curriculum & Lessons • Lesson Templates', subtitle: 'Standard DepEd DLP, DLL, and 4-A templates' };
      // Activities
      case 'activities-create': return { title: 'Activities • Create Activity', subtitle: 'Assign performance tasks, case studies, or worksheets' };
      case 'activities-active': return { title: 'Activities • Active Activities', subtitle: 'Class activities and submission deadlines' };
      case 'activities-submissions': return { title: 'Activities • Submissions & Grading', subtitle: 'Evaluate student work and assign rubric grades' };
      // Assessments
      case 'assessments-diagnostic': return { title: 'Assessments • Diagnostic Assessments', subtitle: 'Pre-learning baseline checks to measure prior student knowledge' };
      case 'assessments-formative': return { title: 'Assessments • Formative Assessments', subtitle: 'In-lesson continuous learning and immediate feedback checks' };
      case 'assessments-bank': return { title: 'Assessments • Question Bank', subtitle: 'Author, search, filter, and calibrate assessment items' };
      case 'assessments-create': return { title: 'Assessments • Create Assessment', subtitle: 'Author new Diagnostic or Formative assessments' };
      case 'assessments-diagnostic-results': return { title: 'Assessments • Diagnostic Results', subtitle: 'Pre-learning baseline analytics and student diagnostic scoreboards' };
      case 'assessments-formative-results': return { title: 'Assessments • Formative Results', subtitle: 'In-lesson continuous quiz results and formative performance scoreboards' };
      case 'assessments-quizzes': return { title: 'Assessments • Quizzes', subtitle: 'Formative unit assessment modules' };
      case 'assessments-exams': return { title: 'Assessments • Summative Exams', subtitle: 'Table of Specifications (TOS) examination blueprints' };
      // My Classes
      case 'classes-sections': return { title: 'My Classes • Sections & Strands', subtitle: 'STEM, ABM, HUMSS, TVL section distribution' };
      case 'classes-students': return { title: 'My Classes • Student Directory', subtitle: 'Manage student records, LRNs, and login PINs' };
      // Analytics
      case 'analytics-class': return { title: 'Analytics • Class Performance', subtitle: 'Leaderboard, achievements, and oral recitation awards' };
      case 'analytics-progress': return { title: 'Analytics • Student Progress', subtitle: 'Detailed student learning trajectories' };
      case 'analytics-competency': return { title: 'Analytics • Competency Tracking', subtitle: 'MELCs heatmaps and mastery benchmark coverage' };
      case 'analytics-reports': return { title: 'Analytics • Assessment Reports', subtitle: 'Personalized narrative progress reports' };
      // Resources
      case 'resources-teaching': return { title: 'Resources • Teaching Materials', subtitle: 'Interactive slide presentations and curated video lectures' };
      case 'resources-worksheets': return { title: 'Resources • Worksheets', subtitle: 'Practice sets and downloadable assessment materials' };
      case 'resources-shared': return { title: 'Resources • Shared Resources', subtitle: 'Mathematics department shared cloud drive and syllabus' };
      // General
      case 'notifications': return { title: 'Notifications & Alerts', subtitle: 'Real-time student task activity and intervention notices' };
      case 'settings': return { title: 'Faculty Settings', subtitle: 'DepEd D.O. 8 grading weights & academic preferences' };
      default: return { title: 'Faculty Management Portal', subtitle: 'Leavien AI Grade 11' };
    }
  };

  const activeMeta = getSectionTitle(currentSection);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* 1. TEACHER SIDEBAR */}
      <TeacherSidebar
        currentSection={currentSection}
        onNavigate={(sec) => {
          setCurrentSection(sec);
          setIsMobileSidebarOpen(false);
        }}
        profile={profile}
        studentsCount={students.length}
        pendingSubmissionsCount={2}
        unreadNotificationsCount={2}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopNavHeader
          role="faculty"
          profile={profile}
          currentSectionTitle={activeMeta.title}
          breadcrumbPath={[
            { label: 'Faculty Console', action: () => setCurrentSection('dashboard') },
            { label: activeMeta.title }
          ]}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateNotifications={() => setCurrentSection('notifications')}
          onNavigateSettings={() => setCurrentSection('settings')}
          onLogout={() => setShowLogoutConfirm(true)}
          topics={topics}
        />

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {currentSection === 'dashboard' ? (
              <motion.div
                key="sec-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <ModernTeacherDashboard
                  profile={profile}
                  students={students}
                  topics={topics}
                  onNavigateSection={(sec) => setCurrentSection(sec as TeacherNavSection)}
                  onOpenClass={(classId) => setCurrentSection('classes-students')}
                  onOpenLesson={(lessonId) => setCurrentSection('lessons-my')}
                />
              </motion.div>
            ) : (currentSection.startsWith('curriculum') || currentSection.startsWith('lessons')) ? (
              <motion.div
                key={`curriculum-lessons-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherCurriculumView
                  topics={topics}
                  initialSubTab={
                    currentSection === 'curriculum-ilaw' || currentSection === 'lessons-my' ? 'ilaw' :
                    currentSection === 'lessons-create' ? 'create' :
                    currentSection === 'lessons-import' ? 'import' :
                    currentSection === 'lessons-drafts' ? 'drafts' :
                    currentSection === 'lessons-published' ? 'published' :
                    currentSection === 'curriculum-competencies' ? 'competencies' :
                    currentSection === 'curriculum-map' ? 'map' :
                    currentSection === 'curriculum-hierarchy' ? 'hierarchy' :
                    currentSection === 'lessons-templates' ? 'templates' :
                    'overview'
                  }
                  onSelectTopicForEdit={(topic) => {
                    setCurrentSection('lessons-create');
                  }}
                />
              </motion.div>
            ) : currentSection.startsWith('activities') ? (
              <motion.div
                key={`activities-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherActivitiesView
                  topics={topics}
                  students={students}
                  initialSubTab={
                    currentSection === 'activities-create' ? 'create' :
                    currentSection === 'activities-submissions' ? 'submissions' :
                    'active'
                  }
                />
              </motion.div>
            ) : currentSection.startsWith('assessments') ? (
              <motion.div
                key={`assessments-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherAssessmentsView
                  topics={topics}
                  initialSubTab={
                    currentSection === 'assessments-diagnostic' ? 'diagnostic' :
                    currentSection === 'assessments-formative' ? 'formative' :
                    currentSection === 'assessments-create' ? 'diagnostic' :
                    currentSection === 'assessments-bank' ? 'bank' :
                    currentSection === 'assessments-diagnostic-results' ? 'diagnostic-results' :
                    currentSection === 'assessments-formative-results' ? 'formative-results' :
                    currentSection === 'assessments-exams' ? 'exams' :
                    'quizzes'
                  }
                />
              </motion.div>
            ) : currentSection.startsWith('classes') ? (
              <motion.div
                key={`classes-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherClassesView
                  students={students}
                  profile={profile}
                  initialSubTab={
                    currentSection === 'classes-sections' ? 'sections' :
                    'students'
                  }
                  onAddReportForStudent={handleOpenAddReportForStudent}
                />
              </motion.div>
            ) : currentSection.startsWith('analytics') ? (
              <motion.div
                key={`analytics-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherAnalyticsView
                  students={students}
                  topics={topics}
                  profile={profile}
                  reports={reports}
                  reportsLoading={reportsLoading}
                  saveReport={saveReport}
                  deleteReport={deleteReport}
                  studentsLoading={studentsLoading}
                  initialSubTab={
                    currentSection === 'analytics-progress' ? 'progress' :
                    currentSection === 'analytics-competency' ? 'competency' :
                    currentSection === 'analytics-reports' ? 'reports' :
                    'class'
                  }
                  preselectedStudentForReport={reportPreselectedStudent}
                  onClearPreselectedStudent={() => setReportPreselectedStudent(null)}
                />
              </motion.div>
            ) : currentSection.startsWith('resources') ? (
              <motion.div
                key={`resources-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherResourcesView
                  topics={topics}
                  profile={profile}
                  initialSubTab={
                    currentSection === 'resources-worksheets' ? 'worksheets' :
                    currentSection === 'resources-shared' ? 'shared' :
                    'materials'
                  }
                />
              </motion.div>
            ) : currentSection === 'notifications' ? (
              <motion.div
                key="sec-notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherNotificationsView
                  onNavigateToSection={(sec) => setCurrentSection(sec)}
                />
              </motion.div>
            ) : currentSection === 'settings' ? (
              <motion.div
                key="sec-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <TeacherSettingsView profile={profile} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Faculty Hub"
        message="Are you sure you want to log out of the Leavien AI Faculty Management Portal?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
