import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Award, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  ChevronRight, 
  Zap,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../hooks/useFirebase';
import { UserProfile } from '../types';

interface InteractiveFlashcardsProps {
  profile: UserProfile;
  onRewardXP: (xp: number) => void;
}

export interface Flashcard {
  id: string;
  category: 'Calculus' | 'Trigonometry' | 'Algebra & Sequences' | 'Functions & Statistics' | 'Custom';
  title: string;
  front: string; // The term, concept, or question
  back: string;  // The formula or definition
  example?: string;
  // SM-2 Spaced Repetition Parameters
  interval: number; // in days
  repetitions: number; // consecutive correct reviews
  easeFactor: number; // multiplier
  nextReviewDate: string; // ISO string
  lastReviewed?: string; // ISO string
}

const PRESET_FLASHCARDS: Omit<Flashcard, 'interval' | 'repetitions' | 'easeFactor' | 'nextReviewDate'>[] = [
  {
    id: 'f1',
    category: 'Calculus',
    title: 'Power Rule for Derivatives',
    front: 'What is the Power Rule for differentiating x^n?',
    back: 'd/dx [x^n] = n * x^(n-1)',
    example: 'd/dx [4x^3] = 4 * (3x^2) = 12x^2'
  },
  {
    id: 'f2',
    category: 'Calculus',
    title: 'Limit Definition of Derivative',
    front: 'What is the limit definition of a derivative f\'(x)?',
    back: "f'(x) = lim (h -> 0) [f(x + h) - f(x)] / h",
    example: 'Represents the instantaneous rate of change or the exact slope of a curve at a point.'
  },
  {
    id: 'f3',
    category: 'Trigonometry',
    title: 'Pythagorean Trigonometric Identity',
    front: 'What is the fundamental Pythagorean identity for sine and cosine?',
    back: 'sin^2(θ) + cos^2(θ) = 1',
    example: 'If sin(θ) = 3/5, then cos^2(θ) = 16/25 => cos(θ) = 4/5.'
  },
  {
    id: 'f4',
    category: 'Trigonometry',
    title: 'Law of Cosines',
    front: 'What is the Law of Cosines for side c of an oblique triangle?',
    back: 'c^2 = a^2 + b^2 - 2ab * cos(C)',
    example: 'Used to find a missing side when two sides and the included angle (SAS) are known.'
  },
  {
    id: 'f5',
    category: 'Algebra & Sequences',
    title: 'Quadratic Formula',
    front: 'What is the formula to find the roots of ax^2 + bx + c = 0?',
    back: 'x = [-b ± sqrt(b^2 - 4ac)] / (2a)',
    example: 'For 2x^2 - 4x - 6 = 0: roots are x = 3 and x = -1.'
  },
  {
    id: 'f6',
    category: 'Algebra & Sequences',
    title: 'Sum of Arithmetic Series',
    front: 'What is the sum formula Sn for a finite arithmetic progression?',
    back: 'Sn = n/2 * [2a1 + (n - 1)d]',
    example: 'Sum of first 10 integers (a1=1, d=1): 10/2 * [2 + 9] = 55.'
  },
  {
    id: 'f7',
    category: 'Functions & Statistics',
    title: 'Vertex Form of a Quadratic',
    front: 'What is the vertex form of a quadratic function?',
    back: 'f(x) = a(x - h)^2 + k',
    example: 'Vertex is at point (h, k), which represents the maximum or minimum value of the parabola.'
  },
  {
    id: 'f8',
    category: 'Functions & Statistics',
    title: 'Standard Deviation (Sample)',
    front: 'What is the standard deviation formula for sample data dispersion?',
    back: 's = sqrt( Σ (xi - x̄)^2 / (N - 1) )',
    example: 'Measures the spread or average distance of observations from the sample mean.'
  }
];

