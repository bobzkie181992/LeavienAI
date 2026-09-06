import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Grid, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  Play, 
  BookOpen, 
  ArrowRight, 
  X, 
  Target, 
  Activity, 
  Triangle, 
  TrendingUp, 
  Layers, 
  Repeat, 
  Compass, 
  Waves, 
  Split, 
  Calculator, 
  ShieldCheck, 
  Crosshair, 
  LineChart, 
  Coins, 
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { Topic, UserProfile, QuizResult, Quiz, isValidatedOrActive } from '../types';
import { 
  CompetencyNode, 
  CompetencyMasteryStatus, 
  GraphFilter 
} from '../types/knowledgeMap';
import { 
  buildKnowledgeGraph, 
  getAncestorNodeIds, 
  getDescendantNodeIds, 
  createBezierPath 
} from '../utils/knowledgeMapUtils';

interface KnowledgeMapProps {
  topics: Topic[];
  profile: UserProfile;
  results: QuizResult[];
  onSelectTopic?: (topic: Topic) => void;
  onStartPathway?: () => void;
  onStartCompetencyPractice?: (quiz: Quiz) => void;
}

export default function KnowledgeMap({
  topics,
  profile,
  results,
  onSelectTopic,
  onStartPathway,
  onStartCompetencyPractice
}: KnowledgeMapProps) {
  // 1. Build Graph Model
  const graphData = useMemo(() => {
    return buildKnowledgeGraph(topics, results, profile);
  }, [topics, results, profile]);

  // 2. View & Filter States
  const [viewMode, setViewMode] = useState<'network' | 'matrix'>('network');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<GraphFilter>({
    tier: 'all',
    topicId: 'all',
    status: 'all',
    searchQuery: ''
  });

  // 3. Highlight Calculation
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const ancestorIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    return getAncestorNodeIds(activeNodeId, graphData.nodes);
  }, [activeNodeId, graphData.nodes]);

  const descendantIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    return getDescendantNodeIds(activeNodeId, graphData.edges);
  }, [activeNodeId, graphData.edges]);

  // 4. Selected Node Object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graphData.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  // 5. Filtered Nodes
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => {
      if (filter.tier !== 'all' && node.tier !== filter.tier) return false;
      if (filter.topicId !== 'all' && node.topicId !== filter.topicId) return false;
      if (filter.status !== 'all' && node.status !== filter.status) return false;
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        const matchName = node.name.toLowerCase().includes(q);
        const matchDesc = node.description.toLowerCase().includes(q);
        const matchTopic = node.topicTitle.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchTopic) return false;
      }
      return true;
    });
  }, [graphData.nodes, filter]);

  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  // 6. Handle Launching Practice Quiz for Selected Competency
  const handlePracticeCompetency = (node: CompetencyNode) => {
    // Find matching questions across topics and quizzes
    const allValidatedProblems = topics
      .flatMap(t => t.quizzes.flatMap(q => q.problems))
      .filter(isValidatedOrActive);

    const normName = node.name.toLowerCase().trim();
    let matchingProblems = allValidatedProblems.filter(p => 
      (p.competency || '').toLowerCase().trim() === normName ||
      p.topic === node.topicId ||
      p.topic === node.topicTitle
    );

    if (matchingProblems.length === 0) {
      matchingProblems = allValidatedProblems.filter(p => p.topic === node.topicId);
    }

    if (matchingProblems.length === 0) {
      alert("No active practice items available for this competency yet!");
      return;
    }

    // Pick up to 5 problems (shuffled)
    const shuffled = [...matchingProblems].sort(() => 0.5 - Math.random());
    const practiceSet = shuffled.slice(0, 5);

    const practiceQuiz: Quiz = {
      id: `practice-${node.id}-${Date.now()}`,
      title: `Practice: ${node.name}`,
      description: `Targeted practice for ${node.name} (${node.tierLabel}).`,
      topicId: node.topicId,
      problems: practiceSet,
      xpReward: 120
    };

    if (onStartCompetencyPractice) {
      onStartCompetencyPractice(practiceQuiz);
    } else if (onSelectTopic) {
      const topicObj = topics.find(t => t.id === node.topicId);
      if (topicObj) onSelectTopic(topicObj);
    }
  };

  // Helper for rendering node icons
  const getNodeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Triangle': return <Triangle className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Repeat': return <Repeat className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Waves': return <Waves className="w-5 h-5" />;
      case 'Split': return <Split className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5" />;
      case 'LineChart': return <LineChart className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  // Color theme helpers
  const isDark = themeMode === 'dark';

  const getStatusColor = (status: CompetencyMasteryStatus) => {
    switch (status) {
      case 'mastered':
        return {
          bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-50',
          border: 'border-emerald-500',
          ring: 'ring-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-white',
          stroke: '#10b981',
          fill: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)'
        };
      case 'in_progress':
        return {
          bg: isDark ? 'bg-amber-500/20' : 'bg-amber-50',
          border: 'border-amber-400',
          ring: 'ring-amber-400/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-white',
          stroke: '#f59e0b',
          fill: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)'
        };
      case 'needs_review':
        return {
          bg: isDark ? 'bg-rose-500/20' : 'bg-rose-50',
          border: 'border-rose-500',
          ring: 'ring-rose-500/30',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          stroke: '#f43f5e',
          fill: '#e11d48',
          glow: 'rgba(244, 63, 94, 0.4)'
        };
      case 'ready':
        return {
          bg: isDark ? 'bg-indigo-500/20' : 'bg-indigo-50',
          border: 'border-indigo-400',
          ring: 'ring-indigo-400/30',
          text: 'text-indigo-400',
          badge: 'bg-indigo-500 text-white',
          stroke: '#6366f1',
          fill: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.3)'
        };
      case 'locked':
      default:
        return {
          bg: isDark ? 'bg-slate-800/60' : 'bg-slate-100',
          border: isDark ? 'border-slate-700' : 'border-slate-300',
          ring: 'ring-slate-500/20',
          text: isDark ? 'text-slate-400' : 'text-slate-500',
          badge: 'bg-slate-500 text-white',
          stroke: isDark ? '#475569' : '#94a3b8',
          fill: isDark ? '#334155' : '#cbd5e1',
          glow: 'rgba(100, 116, 139, 0.1)'
        };
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        isFullscreen 
          ? 'fixed inset-0 z-50 rounded-none border-none p-4 md:p-8 overflow-y-auto' 
          : 'shadow-sm'
      } ${
        isDark 
          ? 'bg-slate-950 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* 1. Header Bar */}
      <div className="p-6 pb-4 border-b border-slate-200/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-indigo-900/60 text-indigo-400 ring-1 ring-indigo-500/40' : 'bg-indigo-50 text-indigo-600'}`}>
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                Knowledge Map
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  Grade 11 Competencies
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Visual prerequisite dependency network linking foundational algebra to advanced trigonometry & analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className={`p-1 rounded-xl flex items-center gap-1 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('network')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'network'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive Node Network"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Node Network</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Curriculum Matrix Roadmap"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matrix List</span>
            </button>
          </div>

          {/* Theme Mode */}
          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle Visual Theme"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Zoom controls (Only in Network mode) */}
          {viewMode === 'network' && (
            <div className={`flex items-center rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                className="p-2 hover:opacity-80 transition-opacity"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
                className="p-2 hover:opacity-80 transition-opacity"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 border-l border-slate-700/30 hover:opacity-80 transition-opacity"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fullscreen Expansion */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Knowledge Map"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Mastery Metric Summary Strip */}
      <div className={`px-6 py-3 border-b grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${
        isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastered (≥80%)</div>
            <div className="text-sm font-black text-emerald-500">{graphData.stats.mastered} Competencies</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress (50-79%)</div>
            <div className="text-sm font-black text-amber-400">{graphData.stats.inProgress} Competencies</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Needs Review (&lt;50%)</div>
            <div className="text-sm font-black text-rose-500">{graphData.stats.needsReview} Competencies</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ready to Learn</div>
            <div className="text-sm font-black text-indigo-400">{graphData.stats.ready} Competencies</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-500/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Locked (Prereqs)</div>
            <div className="text-sm font-black text-slate-400">{graphData.stats.locked} Competencies</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-violet-500/20" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Mastery</div>
            <div className="text-sm font-black text-violet-400">{graphData.stats.averageMastery}% Overall</div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {filter.searchQuery && (
              <button 
                onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Filter */}
          <select
            value={filter.tier}
            onChange={(e) => setFilter(prev => ({ ...prev, tier: e.target.value === 'all' ? 'all' : Number(e.target.value) as any }))}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Tiers (Foundations → Advanced)</option>
            <option value="1">Tier 1: Foundations & Prerequisites</option>
            <option value="2">Tier 2: Core Competencies</option>
            <option value="3">Tier 3: Advanced Topics</option>
          </select>

          {/* Topic / Domain Filter */}
          <select
            value={filter.topicId}
            onChange={(e) => setFilter(prev => ({ ...prev, topicId: e.target.value }))}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Math Strands</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          {/* Mastery Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
            className={`px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">All Mastery States</option>
            <option value="mastered">Mastered (≥80%)</option>
            <option value="in_progress">In Progress (50-79%)</option>
            <option value="needs_review">Needs Review (&lt;50%)</option>
            <option value="ready">Ready to Learn (Unlocked)</option>
            <option value="locked">Locked (Prerequisites Pending)</option>
          </select>
        </div>

        {/* Active Node Highlighter Hint */}
        {activeNodeId && (
          <div className="flex items-center gap-2 text-xs font-semibold animate-pulse text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Highlighting prerequisite chain for active competency</span>
          </div>
        )}
      </div>

      {/* 4. Main Display Area: Network Graph or Matrix List */}
      <div className="relative min-h-[560px] overflow-hidden">
        {viewMode === 'network' ? (
          <div className="relative overflow-x-auto overflow-y-hidden select-none">
            {/* Column Background Tier Labels */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 z-0">
              <div className={`border-r p-4 flex flex-col justify-between ${isDark ? 'border-slate-800/60 bg-indigo-950/5' : 'border-slate-100 bg-slate-50/40'}`}>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tier 1 • Foundations</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Prerequisite building blocks</p>
                </div>
                <div className="text-[10px] text-slate-500/40 font-mono font-bold uppercase">Beginner / Baseline</div>
              </div>
              <div className={`border-r p-4 flex flex-col justify-between ${isDark ? 'border-slate-800/60 bg-blue-950/5' : 'border-slate-100 bg-white'}`}>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tier 2 • Core Competencies</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Analytical relationships & graphs</p>
                </div>
                <div className="text-[10px] text-slate-500/40 font-mono font-bold uppercase">Intermediate Core</div>
              </div>
              <div className={`p-4 flex flex-col justify-between ${isDark ? 'bg-violet-950/5' : 'bg-slate-50/40'}`}>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tier 3 • Advanced Synthesis</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Applied modeling & verification</p>
                </div>
                <div className="text-[10px] text-slate-500/40 font-mono font-bold uppercase">Advanced Mastery</div>
              </div>
            </div>

            {/* SVG Canvas for Interactive Network Graph */}
            <div 
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              className="transition-transform duration-200 ease-out"
            >
              <svg 
                viewBox="0 0 1000 680" 
                className="w-[1000px] h-[680px] relative z-10 block"
              >
                <defs>
                  {/* Grid dot pattern */}
                  <pattern id="mathGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.2" fill={isDark ? "#334155" : "#e2e8f0"} />
                  </pattern>

                  {/* Gradient for satisfied edges */}
                  <linearGradient id="edgeGradSatisfied" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>

                  {/* Gradient for in-progress edges */}
                  <linearGradient id="edgeGradProgress" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>

                  {/* Arrow markers */}
                  <marker id="arrowSatisfied" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                    <polygon points="0 0, 8 3.5, 0 7" fill="#10b981" />
                  </marker>
                  <marker id="arrowHighlight" markerWidth="9" markerHeight="9" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#6366f1" />
                  </marker>
                  <marker id="arrowDefault" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                    <polygon points="0 0, 8 3.5, 0 7" fill={isDark ? "#475569" : "#94a3b8"} />
                  </marker>
                  <marker id="arrowLocked" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                    <polygon points="0 0, 8 3.5, 0 7" fill={isDark ? "#334155" : "#cbd5e1"} />
                  </marker>

                  {/* Glow filter for active elements */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background dot grid */}
                <rect width="1000" height="680" fill="url(#mathGrid)" />

                {/* 1. Render Edges (Prerequisite Dependency Lines) */}
                <g className="edges-layer">
                  {graphData.edges.map(edge => {
                    const source = graphData.nodes.find(n => n.id === edge.sourceId);
                    const target = graphData.nodes.find(n => n.id === edge.targetId);
                    if (!source || !target) return null;

                    // Prerequisite link: connects right-edge of source to left-edge of target
                    const x1 = source.canvasX + 28;
                    const y1 = source.canvasY;
                    const x2 = target.canvasX - 28;
                    const y2 = target.canvasY;
                    const pathD = createBezierPath(x1, y1, x2, y2);

                    const isSourceAncestor = activeNodeId ? ancestorIds.has(source.id) : false;
                    const isTargetDescendant = activeNodeId ? descendantIds.has(target.id) : false;
                    const isDirectlyConnected = activeNodeId === source.id || activeNodeId === target.id;
                    const isHighlighted = isDirectlyConnected || (isSourceAncestor && (activeNodeId === target.id || ancestorIds.has(target.id)));

                    const strokeColor = isHighlighted 
                      ? '#818cf8' 
                      : edge.isSatisfied 
                        ? (isDark ? '#10b981' : '#059669') 
                        : (isDark ? '#475569' : '#94a3b8');

                    const marker = isHighlighted
                      ? 'url(#arrowHighlight)'
                      : edge.isSatisfied 
                        ? 'url(#arrowSatisfied)' 
                        : 'url(#arrowDefault)';

                    const opacity = activeNodeId 
                      ? (isHighlighted ? 1 : 0.15) 
                      : (edge.isSatisfied ? 0.8 : 0.4);

                    return (
                      <g key={edge.id} className="transition-opacity duration-300">
                        {/* Shadow/Glow on active links */}
                        {isHighlighted && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth={6}
                            strokeOpacity={0.3}
                            filter="url(#glow)"
                          />
                        )}
                        {/* Main Dependency Stroke */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={isHighlighted ? 3 : edge.isSatisfied ? 2.2 : 1.5}
                          strokeDasharray={edge.isSatisfied ? 'none' : '4 4'}
                          strokeOpacity={opacity}
                          markerEnd={marker}
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}
                </g>

                {/* 2. Render Nodes */}
                <g className="nodes-layer">
                  {graphData.nodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isAncestor = ancestorIds.has(node.id);
                    const isDescendant = descendantIds.has(node.id);
                    const isFiltered = filteredNodeIds.has(node.id);
                    const colors = getStatusColor(node.status);

                    // Dim non-filtered or non-connected nodes when an active node exists
                    let opacity = 1;
                    if (!isFiltered) {
                      opacity = 0.2;
                    } else if (activeNodeId && !isSelected && !isHovered && !isAncestor && !isDescendant) {
                      opacity = 0.35;
                    }

                    // Progress circle calculations (radius = 26)
                    const radius = 26;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (node.masteryPercentage / 100) * circumference;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.canvasX}, ${node.canvasY})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer group"
                        style={{ opacity, transition: 'opacity 0.25s ease' }}
                      >
                        {/* Glow halo when selected or hovered */}
                        {(isSelected || isHovered) && (
                          <circle
                            r="36"
                            fill="none"
                            stroke={colors.stroke}
                            strokeWidth="4"
                            strokeOpacity="0.4"
                            filter="url(#glow)"
                          />
                        )}

                        {/* Ancestor / Descendant Pulse Ring */}
                        {(isAncestor || isDescendant) && (
                          <circle
                            r="32"
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            strokeOpacity="0.8"
                          />
                        )}

                        {/* Background Base Circle */}
                        <circle
                          r="26"
                          fill={isDark ? '#0f172a' : '#ffffff'}
                          stroke={isDark ? '#334155' : '#e2e8f0'}
                          strokeWidth="2"
                        />

                        {/* Progress Meter Ring */}
                        <circle
                          r={radius}
                          fill="none"
                          stroke={colors.stroke}
                          strokeWidth="3.5"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          transform="rotate(-90)"
                          className="transition-all duration-500 ease-out"
                        />

                        {/* Inner Node Center Icon */}
                        <foreignObject x="-14" y="-14" width="28" height="28" className="pointer-events-none">
                          <div className={`w-full h-full flex items-center justify-center ${colors.text}`}>
                            {getNodeIcon(node.iconName)}
                          </div>
                        </foreignObject>

                        {/* Status Icon Badge (Top-Right) */}
                        <g transform="translate(16, -18)">
                          <circle r="9" fill={colors.stroke} />
                          <foreignObject x="-7" y="-7" width="14" height="14" className="pointer-events-none">
                            <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-black">
                              {node.status === 'mastered' ? (
                                <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                              ) : node.status === 'locked' ? (
                                <Lock className="w-2.5 h-2.5 stroke-[3]" />
                              ) : node.status === 'needs_review' ? (
                                <AlertCircle className="w-3 h-3 stroke-[3]" />
                              ) : node.status === 'ready' ? (
                                <Sparkles className="w-2.5 h-2.5 stroke-[3]" />
                              ) : (
                                <span className="text-[8px]">{node.masteryPercentage}%</span>
                              )}
                            </div>
                          </foreignObject>
                        </g>

                        {/* Mastery Percentage Pill (Bottom) */}
                        <g transform="translate(0, 36)">
                          <rect
                            x="-22"
                            y="-9"
                            width="44"
                            height="18"
                            rx="9"
                            fill={isDark ? '#1e293b' : '#f1f5f9'}
                            stroke={colors.stroke}
                            strokeWidth="1.2"
                          />
                          <text
                            textAnchor="middle"
                            y="4"
                            fill={isDark ? '#f8fafc' : '#0f172a'}
                            fontSize="10"
                            fontWeight="800"
                            className="font-mono pointer-events-none"
                          >
                            {node.masteryPercentage}%
                          </text>
                        </g>

                        {/* Node Label Card below */}
                        <g transform="translate(0, 52)" className="pointer-events-none">
                          <text
                            textAnchor="middle"
                            y="8"
                            fill={isDark ? '#e2e8f0' : '#1e293b'}
                            fontSize="11"
                            fontWeight="700"
                            className="transition-colors group-hover:fill-indigo-400 select-none"
                          >
                            {node.name.length > 28 ? `${node.name.substring(0, 26)}...` : node.name}
                          </text>
                          <text
                            textAnchor="middle"
                            y="22"
                            fill={isDark ? '#94a3b8' : '#64748b'}
                            fontSize="9.5"
                            fontWeight="600"
                            className="select-none"
                          >
                            {node.topicTitle} • {node.tierLabel}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        ) : (
          /* Matrix / Roadmap List Mode */
          <div className="p-6 space-y-6">
            {[1, 2, 3].map(tierNumber => {
              const tierNodes = filteredNodes.filter(n => n.tier === tierNumber);
              const tierLabel = tierNumber === 1 
                ? 'Tier 1: Foundations & Prerequisites' 
                : tierNumber === 2 
                  ? 'Tier 2: Core Competencies' 
                  : 'Tier 3: Advanced Topics & Synthesis';

              if (tierNodes.length === 0) return null;

              return (
                <div key={tierNumber} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      tierNumber === 1 ? 'bg-indigo-500' : tierNumber === 2 ? 'bg-blue-500' : 'bg-violet-500'
                    }`} />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                      {tierLabel} ({tierNodes.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tierNodes.map(node => {
                      const colors = getStatusColor(node.status);
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                            isDark 
                              ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500 hover:bg-slate-900' 
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                                {getNodeIcon(node.iconName)}
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                                {node.status === 'mastered' ? 'Mastered' :
                                 node.status === 'in_progress' ? 'In Progress' :
                                 node.status === 'needs_review' ? 'Needs Review' :
                                 node.status === 'ready' ? 'Ready' : 'Locked'}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                              {node.name}
                            </h4>
                            <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                              {node.description}
                            </p>
                          </div>

                          <div>
                            {/* Mastery Bar */}
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Mastery Level</span>
                                <span className={colors.text}>{node.masteryPercentage}%</span>
                              </div>
                              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    node.status === 'mastered' ? 'bg-emerald-500' :
                                    node.status === 'in_progress' ? 'bg-amber-400' :
                                    node.status === 'needs_review' ? 'bg-rose-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${node.masteryPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Prerequisite Tags */}
                            <div className="pt-2 border-t border-slate-700/30 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">
                                {node.prerequisiteIds.length === 0 ? 'No prerequisites' : `${node.prerequisiteIds.length} prerequisite(s)`}
                              </span>
                              <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                Details <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Interactive Legend Footer */}
        <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
          isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Mastered (≥80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>In Progress (50–79%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Needs Review (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Ready to Learn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              <span>Locked (Prereqs Pending)</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-emerald-500 font-bold">───▶</span>
              <span>Satisfied Prerequisite Link</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-bold">- - ▶</span>
              <span>Pending Prerequisite Link</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Click any node to view detailed diagnostics and launch targeted practice.
          </div>
        </div>
      </div>

      {/* 6. Competency Dossier Modal / Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border relative overflow-hidden ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-slate-100' 
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedNodeId(null)}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Info */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  getStatusColor(selectedNode.status).bg
                } ${getStatusColor(selectedNode.status).text}`}>
                  {getNodeIcon(selectedNode.iconName)}
                </div>
                <div className="pr-8">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      getStatusColor(selectedNode.status).badge
                    }`}>
                      {selectedNode.status === 'mastered' ? 'Mastered' :
                       selectedNode.status === 'in_progress' ? 'In Progress' :
                       selectedNode.status === 'needs_review' ? 'Needs Review' :
                       selectedNode.status === 'ready' ? 'Ready to Learn' : 'Locked'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedNode.tierLabel}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold">
                      {selectedNode.topicTitle}
                    </span>
                  </div>
                  <h3 className="text-xl font-black leading-tight">
                    {selectedNode.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {selectedNode.description}
              </p>

              {/* Stats Grid */}
              <div className={`p-4 rounded-2xl grid grid-cols-3 gap-3 mb-6 ${
                isDark ? 'bg-slate-950/80 border border-slate-800' : 'bg-slate-50 border border-slate-100'
              }`}>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mastery</div>
                  <div className="text-xl font-black text-indigo-400">{selectedNode.masteryPercentage}%</div>
                  <div className="text-[10px] text-slate-400">{selectedNode.correctCount} / {selectedNode.attemptsCount} correct</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Difficulty (IRT b)</div>
                  <div className="text-xl font-black">{selectedNode.difficultyParameter > 0 ? `+${selectedNode.difficultyParameter}` : selectedNode.difficultyParameter}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{selectedNode.difficulty} level</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Item Bank</div>
                  <div className="text-xl font-black text-emerald-500">{selectedNode.availableProblemsCount}</div>
                  <div className="text-[10px] text-slate-400">Validated items</div>
                </div>
              </div>

              {/* Prerequisite Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Prerequisite Competencies</span>
                  <span>{selectedNode.prerequisitesMet ? '✓ Prerequisites Met' : '⚠ Action Needed'}</span>
                </div>

                {selectedNode.prerequisiteIds.length === 0 ? (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    isDark ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-50 text-slate-600'
                  }`}>
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>This is a foundational competency with no prior prerequisites required.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedNode.prerequisiteIds.map(prereqId => {
                      const prereqNode = graphData.nodes.find(n => n.id === prereqId);
                      if (!prereqNode) return null;
                      const isSatisfied = prereqNode.masteryPercentage >= 70;

                      return (
                        <div 
                          key={prereqId}
                          onClick={() => setSelectedNodeId(prereqId)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                            isSatisfied 
                              ? isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-950/40' : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              : isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300 hover:bg-amber-950/40' : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isSatisfied ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            <div>
                              <div className="font-bold">{prereqNode.name}</div>
                              <div className="text-[10px] opacity-80">{prereqNode.topicTitle}</div>
                            </div>
                          </div>
                          <div className="font-mono font-bold shrink-0">
                            {prereqNode.masteryPercentage}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unlocks Forward Section */}
              {selectedNode.unlockedCompetencyNames.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Directly Unlocks Advanced Topics:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.unlockedCompetencyNames.map((name, i) => (
                      <span 
                        key={i} 
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                          isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-700/30 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handlePracticeCompetency(selectedNode)}
                  className="w-full sm:flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Practice This Competency
                </button>

                {onSelectTopic && (
                  <button
                    onClick={() => {
                      const topicObj = topics.find(t => t.id === selectedNode.topicId);
                      if (topicObj) {
                        onSelectTopic(topicObj);
                        setSelectedNodeId(null);
                      }
                    }}
                    className={`w-full sm:w-auto py-3.5 px-5 font-bold rounded-2xl border transition-all text-sm flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'border-slate-700 hover:bg-slate-800 text-slate-200' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Open Topic Hub
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
