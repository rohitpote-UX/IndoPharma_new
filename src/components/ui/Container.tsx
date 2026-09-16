import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({
  children,
  className = '',
  size = 'default',
  ...props
}: ContainerProps) {
  const maxWidthMap = {
    narrow: 'max-w-4xl',
    default: 'max-w-[1440px]',
    wide: 'max-w-[1600px]',
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 ${maxWidthMap[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
