import React from 'react';
import { BookOpen, CheckCircle2, Clock, ChevronRight, Award } from 'lucide-react';
import { Card, CardTitle, CardDescription } from './Card';
import { ProgressBar } from './ProgressBar';

export interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  quarter?: string;
  duration?: string;
  masteryScore?: number; // 0 - 100
  ilawPillars?: {
    intentions?: boolean;
    learningExperience?: boolean;
    assessing?: boolean;
    waysForward?: boolean;
  };
  onClick?: () => void;
  status?: 'completed' | 'in-progress' | 'not-started';
}

export const LessonCard: React.FC<LessonCardProps> = ({
  title,
  description,
  quarter = 'Quarter 1',
  duration = '45 mins',
  masteryScore = 0,
  ilawPillars,
  onClick,
  status = 'not-started'
}) => {
  return (
    <Card
      hoverEffect
      onClick={onClick}
      className="cursor-pointer border-slate-200 hover:border-indigo-200 group flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            {quarter}
          </span>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        </div>

        <div>
          <CardTitle className="text-sm sm:text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1">
            {description}
          </CardDescription>
        </div>

        {/* ILAW 4-Pillar Status Indicators */}
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            ILAW Learning Pillars
          </span>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
            <span className={`py-1 rounded-lg ${ilawPillars?.intentions ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200/60 text-slate-400'}`}>
              I
            </span>
            <span className={`py-1 rounded-lg ${ilawPillars?.learningExperience ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/60 text-slate-400'}`}>
              L
            </span>
            <span className={`py-1 rounded-lg ${ilawPillars?.assessing ? 'bg-rose-100 text-rose-800' : 'bg-slate-200/60 text-slate-400'}`}>
              A
            </span>
            <span className={`py-1 rounded-lg ${ilawPillars?.waysForward ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/60 text-slate-400'}`}>
              W
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <ProgressBar value={masteryScore} label="Mastery Score" size="sm" color={masteryScore >= 80 ? 'emerald' : 'indigo'} />
        <div className="flex items-center justify-between text-xs font-bold text-indigo-600 pt-1">
          <span>{status === 'completed' ? 'Review Lesson' : 'Start ILAW Module'}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
};
