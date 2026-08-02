import { SVGProps } from 'react';

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className || "w-[18px] h-[18px] text-lite-black"} 
      {...props}
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  );
}