export default function InteractiveFlashcards({ profile, onRewardXP }: InteractiveFlashcardsProps) {
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'custom'>('all');
  const [sessionReviewedCount, setSessionReviewedCount] = useState(0);
  const [showXPToast, setShowXPToast] = useState(false);
  
  // Custom Card Creator state
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCategory, setNewCategory] = useState<Flashcard['category']>('Custom');

  // Load user flashcards from Firestore subcollection or instantiate with presets
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!profile.uid) return;
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users', profile.uid, 'flashcards'));
        
        if (querySnapshot.empty) {
          // Populate user's Firestore with the initial presets
          const initialDeck: Flashcard[] = PRESET_FLASHCARDS.map(preset => ({
            ...preset,
            interval: 0,
            repetitions: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date().toISOString()
          }));

          for (const card of initialDeck) {
            await setDoc(doc(db, 'users', profile.uid, 'flashcards', card.id), card);
          }
          setDeck(initialDeck);
        } else {
          const loadedDeck: Flashcard[] = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Flashcard));
          setDeck(loadedDeck);
        }
      } catch (err) {
        console.error("Error loading flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [profile.uid]);

  // Determine current filtered set
  const filteredDeck = deck.filter(card => {
    if (filter === 'due') {
      const dueTime = new Date(card.nextReviewDate).getTime();
      return dueTime <= Date.now();
    }
    if (filter === 'custom') {
      return card.category === 'Custom';
    }
    return true;
  });

  const activeCard = filteredDeck[currentIndex];

  // Flip state reset when changing active cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // SM-2 Spaced Repetition Algorithm rating callback
  const handleRateSM2 = async (rating: 'Forgot' | 'Hard' | 'Good' | 'Easy') => {
    if (!profile.uid || !activeCard) return;
    setActionLoading(true);

    let nextRep = activeCard.repetitions;
    let nextInterval = activeCard.interval;
    let nextEase = activeCard.easeFactor;

    if (rating === 'Forgot') {
      nextRep = 0;
      nextInterval = 1;
      nextEase = Math.max(1.3, nextEase - 0.2);
    } else if (rating === 'Hard') {
      nextRep = 1;
      nextInterval = 1;
      nextEase = Math.max(1.3, nextEase - 0.15);
    } else if (rating === 'Good') {
      if (nextRep === 0) {
        nextInterval = 1;
      } else if (nextRep === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.ceil(nextInterval * nextEase);
      }
      nextRep += 1;
    } else if (rating === 'Easy') {
      if (nextRep === 0) {
        nextInterval = 1;
      } else if (nextRep === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.ceil(nextInterval * nextEase * 1.2);
      }
      nextRep += 1;
      nextEase = nextEase + 0.15;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    const updatedCard: Flashcard = {
      ...activeCard,
      interval: nextInterval,
      repetitions: nextRep,
      easeFactor: Number(nextEase.toFixed(2)),
      nextReviewDate: nextReview.toISOString(),
      lastReviewed: new Date().toISOString()
    };

    try {
      const cardRef = doc(db, 'users', profile.uid, 'flashcards', activeCard.id);
      await updateDoc(cardRef, {
        interval: nextInterval,
        repetitions: nextRep,
        easeFactor: Number(nextEase.toFixed(2)),
        nextReviewDate: nextReview.toISOString(),
        lastReviewed: new Date().toISOString()
      });

      // Update local state deck
      setDeck(prev => prev.map(c => c.id === activeCard.id ? updatedCard : c));
      
      // Award 15 XP for practicing & showing success toast
      onRewardXP(15);
      setSessionReviewedCount(prev => prev + 1);
      setShowXPToast(true);
      setTimeout(() => setShowXPToast(false), 2000);

      // Move forward in the deck
      if (currentIndex < filteredDeck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Wrapped around or reached the end of current review slice
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to update flashcard state:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Create a personal custom flashcard
  const handleCreateCustomCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.uid || !newTitle || !newFront || !newBack) return;

    const customCard: Flashcard = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      front: newFront,
      back: newBack,
      example: newExample,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString()
    };

    try {
      const cardRef = doc(db, 'users', profile.uid, 'flashcards', customCard.id);
      await setDoc(cardRef, customCard);
      
      setDeck(prev => [...prev, customCard]);
      setShowCreator(false);
      setNewTitle('');
      setNewFront('');
      setNewBack('');
      setNewExample('');
      
      // Reward small XP for formulating a card
      onRewardXP(30);
    } catch (err) {
      console.error("Failed to create custom card:", err);
    }
  };

  // Delete a card
  const handleDeleteCard = async (cardId: string) => {
    if (!profile.uid) return;
    if (!confirm("Are you sure you want to remove this flashcard?")) return;

    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'flashcards', cardId));
      setDeck(prev => prev.filter(c => c.id !== cardId));
      if (currentIndex >= filteredDeck.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-indigo-950/10">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Spaced-Repetition System (SM-2)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            Interactive Formula & Theorem Flashcards
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Practice essential formulas and algebraic rules. Our smart scheduling algorithm (SM-2) adjusts reviews based on your confidence rating to secure optimal long-term memory retrieval.
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-amber-200 uppercase tracking-wider">Session Progress</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-white block">+{sessionReviewedCount * 15} XP</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sessionReviewedCount} Cards Practiced</span>
          </div>
        </div>
      </div>

      {/* Floating XP Reward Indicator Toast */}
      <AnimatePresence>
        {showXPToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 right-6 bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-emerald-100" />
            <span>Spaced Repetition Practice Complete: +15 XP!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Filters & Creator Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-2xl overflow-x-auto self-start sm:self-auto">
          <button
            onClick={() => { setFilter('all'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Decks ({deck.length})
          </button>
          <button
            onClick={() => { setFilter('due'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'due' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Due Reviews ({deck.filter(c => new Date(c.nextReviewDate).getTime() <= Date.now()).length})
          </button>
          <button
            onClick={() => { setFilter('custom'); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Custom Cards ({deck.filter(c => c.category === 'Custom').length})
          </button>
        </div>

        <button
          onClick={() => setShowCreator(!showCreator)}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100/60 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Personal Flashcard</span>
        </button>
      </div>

      {/* Creator Form Slide-Down */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateCustomCard} className="p-6 bg-slate-50 border border-slate-200/85 rounded-3xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Formulate New Spaced-Repetition Card</h3>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+30 XP Formulation Bonus</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Card Title / Concept Name</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Quotient Rule for Derivatives"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Topic Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Flashcard['category'])}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Calculus">Calculus</option>
                    <option value="Trigonometry">Trigonometry</option>
                    <option value="Algebra & Sequences">Algebra & Sequences</option>
                    <option value="Functions & Statistics">Functions & Statistics</option>
                    <option value="Custom">Custom State / Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Front (Question or Term)</label>
                  <textarea
                    required
                    rows={2}
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="e.g. How do you find the derivative of u/v?"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Back (Formula, Answer, or Definition)</label>
                  <textarea
                    required
                    rows={2}
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="e.g. [u'v - uv'] / v^2"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Algebraic Example or Tip (Optional)</label>
                  <input
                    type="text"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    placeholder="e.g. d/dx [x / (x+1)] = [1(x+1) - x(1)] / (x+1)^2 = 1 / (x+1)^2"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreator(false)}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 transition-all"
                >
                  Confirm Card Formulation
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flashcard Interactive Play Stage */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
          <p className="text-xs text-slate-500 font-bold">Synchronizing spaced-repetition deck with Firestore...</p>
        </div>
      ) : filteredDeck.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200/60 rounded-3xl space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">No Flashcards Available</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {filter === 'due' 
                ? "Excellent job! You have fully completed all spaced-repetition due reviews for today. Try checking 'All Decks' or formulate custom items!"
                : "No matching flashcards found. Create a custom item above to start practicing!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Deck progress slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>Reviewing card {currentIndex + 1} of {filteredDeck.length}</span>
              <span className="text-indigo-600">{Math.round(((currentIndex + 1) / filteredDeck.length) * 100)}% complete</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / filteredDeck.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Interactive Card Stage with Flip Effect */}
          <div className="flex justify-center">
            <div 
              className="w-full max-w-lg aspect-[1.618/1] cursor-pointer relative perspective"
              style={{ perspective: '1000px' }}
              onClick={() => setIsFlipped(!isFlipped)}
              id={`flashcard-stage-${activeCard.id}`}
            >
              <motion.div
                className="w-full h-full relative duration-700 preserve-3d"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* FRONT SIDE */}
                <div 
                  className="absolute inset-0 bg-white border border-slate-200/85 rounded-3xl shadow-xl flex flex-col justify-between p-6 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {activeCard.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Repetitions: {activeCard.repetitions}</span>
                    </div>
                  </div>

                  <div className="text-center py-6">
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1.5">{activeCard.title}</h3>
                    <p className="text-sm font-semibold text-slate-600 leading-relaxed px-4">
                      {activeCard.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-indigo-600 font-extrabold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Tap Card to Reveal Formula</span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  className="absolute inset-0 bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-xl flex flex-col justify-between p-6 backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-900/30">
                      Answer Reveal
                    </span>
                    {activeCard.category === 'Custom' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid flipping
                          handleDeleteCard(activeCard.id);
                        }}
                        className="p-1.5 bg-rose-950/40 text-rose-400 hover:text-white border border-rose-900/30 rounded-xl transition-colors"
                        title="Delete Custom Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-center py-4 space-y-3">
                    <h4 className="font-black text-indigo-400 text-sm">{activeCard.title}</h4>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl inline-block">
                      <code className="text-emerald-400 text-sm font-black font-mono">
                        {activeCard.back}
                      </code>
                    </div>
                    {activeCard.example && (
                      <div className="px-4 text-left border-l-2 border-indigo-500/55 pl-3">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Example Case</span>
                        <p className="text-[11px] text-slate-300 italic leading-relaxed">
                          {activeCard.example}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-indigo-400 font-extrabold">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tap Card to See Question</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* SM-2 Spaced Repetition Algorithmic Action Buttons */}
          <div className="p-4 bg-slate-50 border border-slate-200/85 rounded-3xl flex flex-col items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>How did you perform? Tap to Schedule Next Review:</span>
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
              <button
                onClick={() => handleRateSM2('Forgot')}
                disabled={actionLoading}
                className="px-4 py-3 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-400 text-rose-600 font-black rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all group"
                id="sm2-forgot-btn"
              >
                <span className="text-[11px] block group-hover:scale-105 transition-transform">Forgot (Again)</span>
                <span className="text-[8px] font-bold text-rose-400 block uppercase tracking-wider">Due in 1 day</span>
              </button>

              <button
                onClick={() => handleRateSM2('Hard')}
                disabled={actionLoading}
                className="px-4 py-3 bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-600 font-black rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all group"
                id="sm2-hard-btn"
              >
                <span className="text-[11px] block group-hover:scale-105 transition-transform">Hard / Confused</span>
                <span className="text-[8px] font-bold text-amber-400 block uppercase tracking-wider">Due in 1 day</span>
              </button>

              <button
                onClick={() => handleRateSM2('Good')}
                disabled={actionLoading}
                className="px-4 py-3 bg-white hover:bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-600 font-black rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all group"
                id="sm2-good-btn"
              >
                <span className="text-[11px] block group-hover:scale-105 transition-transform">Good / Got it</span>
                <span className="text-[8px] font-bold text-sky-400 block uppercase tracking-wider">Interval x{activeCard.easeFactor}</span>
              </button>

              <button
                onClick={() => handleRateSM2('Easy')}
                disabled={actionLoading}
                className="px-4 py-3 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-emerald-600 font-black rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all group"
                id="sm2-easy-btn"
              >
                <span className="text-[11px] block group-hover:scale-105 transition-transform">Easy / Fluent</span>
                <span className="text-[8px] font-bold text-emerald-400 block uppercase tracking-wider">Interval x{(activeCard.easeFactor * 1.2).toFixed(1)}</span>
              </button>
            </div>
          </div>

          {/* Sibling Card Navigator Buttons */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(prev => prev - 1);
                } else {
                  setCurrentIndex(filteredDeck.length - 1);
                }
              }}
              className="px-4.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors"
            >
              Previous Card
            </button>
            <button
              onClick={() => {
                if (currentIndex < filteredDeck.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  setCurrentIndex(0);
                }
              }}
              className="px-4.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors"
            >
              Skip / Next Card
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
