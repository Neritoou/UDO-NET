import React from 'react';

interface UpvoteIconProps {
  className?: string;
  active?: boolean;
}

export function UpvoteIcon({ className = "w-8 h-8", active = false }: UpvoteIconProps) {
  const bgFill = active ? "#5D9CFC" : "#EEEEEE";
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
        d="M16 9V23M16 9L9.5 15.5M16 9L22.5 15.5" 
        stroke={strokeColor} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
