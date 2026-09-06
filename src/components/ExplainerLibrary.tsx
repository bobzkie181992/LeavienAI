import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Play, BookOpen, Sparkles, X, CheckCircle2, Clock, ExternalLink, ShieldAlert, GraduationCap } from 'lucide-react';
import { Topic, QuizResult, UserProfile, isValidatedOrActive, VideoLecture } from '../types';
import { buildKnowledgeGraph } from '../utils/knowledgeMapUtils';
import { useVideoLectures } from '../hooks/useFirebase';

interface ExplainerLibraryProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  isOpen?: boolean;
  onClose?: () => void;
  onStartPractice?: (quiz: any) => void;
}

interface ExplainerVideo {
  id: string;
  title: string;
  topicTitle: string;
  duration: string;
  youtubeId: string; // e.g. Khan Academy / Math educator video ID or embed
  thumbnailUrl: string;
  description: string;
  keyTakeaways: string[];
  isWeakAreaMatch: boolean;
}

export default function ExplainerLibrary({
  topics,
  results,
  profile,
  isOpen = true,
  onClose,
  onStartPractice
}: ExplainerLibraryProps) {
  const { lectures: facultyLectures, loading: lecturesLoading } = useVideoLectures();
  const [activeSubTab, setActiveSubTab] = useState<'faculty' | 'micro'>('faculty');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [playingVideo, setPlayingVideo] = useState<ExplainerVideo | VideoLecture | null>(null);

  // Build knowledge graph to find weak competencies
  const graphData = buildKnowledgeGraph(topics, results, profile);
  const weakNodes = graphData.nodes.filter(n => n.attemptsCount > 0 && n.masteryPercentage < 70);
  const weakCompetencyNames = new Set(weakNodes.map(n => n.name.toLowerCase()));

  // Curated 2-3 minute micro-learning explainer videos for Grade 11 Mathematics
  const explainerVideos: ExplainerVideo[] = [
    {
      id: 'v1',
      title: 'Limits & Continuity Visualized in 3 Minutes',
      topicTitle: 'Limits & Continuity',
      duration: '2:45',
      youtubeId: 'kfokwixpHbs', // educational sample reference
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      description: 'Understand the concept of approaching a point without necessarily reaching it, illustrated with interactive function graphs.',
      keyTakeaways: ['Definition of left and right-hand limits', 'Removable vs Jump discontinuities', 'Direct substitution rule'],
      isWeakAreaMatch: weakCompetencyNames.has('limits') || weakCompetencyNames.has('continuity')
    },
    {
      id: 'v2',
      title: 'The Derivative Power Rule Explained Visually',
      topicTitle: 'Differential Calculus',
      duration: '3:10',
      youtubeId: 'ANyVdBEDpjI',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      description: 'Master the power rule for polynomial differentiation in under 3 minutes with instant geometric intuition.',
      keyTakeaways: ['Bringing exponent to the front', 'Subtracting 1 from the power', 'Derivative of constants is zero'],
      isWeakAreaMatch: weakCompetencyNames.has('derivative') || weakCompetencyNames.has('calculus')
    },
    {
      id: 'v3',
      title: 'Trigonometric Identities: Sin²θ + Cos²θ = 1',
      topicTitle: 'Trigonometric Identities',
      duration: '2:30',
      youtubeId: 'V9UqVwKwfhw',
      thumbnailUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=600&q=80',
      description: 'Quick unit-circle derivation of Pythagorean trigonometric identities for Grade 11 advanced problem solving.',
      keyTakeaways: ['Unit circle radius = 1', 'Pythagorean theorem application', 'Simplifying complex trig expressions'],
      isWeakAreaMatch: weakCompetencyNames.has('trigonometry') || weakCompetencyNames.has('identities')
    },
    {
      id: 'v4',
      title: 'Arithmetic & Geometric Sequences Quick Review',
      topicTitle: 'Sequences & Series',
      duration: '2:50',
      youtubeId: '4G93gyWkJxE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&w=600&q=80',
      description: 'Distinguish between arithmetic common differences and geometric common ratios in seconds.',
      keyTakeaways: ['nth term formula for arithmetic', 'Sum formula for geometric series', 'Real-world growth models'],
      isWeakAreaMatch: weakCompetencyNames.has('sequences') || weakCompetencyNames.has('series')
    },
    {
      id: 'v5',
      title: 'Quadratic Functions & Vertex Form Masterclass',
      topicTitle: 'Functions & Graphs',
      duration: '3:05',
      youtubeId: '9gTpxk7jQzU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      description: 'Instantly find the vertex (h, k) and axis of symmetry of parabolas without tedious factoring.',
      keyTakeaways: ['Vertex form a(x-h)^2 + k', 'Determining max/min values', 'Graph shifting rules'],
      isWeakAreaMatch: weakCompetencyNames.has('quadratic') || weakCompetencyNames.has('functions')
    },
    {
      id: 'v6',
      title: 'Standard Deviation & Variance in Statistics',
      topicTitle: 'Statistics & Probability',
      duration: '2:40',
      youtubeId: 'SzWKGeGDric',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      description: 'Understand how spread out data is around the mean using standard deviation formulas.',
      keyTakeaways: ['Calculating mean', 'Squared deviations from mean', 'Interpreting spread'],
      isWeakAreaMatch: weakCompetencyNames.has('statistics') || weakCompetencyNames.has('probability')
    }
  ];

  const categories = ['All', 'Weak Area Matches', 'Calculus', 'Trigonometry', 'Algebra', 'Statistics'];

  const filteredFacultyLectures = facultyLectures.filter(v => {
    if (selectedCategory === 'Weak Area Matches') return false;
    if (selectedCategory === 'All') return true;
    return v.topicTitle.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const filteredVideos = explainerVideos.filter(v => {
    if (selectedCategory === 'Weak Area Matches') return v.isWeakAreaMatch;
    if (selectedCategory === 'All') return true;
    return v.topicTitle.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const content = (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Video Lecture Center
              </span>
              <span className="text-xs text-indigo-200">Official Curriculum Material</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Grade 11 Mathematical Lecture Library</h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Access official video lectures published by your faculty or study-recommender micro-learning tutorials.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0">
            <div className="text-2xl font-black text-amber-300">
              {activeSubTab === 'faculty' ? facultyLectures.length : weakNodes.length}
            </div>
            <div className="text-[11px] text-indigo-200 font-medium">
              {activeSubTab === 'faculty' ? 'Faculty Lectures Uploaded' : 'Targeted Weak Areas'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-200/80">
        <button
          onClick={() => { setActiveSubTab('faculty'); setSelectedCategory('All'); }}
          className={`px-5 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'faculty'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Faculty Lectures</span>
          {facultyLectures.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {facultyLectures.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveSubTab('micro'); setSelectedCategory('All'); }}
          className={`px-5 py-3.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'micro'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Micro-Learning Explainers</span>
        </button>
      </div>

      {/* Category Filter Pills (Exclude 'Weak Area Matches' from Faculty subtab) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories
          .filter(cat => activeSubTab !== 'faculty' || cat !== 'Weak Area Matches')
          .map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'Weak Area Matches' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>{cat}</span>
            </button>
          ))}
      </div>

      {/* Video Cards Grid */}
      {activeSubTab === 'faculty' ? (
        lecturesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-slate-50 border border-slate-200 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredFacultyLectures.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 border border-slate-150 rounded-3xl max-w-lg mx-auto">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-800 text-base">No Faculty Lectures</h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              No faculty lectures match this topic filter yet. Your course instructors will add video lessons here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacultyLectures.map(lec => (
              <motion.div
                key={lec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${lec.youtubeId}/hqdefault.jpg`}
                      alt={lec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        {lec.grade} • {lec.section}
                      </span>
                    </div>

                    <button
                      onClick={() => setPlayingVideo(lec)}
                      className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 pl-0.5">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{lec.topicTitle}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {lec.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {lec.description || "No description provided for this faculty video lecture."}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => setPlayingVideo(lec)}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Watch Faculty Lecture</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{video.duration}</span>
                    </span>
                    {video.isWeakAreaMatch && (
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Weak Area Focus</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setPlayingVideo(video)}
                    className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 pl-0.5">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{video.topicTitle}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Key Takeaways:</span>
                    <ul className="space-y-1">
                      {video.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setPlayingVideo(video)}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Watch Micro-Lesson ({video.duration})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{playingVideo.topicTitle}</span>
                <h3 className="text-base font-black">{playingVideo.title}</h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black relative flex items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                title={playingVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-6 space-y-4 bg-slate-50">
              <p className="text-xs text-slate-700 leading-relaxed">{playingVideo.description}</p>
              
              {'keyTakeaways' in playingVideo && playingVideo.keyTakeaways && playingVideo.keyTakeaways.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Takeaways for Mastery:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {playingVideo.keyTakeaways.map((item, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close Video
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-lg font-black">Explainer Library & Micro-Lessons</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {content}
          </div>
        </motion.div>
      </div>
    );
  }

  return content;
}
