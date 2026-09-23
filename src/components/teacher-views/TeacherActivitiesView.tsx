import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardList, 
  PlusCircle, 
  FileCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Award, 
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Topic, UserProfile } from '../../types';

interface ActivityItem {
  id: string;
  title: string;
  type: 'Performance Task' | 'Worksheet' | 'Math Sprint Drill' | 'Real-World Case Study';
  topic: string;
  term: string;
  dueDate: string;
  assignedTo: string;
  submissionsCount: number;
  totalStudents: number;
  status: 'Active' | 'Closed';
}

interface StudentSubmission {
  id: string;
  activityId: string;
  activityTitle: string;
  studentName: string;
  section: string;
  submittedAt: string;
  score?: number;
  maxScore: number;
  status: 'Graded' | 'Pending Review';
  feedback?: string;
}

interface TeacherActivitiesViewProps {
  topics: Topic[];
  students: UserProfile[];
  initialSubTab?: 'create' | 'active' | 'submissions';
}

export default function TeacherActivitiesView({
  topics,
  students,
  initialSubTab = 'active'
}: TeacherActivitiesViewProps) {
  const [subTab, setSubTab] = useState<'create' | 'active' | 'submissions'>(initialSubTab);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      title: '3D Box Packaging Optimization Performance Task',
      type: 'Performance Task',
      topic: 'Functions & Graphs',
      term: 'Term 1',
      dueDate: 'Oct 15, 2026',
      assignedTo: 'Grade 11 - All Sections',
      submissionsCount: 18,
      totalStudents: students.length || 25,
      status: 'Active'
    },
    {
      id: 'act-2',
      title: 'Bank Loan Comparison & Annuity Amortization Table',
      type: 'Real-World Case Study',
      topic: 'Business Mathematics',
      term: 'Term 2',
      dueDate: 'Oct 28, 2026',
      assignedTo: 'STEM-A & ABM-A',
      submissionsCount: 12,
      totalStudents: 15,
      status: 'Active'
    },
    {
      id: 'act-3',
      title: 'Rational Equation Extraneous Root Problem Sheet',
      type: 'Worksheet',
      topic: 'Rational Functions',
      term: 'Term 1',
      dueDate: 'Past Due',
      assignedTo: 'Grade 11 - All Sections',
      submissionsCount: 24,
      totalStudents: 25,
      status: 'Closed'
    }
  ]);

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: 'sub-1',
      activityId: 'act-1',
      activityTitle: '3D Box Packaging Optimization Performance Task',
      studentName: students[0]?.displayName || 'Juan Dela Cruz',
      section: students[0]?.section || 'STEM-A',
      submittedAt: 'Today, 10:14 AM',
      score: 95,
      maxScore: 100,
      status: 'Graded',
      feedback: 'Excellent surface area minimization proof and realistic cardboard dimensioning!'
    },
    {
      id: 'sub-2',
      activityId: 'act-1',
      activityTitle: '3D Box Packaging Optimization Performance Task',
      studentName: students[1]?.displayName || 'Maria Santos',
      section: students[1]?.section || 'STEM-A',
      submittedAt: 'Today, 8:40 AM',
      maxScore: 100,
      status: 'Pending Review'
    },
    {
      id: 'sub-3',
      activityId: 'act-2',
      activityTitle: 'Bank Loan Comparison & Annuity Amortization Table',
      studentName: students[2]?.displayName || 'Gabriel Reyes',
      section: students[2]?.section || 'ABM-A',
      submittedAt: 'Yesterday, 4:20 PM',
      maxScore: 50,
      status: 'Pending Review'
    }
  ]);

  // Create Activity Form State
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState<'Performance Task' | 'Worksheet' | 'Real-World Case Study'>('Performance Task');
  const [topic, setTopic] = useState(topics[0]?.title || 'General Mathematics');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState(50);
  const [instructions, setInstructions] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  // Reviewing a submission
  const [gradingSubmission, setGradingSubmission] = useState<StudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState('');

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      type: activityType,
      topic,
      term: 'Term 1',
      dueDate: dueDate || 'Next Week',
      assignedTo: 'Grade 11 - All Sections',
      submissionsCount: 0,
      totalStudents: students.length || 25,
      status: 'Active'
    };

    setActivities([newAct, ...activities]);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setSubTab('active');
    }, 1200);

    setTitle('');
    setInstructions('');
  };

  const handleSaveGrade = () => {
    if (!gradingSubmission) return;

    setSubmissions(prev => prev.map(s => {
      if (s.id === gradingSubmission.id) {
        return {
          ...s,
          score: gradeInput,
          feedback: feedbackInput.trim() || 'Good mathematical execution.',
          status: 'Graded'
        };
      }
      return s;
    }));

    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <ClipboardList className="w-3 h-3" />
              <span>Performance Tasks & Activities</span>
            </span>
            <span className="bg-white/10 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              50% Grading Weight (DepEd D.O. 8)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Activities, Tasks & Submissions</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Create performance tasks and problem sets, monitor active classroom submissions, and provide qualitative feedback with score rubrics.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'active'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-amber-400" />
          <span>Active Activities ({activities.filter(a => a.status === 'Active').length})</span>
        </button>

        <button
          onClick={() => setSubTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'create'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Activity</span>
        </button>

        <button
          onClick={() => setSubTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'submissions'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Student Submissions</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black">
            {submissions.filter(s => s.status === 'Pending Review').length} Pending
          </span>
        </button>
      </div>

      {/* 1. ACTIVE ACTIVITIES */}
      {subTab === 'active' && (
        <div className="space-y-4">
          <div className="grid gap-3">
            {activities.map((act) => {
              const percent = Math.round((act.submissionsCount / act.totalStudents) * 100);

              return (
                <div
                  key={act.id}
                  className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {act.type}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {act.topic}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Due: {act.dueDate}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base">{act.title}</h4>
                    <p className="text-xs text-slate-500">Assigned to: {act.assignedTo}</p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Turned In</span>
                        <span className="text-slate-900">{act.submissionsCount}/{act.totalStudents} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <button
                      onClick={() => setSubTab('submissions')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      View Submissions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CREATE ACTIVITY */}
      {subTab === 'create' && (
        <form onSubmit={handleCreateActivity} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">Author Activity or Performance Task</h3>
            <p className="text-xs text-slate-500">Configure task requirements, rubrics, and submission deadline</p>
          </div>

          {createSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Activity created and broadcasted to students!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rational Function Modeling in Epidemiology"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Task Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Performance Task">Performance Task (50% DepEd Weight)</option>
                <option value="Worksheet">Practice Worksheet / Problem Set</option>
                <option value="Real-World Case Study">Real-World Case Study Project</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.title}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Maximum Raw Score
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={10}
                max={100}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Task Instructions & Evaluation Rubric
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Specify submission criteria, formulas required, and formatting guidelines..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Assign to Students</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. STUDENT SUBMISSIONS */}
      {subTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Student Submissions Roster ({submissions.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{sub.studentName}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                      {sub.section}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      sub.status === 'Graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{sub.activityTitle}</p>
                  <p className="text-[10px] text-slate-400">Submitted: {sub.submittedAt}</p>
                  {sub.feedback && (
                    <p className="text-xs text-indigo-700 italic bg-indigo-50/60 p-2 rounded-xl mt-1">
                      "{sub.feedback}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {sub.score !== undefined ? (
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{sub.score}/{sub.maxScore}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        {Math.round((sub.score / sub.maxScore) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Ungraded
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setGradingSubmission(sub);
                      setGradeInput(sub.score || 85);
                      setFeedbackInput(sub.feedback || '');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {sub.status === 'Graded' ? 'Edit Grade' : 'Score & Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scoring Modal */}
          {gradingSubmission && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Grading Submission</span>
                  <h3 className="font-black text-slate-900 text-base">{gradingSubmission.studentName}</h3>
                  <p className="text-xs text-slate-500">{gradingSubmission.activityTitle}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Score (out of {gradingSubmission.maxScore})
                  </label>
                  <input
                    type="number"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(Number(e.target.value))}
                    max={gradingSubmission.maxScore}
                    min={0}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Teacher Qualitative Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Commend mathematical reasoning or highlight points for improvement..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setGradingSubmission(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGrade}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Save & Submit Grade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
