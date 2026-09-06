import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Search, Calculator, Sparkles, ChevronRight, Bookmark } from 'lucide-react';

interface MathFormulaHubProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSolverWithPrompt?: (prompt: string) => void;
}

interface FormulaItem {
  id: string;
  category: 'Calculus' | 'Trigonometry' | 'Algebra & Sequences' | 'Functions & Statistics';
  title: string;
  formula: string;
  description: string;
  example: string;
}

const FORMULAS_DATA: FormulaItem[] = [
  {
    id: 'f1',
    category: 'Calculus',
    title: 'Power Rule for Derivatives',
    formula: 'd/dx [x^n] = n * x^(n-1)',
    description: 'Fundamental differentiation formula for polynomial terms in Grade 11 calculus.',
    example: 'd/dx [4x^3] = 4 * (3x^2) = 12x^2'
  },
  {
    id: 'f2',
    category: 'Calculus',
    title: 'Limit Definition of Derivative',
    formula: "f'(x) = lim (h -> 0) [f(x + h) - f(x)] / h",
    description: 'The instantaneous rate of change and foundation of differential calculus.',
    example: 'Used to derive slope of tangent lines at any point x.'
  },
  {
    id: 'f3',
    category: 'Trigonometry',
    title: 'Pythagorean Trigonometric Identity',
    formula: 'sin^2(θ) + cos^2(θ) = 1',
    description: 'Fundamental trigonometric identity derived from the unit circle.',
    example: 'If sin(θ) = 3/5, then cos^2(θ) = 1 - 9/25 = 16/25 => cos(θ) = 4/5'
  },
  {
    id: 'f4',
    category: 'Trigonometry',
    title: 'Law of Sines & Law of Cosines',
    formula: 'a / sin(A) = b / sin(B) = c / sin(C)\nc^2 = a^2 + b^2 - 2ab*cos(C)',
    description: 'Solving non-right angled triangles in trigonometry and vector applications.',
    example: 'Used to find missing side lengths or angles in oblique triangles.'
  },
  {
    id: 'f5',
    category: 'Algebra & Sequences',
    title: 'Quadratic Formula',
    formula: 'x = [-b ± sqrt(b^2 - 4ac)] / (2a)',
    description: 'Finding real and complex roots for any quadratic equation ax^2 + bx + c = 0.',
    example: 'For 2x^2 - 4x - 6 = 0: a=2, b=-4, c=-6 => x = 3 or x = -1'
  },
  {
    id: 'f6',
    category: 'Algebra & Sequences',
    title: 'Arithmetic & Geometric Series Sums',
    formula: 'Sn = n/2 * [2a1 + (n-1)d]\nSn = a1 * (1 - r^n) / (1 - r)',
    description: 'Calculating the sum of finite arithmetic progressions and geometric series.',
    example: 'Sum of first 10 integers: 10/2 * [2(1) + 9(1)] = 5 * 11 = 55'
  },
  {
    id: 'f7',
    category: 'Functions & Statistics',
    title: 'Vertex Form of Quadratic Function',
    formula: 'f(x) = a(x - h)^2 + k',
    description: 'Easily identifies parabola vertex (h, k) and axis of symmetry x = h.',
    example: 'f(x) = 2(x - 3)^2 + 4 has vertex at (3, 4).'
  },
  {
    id: 'f8',
    category: 'Functions & Statistics',
    title: 'Standard Deviation',
    formula: 'σ = sqrt( Σ (xi - μ)^2 / N )',
    description: 'Measures dispersion or spread of a dataset around the mean μ.',
    example: 'Used in Grade 11 statistics and probability distributions.'
  }
];

export default function MathFormulaHub({ isOpen, onClose, onOpenSolverWithPrompt }: MathFormulaHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Calculus', 'Trigonometry', 'Algebra & Sequences', 'Functions & Statistics'];

  const filteredFormulas = FORMULAS_DATA.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300 border border-white/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Grade 11 Math Formula & Theorem Hub</h2>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Quick Reference
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Essential formulas, identities, and theorems for Grade 11 Mathematics mastery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search formulas or theorems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Formula Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFormulas.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                    {item.category}
                  </span>
                  <Bookmark className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="font-black text-sm text-slate-900 mb-2">{item.title}</h3>
                
                <div className="p-3 bg-slate-900 text-indigo-200 rounded-xl font-mono text-xs mb-3 whitespace-pre-wrap shadow-inner">
                  {item.formula}
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 italic">Example: {item.example}</span>
                {onOpenSolverWithPrompt && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSolverWithPrompt(`Solve a problem demonstrating ${item.title} (${item.formula})`);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                  >
                    <span>Practice AI</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
