import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] cursor-pointer';

  const variantStyles = {
    primary:
      'bg-[#596B3A] text-white hover:bg-[#43522B] border border-transparent shadow-2xs focus-visible:outline-[#596B3A]',
    secondary:
      'bg-white text-[#171914] border border-[#E4E7DC] hover:border-[#D1D6C5] hover:bg-[#FAFAF7] shadow-2xs focus-visible:outline-[#596B3A]',
    ghost:
      'bg-transparent text-[#171914] hover:bg-[#EEF1E6] hover:text-[#43522B] border border-transparent focus-visible:outline-[#596B3A]',
    soft:
      'bg-[#EEF1E6] text-[#43522B] hover:bg-[#E2E7D7] border border-[#E4E7DC] focus-visible:outline-[#596B3A]',
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-xs rounded-lg gap-1.5',
    md: 'h-12 px-6 text-sm rounded-xl gap-2',
    lg: 'h-14 px-8 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
