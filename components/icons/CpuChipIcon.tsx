import React from 'react';

export const CpuChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor"
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 16.5v-1.5m-3.75-16.5v1.5m0 16.5v-1.5M12 5.25v-1.5m0 16.5v-1.5m3.75-12H12m-3.75 0H12m-3.75 0v3.75m0-3.75h-1.5m1.5 0v3.75m0-3.75h1.5m-1.5 0v3.75M12 9h.01M15.75 9h-1.5m1.5 0v3.75m0-3.75h1.5m-1.5 0v3.75m-7.5-3.75h1.5m-1.5 0v3.75M9 12.75h3.75M9 16.5h3.75m0 0v-1.5m0 1.5h1.5m-1.5 0v-1.5m0 1.5v1.5m-1.5-1.5H9" 
        />
    </svg>
);