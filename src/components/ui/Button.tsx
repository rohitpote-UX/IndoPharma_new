import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'outline';
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
    'group inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] cursor-pointer';

  const variantStyles = {
    primary:
      'bg-[#2F5D3A] text-white hover:bg-[#24482D] border border-transparent shadow-xs focus-visible:outline-[#2F5D3A]',
    secondary:
      'bg-white text-[#111411] border border-[#E6ECE7] hover:border-[#D3DDD5] hover:bg-[#F3F7F3] shadow-xs focus-visible:outline-[#2F5D3A]',
    outline:
      'bg-white text-[#111411] border border-[#E6ECE7] hover:border-[#D3DDD5] hover:bg-[#F3F7F3] shadow-xs focus-visible:outline-[#2F5D3A]',
    ghost:
      'bg-transparent text-[#111411] hover:bg-[#F3F7F3] hover:text-[#2F5D3A] border border-transparent focus-visible:outline-[#2F5D3A]',
    soft:
      'bg-[#F3F7F3] text-[#2F5D3A] hover:bg-[#E9F1EA] border border-[#E6ECE7] focus-visible:outline-[#2F5D3A]',
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-xs rounded-lg gap-1.5',
    md: 'h-12 px-6 text-sm rounded-xl gap-2',
    lg: 'h-13 sm:h-14 px-8 text-sm sm:text-base rounded-xl gap-2.5',
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
