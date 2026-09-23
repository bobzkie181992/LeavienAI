import React from 'react';
import { BookOpen, Award, ArrowRight, Layers } from 'lucide-react';
import { Card, CardTitle, CardDescription } from './Card';
import { ProgressBar } from './ProgressBar';

export interface SubjectCardProps {
  title: string;
  code: string;
  description: string;
  topicCount: number;
  completedCount: number;
  progressPercent: number;
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  title,
  code,
  description,
  topicCount,
  completedCount,
  progressPercent,
  colorTheme = 'indigo',
  onClick
}) => {
  const themeClasses = {
    indigo: 'from-indigo-600 to-indigo-800 text-white',
    emerald: 'from-emerald-600 to-teal-800 text-white',
    amber: 'from-amber-500 to-orange-700 text-slate-950',
    rose: 'from-rose-600 to-pink-800 text-white'
  };

  return (
    <Card
      hoverEffect
      onClick={onClick}
      className="cursor-pointer border-slate-200 hover:border-indigo-300 group flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-[10px] tracking-wider uppercase">
            {code}
          </span>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            {completedCount}/{topicCount} Units
          </span>
        </div>

        <div>
          <CardTitle className="text-base group-hover:text-indigo-600 transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-1">
            {description}
          </CardDescription>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
        <ProgressBar
          value={progressPercent}
          label="Subject Mastery"
          size="sm"
          color={colorTheme === 'amber' ? 'amber' : colorTheme === 'emerald' ? 'emerald' : 'indigo'}
        />
        <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
          <span>Explore Curriculum</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
};
