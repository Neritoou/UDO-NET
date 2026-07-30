import React from 'react';

interface DownvoteIconProps {
  className?: string;
  active?: boolean;
}

export function DownvoteIcon({ className = "w-8 h-8", active = false }: DownvoteIconProps) {
  const bgFill = active ? "#D13B00" : "#EEEEEE";
  const strokeColor = active ? "#FFFFFF" : "#0C0C0C";

  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="16" fill={bgFill} />
      <path 
        d="M16 23V9M16 23L9.5 16.5M16 23L22.5 16.5" 
        stroke={strokeColor} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
