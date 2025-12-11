import React from 'react';

const Logo: React.FC<{ width?: number; height?: number, className?: string }> = ({ width = 50, height = 50, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width={width} height={height} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00796B', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00BCD4', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* Triangle path with open bottom */}
        <path d="M10 75 L50 5 L90 75" stroke="url(#logo-gradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Lowered the text */}
        <text 
            x="50" 
            y="55" 
            dominantBaseline="middle" 
            fontFamily="Lora, serif" 
            fontSize="28" 
            fill="url(#logo-gradient)" 
            textAnchor="middle" 
            fontWeight="bold"
        >
            MJ
        </text>
      </svg>
      <span className="text-xl font-serif text-slate-700 -mt-2 tracking-wide">vlcCamp</span>
    </div>
  );
};

export default Logo;