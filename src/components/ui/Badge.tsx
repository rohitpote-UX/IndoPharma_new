import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'green' | 'olive' | 'neutral' | 'success' | 'warning' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'green',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium tracking-wide rounded-full border';

  const variantStyles = {
    green: 'bg-[#F3F7F3] text-[#2F5D3A] border-[#E6ECE7]',
    olive: 'bg-[#F3F7F3] text-[#2F5D3A] border-[#E6ECE7]', // backwards compatible
    neutral: 'bg-[#FFFFFF] text-[#59605A] border-[#E6ECE7]',
    success: 'bg-[#F3F7F3] text-[#2F5D3A] border-[#D3DDD5]',
    warning: 'bg-[#FDF9EE] text-[#8B651B] border-[#F2DEB0]',
    danger: 'bg-[#FFF1F0] text-[#CF1322] border-[#FFCCC7]',
    outline: 'bg-transparent text-[#59605A] border-[#E6ECE7]',
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
