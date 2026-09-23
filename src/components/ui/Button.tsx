import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none min-h-[40px]";
  
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300",
    secondary: "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-200",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-2xs",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200",
    amber: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-200"
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-xs sm:text-sm gap-2 min-h-[42px]",
    lg: "px-6 py-3 text-sm sm:text-base gap-2.5 min-h-[48px]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
