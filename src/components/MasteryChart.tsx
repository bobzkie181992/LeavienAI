import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface MasteryChartProps {
  competencyScores: Record<string, number>;
}

export default function MasteryChart({ competencyScores }: MasteryChartProps) {
  const data = Object.entries(competencyScores).map(([name, score]) => ({
    name,
    score,
  }));

  return (
    <div className="h-80 w-full bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Competency"
            dataKey="score"
            stroke="#4f46e5"
            fill="#818cf8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
