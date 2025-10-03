
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  children: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({ children, className = 'w-6 h-6', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
};

export const Edit3: React.FC<{className?: string}> = ({className}) => (
    <Icon className={className}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Icon>
)

export const Clock: React.FC<{className?: string}> = ({className}) => (
    <Icon className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </Icon>
)

export const Archive: React.FC<{className?: string}> = ({className}) => (
    <Icon className={className}>
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </Icon>
)

export const BarChart2: React.FC<{className?: string}> = ({className}) => (
    <Icon className={className}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </Icon>
)

export const Wand2: React.FC<{className?: string}> = ({className}) => (
    <Icon className={className}>
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11.8 8.2a1.21 1.21 0 0 0 0 1.72l5.8 5.8a1.21 1.21 0 0 0 1.72 0l6.84-6.84a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/><path d="M18 21v-2"/><path d="M13 17H9"/>
    </Icon>
)
