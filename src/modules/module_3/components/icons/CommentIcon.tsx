import React from 'react';

export function CommentIcon({ className = "w-4 h-4 text-alpha-black" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5103 20 9.10094 19.6543 7.85764 19.0435L3 20.5L4.54583 16.1287C3.57866 14.808 3 13.2201 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
