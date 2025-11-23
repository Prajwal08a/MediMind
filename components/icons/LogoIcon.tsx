import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        {...props}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path
            d="M50 10C27.9 10 10 27.9 10 50C10 62.8 15.8 74 25 81.1V65C25 62.2 27.2 60 30 60H40V40H30C27.2 40 25 37.8 25 35V20C32.1 14.2 40.5 10.5 50 10.2M50 10C72.1 10 90 27.9 90 50C90 62.8 84.2 74 75 81.1V65C75 62.2 72.8 60 70 60H60V40H70C72.8 40 75 37.8 75 35V20C67.9 14.2 59.5 10.5 50 10.2"
            stroke="url(#grad1)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M40 50H60"
            stroke="url(#grad1)"
            strokeWidth="8"
            strokeLinecap="round"
        />
        <path
            d="M50 40V60"
            stroke="url(#grad1)"
            strokeWidth="8"
            strokeLinecap="round"
        />
    </svg>
);