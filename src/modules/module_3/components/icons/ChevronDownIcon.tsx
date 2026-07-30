import { SVGProps } from 'react';

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 12 12" 
      strokeWidth={4} 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className || "w-[9px] h-[5px] text-main-black"} 
      {...props}
    >
      <path d="m2 4 4 4 4-4" />
    </svg>
  );
}
