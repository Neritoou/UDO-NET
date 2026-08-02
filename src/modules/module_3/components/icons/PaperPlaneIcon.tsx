import React from 'react';

export function PaperPlaneIcon({ className = "w-5 h-5 text-pure-white" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M22 2L11 13" 
        stroke="currentColor" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M22 2L15 22L11 13L2 9L22 2Z" 
        stroke="currentColor" 
        strokeWidth="2.4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
