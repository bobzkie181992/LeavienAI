import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number; // 0 to 100
  color?: string;
}

export interface SimpleChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  title,
  subtitle,
  height = 160
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      {(title || subtitle) && (
        <div>
          {title && <h4 className="text-sm font-black text-slate-900">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>
      )}

      {/* Bar Chart Container */}
      <div className="flex items-end justify-between gap-2 pt-2" style={{ height: `${height}px` }}>
        {data.map((item, i) => {
          const heightPercent = Math.round((item.value / maxValue) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-black text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}%
              </span>
              <div
                className={`w-full rounded-2xl transition-all duration-500 ease-out group-hover:brightness-110 ${
                  item.color || 'bg-indigo-600'
                }`}
                style={{ height: `${Math.max(8, heightPercent)}%` }}
              />
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[60px] text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
