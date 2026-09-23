import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  activeBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  activeBorder = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border ${
        activeBorder ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200/90'
      } shadow-2xs ${
        hoverEffect ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''
      } p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`mb-3 pb-3 border-b border-slate-100 ${className}`}>{children}</div>;

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <h3 className={`text-base font-black text-slate-900 tracking-tight ${className}`}>{children}</h3>;

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <p className={`text-xs text-slate-400 font-medium ${className}`}>{children}</p>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={className}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
