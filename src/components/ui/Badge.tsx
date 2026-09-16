import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'olive' | 'neutral' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'olive',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium tracking-wide rounded-full border';

  const variantStyles = {
    olive: 'bg-[#EEF1E6] text-[#43522B] border-[#D1D6C5]',
    neutral: 'bg-[#FAFAF7] text-[#52564C] border-[#E4E7DC]',
    success: 'bg-[#F0F7EE] text-[#3D7038] border-[#CBE2C6]',
    warning: 'bg-[#FDF7E7] text-[#94681E] border-[#F2DEB0]',
    outline: 'bg-transparent text-[#52564C] border-[#E4E7DC]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
