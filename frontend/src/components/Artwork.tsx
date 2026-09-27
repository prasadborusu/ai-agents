import React from 'react';

// Botanical Silhouette Sprig
export const BotanicalBranch: React.FC<{ className?: string; flip?: boolean }> = ({
  className = '',
  flip = false,
}) => (
  <svg
    viewBox="0 0 200 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} ${flip ? '-scale-x-100' : ''}`}
  >
    {/* Main Stem */}
    <path
      d="M100 395 C95 320, 110 240, 90 160 C75 100, 115 50, 110 5"
      stroke="#1e262c"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    
    {/* Branch 1 - Lower Right */}
    <path
      d="M96 310 C125 295, 145 270, 160 250"
      stroke="#1e262c"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M148 265 L170 245" stroke="#1e262c" strokeWidth="1.2" />
    <path d="M138 275 L155 260" stroke="#1e262c" strokeWidth="1.2" />
    <circle cx="160" cy="250" r="4" fill="#1e262c" />
    <circle cx="170" cy="245" r="3.5" fill="#1e262c" />
    <circle cx="155" cy="260" r="3" fill="#1e262c" />

    {/* Branch 2 - Lower Left */}
    <path
      d="M98 270 C70 250, 45 225, 30 195"
      stroke="#1e262c"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M48 215 L32 205" stroke="#1e262c" strokeWidth="1.2" />
    <path d="M60 228 L46 220" stroke="#1e262c" strokeWidth="1.2" />
    <circle cx="30" cy="195" r="4.2" fill="#1e262c" />
    <circle cx="32" cy="205" r="3.2" fill="#1e262c" />
    <circle cx="46" cy="220" r="3" fill="#1e262c" />

    {/* Branch 3 - Mid Right */}
    <path
      d="M92 200 C120 180, 140 150, 155 125"
      stroke="#1e262c"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M138 145 L152 135" stroke="#1e262c" strokeWidth="1.1" />
    <path d="M125 158 L142 150" stroke="#1e262c" strokeWidth="1.1" />
    <circle cx="155" cy="125" r="4" fill="#1e262c" />
    <circle cx="152" cy="135" r="3.5" fill="#1e262c" />
    <circle cx="142" cy="150" r="3" fill="#1e262c" />

    {/* Branch 4 - Mid Left */}
    <path
      d="M87 145 C65 125, 50 100, 40 75"
      stroke="#1e262c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M55 95 L42 85" stroke="#1e262c" strokeWidth="1" />
    <circle cx="40" cy="75" r="3.8" fill="#1e262c" />
    <circle cx="42" cy="85" r="3.2" fill="#1e262c" />

    {/* Top Cluster */}
    <path d="M102 70 L125 50" stroke="#1e262c" strokeWidth="1.3" />
    <path d="M96 50 L80 32" stroke="#1e262c" strokeWidth="1.3" />
    <circle cx="110" cy="5" r="4.5" fill="#1e262c" />
    <circle cx="125" cy="50" r="3.8" fill="#1e262c" />
    <circle cx="80" cy="32" r="3.8" fill="#1e262c" />
    <circle cx="95" cy="22" r="3.2" fill="#1e262c" />
  </svg>
);

// Mountain Landscape Backing Mural (Top Right & Bottom Right)
export const LandscapeMural: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 700 450"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pointer-events-none select-none ${className}`}
  >
    <defs>
      {/* Halftone Dot Pattern */}
      <pattern id="stipple" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="#1e262c" opacity="0.12" />
        <circle cx="7" cy="7" r="0.8" fill="#1e262c" opacity="0.12" />
      </pattern>
    </defs>

    {/* Warm Golden Sun Disc */}
    <circle cx="480" cy="110" r="68" fill="#df9e52" opacity="0.9" />

    {/* Layer 1: Distant Warm Ridge (Sand/Terracotta tint) */}
    <path
      d="M180 250 C 260 210, 360 215, 460 170 C 530 138, 620 160, 700 135 L 700 450 L 180 450 Z"
      fill="#eedcd2"
      opacity="0.85"
    />
    <path
      d="M180 250 C 260 210, 360 215, 460 170 C 530 138, 620 160, 700 135 L 700 450 L 180 450 Z"
      fill="url(#stipple)"
    />

    {/* Layer 2: Deep Terracotta/Clay Ridge */}
    <path
      d="M120 310 C 220 270, 340 280, 440 230 C 540 180, 620 220, 700 195 L 700 450 L 120 450 Z"
      fill="#d36d4e"
      opacity="0.8"
    />

    {/* Layer 3: Sage Green Forest Ridge */}
    <path
      d="M60 365 C 160 330, 270 335, 380 280 C 480 230, 580 270, 700 240 L 700 450 L 60 L 450 Z"
      fill="#3e6b5c"
      opacity="0.9"
    />
    <path
      d="M60 365 C 160 330, 270 335, 380 280 C 480 230, 580 270, 700 240 L 700 450 L 60 L 450 Z"
      fill="url(#stipple)"
    />

    {/* Layer 4: Foreground Terracotta Dunes */}
    <path
      d="M0 410 C 120 380, 260 395, 390 345 C 500 305, 600 335, 700 300 L 700 450 L 0 450 Z"
      fill="#cb5e3f"
      opacity="0.85"
    />

    {/* Foreground Botanical Stems Overlay */}
    <g transform="translate(520, 160) scale(0.65)">
      <path d="M50 250 Q 55 120 70 20" stroke="#182026" strokeWidth="2" strokeLinecap="round" />
      <path d="M53 180 Q 75 160 95 140" stroke="#182026" strokeWidth="1.5" />
      <path d="M55 130 Q 30 110 15 90" stroke="#182026" strokeWidth="1.5" />
      <path d="M62 80 Q 80 65 92 50" stroke="#182026" strokeWidth="1.5" />
      <circle cx="70" cy="20" r="4.5" fill="#182026" />
      <circle cx="95" cy="140" r="3.5" fill="#182026" />
      <circle cx="15" cy="90" r="3.5" fill="#182026" />
      <circle cx="92" cy="50" r="3.5" fill="#182026" />
    </g>

    <g transform="translate(610, 200) scale(0.55)">
      <path d="M50 250 Q 40 130 50 15" stroke="#182026" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 170 Q 70 150 85 130" stroke="#182026" strokeWidth="1.5" />
      <circle cx="50" cy="15" r="4" fill="#182026" />
      <circle cx="85" cy="130" r="3.5" fill="#182026" />
    </g>
  </svg>
);

// Sidebar Mountain + Sun Logo
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sun */}
    <circle cx="38" cy="20" r="12" fill="#df9e52" />
    {/* Top Clay Ridge */}
    <path d="M6 38 C 16 32, 28 34, 40 28 C 48 24, 54 26, 58 24 L 58 54 L 6 54 Z" fill="#eedcd2" />
    {/* Middle Terracotta Ridge */}
    <path d="M4 42 C 14 36, 26 38, 36 32 C 44 28, 52 30, 58 28 L 58 54 L 4 54 Z" fill="#d36d4e" />
    {/* Foreground Sage Ridge */}
    <path d="M2 46 C 12 40, 24 42, 34 37 C 44 32, 50 35, 58 33 L 58 54 L 2 54 Z" fill="#3e6b5c" />
    {/* Base Charcoal Horizon */}
    <path d="M0 50 C 15 47, 30 48, 42 45 C 50 43, 54 44, 60 43 L 60 54 L 0 54 Z" fill="#182026" />
  </svg>
);

// Line Illustration of Machine with Watercolor Sun
export const MachineIllustration: React.FC<{
  type: 'cnc' | 'pump' | 'press' | 'conveyor';
  color?: 'terracotta' | 'sage' | 'ochre';
  className?: string;
}> = ({ type, color = 'terracotta', className = 'w-full h-28' }) => {
  const blobColor =
    color === 'sage'
      ? '#3e6b5c'
      : color === 'ochre'
      ? '#df9e52'
      : '#d36d4e';

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Watercolor Sun Circle */}
      <div
        className="absolute w-20 h-20 rounded-full opacity-65 -top-1 right-6 transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: blobColor }}
      />
      {/* Decorative Botanical Branch in card background */}
      <svg
        viewBox="0 0 100 120"
        className="absolute right-0 bottom-0 w-24 h-24 opacity-30 pointer-events-none"
        fill="none"
      >
        <path d="M30 110 Q 50 60 70 10" stroke="#182026" strokeWidth="1.2" />
        <path d="M48 70 L 68 55" stroke="#182026" strokeWidth="1" />
        <circle cx="70" cy="10" r="2.5" fill="#182026" />
        <circle cx="68" cy="55" r="2.5" fill="#182026" />
      </svg>

      {/* Machine Line Drawing */}
      {type === 'cnc' && (
        <svg viewBox="0 0 160 100" fill="none" className="relative z-10 w-36 h-24" stroke="#182026" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Main Enclosure */}
          <rect x="25" y="20" width="95" height="65" rx="3" fill="#ffffff" fillOpacity="0.8" />
          {/* Window / Shield */}
          <rect x="40" y="28" width="40" height="38" rx="2" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Spindle Column & Toolhead */}
          <line x1="60" y1="28" x2="60" y2="44" strokeWidth="2.2" />
          <polygon points="56,44 64,44 60,52" fill="#182026" />
          {/* Workpiece / Bed */}
          <rect x="45" y="56" width="30" height="8" rx="1" strokeWidth="1.4" />
          {/* Control Console on Right */}
          <rect x="120" y="28" width="22" height="40" rx="2" fill="#ffffff" fillOpacity="0.9" />
          <circle cx="131" cy="38" r="4" strokeWidth="1.2" />
          <line x1="126" y1="48" x2="136" y2="48" strokeWidth="1.2" />
          <line x1="126" y1="54" x2="136" y2="54" strokeWidth="1.2" />
          <line x1="126" y1="60" x2="132" y2="60" strokeWidth="1.2" />
          {/* Base Stand & Feet */}
          <line x1="20" y1="85" x2="145" y2="85" strokeWidth="2" />
          <line x1="30" y1="85" x2="30" y2="92" strokeWidth="2" />
          <line x1="115" y1="85" x2="115" y2="92" strokeWidth="2" />
          <line x1="135" y1="85" x2="135" y2="92" strokeWidth="2" />
        </svg>
      )}

      {type === 'pump' && (
        <svg viewBox="0 0 160 100" fill="none" className="relative z-10 w-36 h-24" stroke="#182026" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Pump Motor Casing */}
          <rect x="25" y="30" width="45" height="42" rx="3" fill="#ffffff" fillOpacity="0.8" />
          <line x1="33" y1="30" x2="33" y2="72" strokeWidth="1.2" />
          <line x1="42" y1="30" x2="42" y2="72" strokeWidth="1.2" />
          <line x1="51" y1="30" x2="51" y2="72" strokeWidth="1.2" />
          <line x1="60" y1="30" x2="60" y2="72" strokeWidth="1.2" />
          {/* Coupling */}
          <rect x="70" y="42" width="12" height="18" fill="#182026" fillOpacity="0.2" />
          {/* Volute / Pump Housing */}
          <circle cx="102" cy="51" r="22" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="102" cy="51" r="8" strokeWidth="1.2" />
          {/* Discharge Flange on Top */}
          <line x1="102" y1="29" x2="102" y2="15" strokeWidth="2" />
          <line x1="94" y1="15" x2="110" y2="15" strokeWidth="2.5" />
          {/* Base Skid */}
          <line x1="18" y1="78" x2="135" y2="78" strokeWidth="2.2" />
          <rect x="22" y="78" width="108" height="6" fill="#182026" fillOpacity="0.1" />
        </svg>
      )}

      {type === 'press' && (
        <svg viewBox="0 0 160 100" fill="none" className="relative z-10 w-36 h-24" stroke="#182026" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Hydraulic Crown / Cylinder Top */}
          <rect x="52" y="12" width="40" height="24" rx="2" fill="#ffffff" fillOpacity="0.8" />
          <line x1="72" y1="12" x2="72" y2="36" strokeWidth="1.8" />
          {/* Ram / Plunger */}
          <line x1="72" y1="36" x2="72" y2="52" strokeWidth="3" />
          {/* Upper Die / Slide */}
          <rect x="42" y="52" width="60" height="10" fill="#182026" fillOpacity="0.2" />
          {/* Columns / Tie Rods */}
          <line x1="38" y1="18" x2="38" y2="78" strokeWidth="2.2" />
          <line x1="106" y1="18" x2="106" y2="78" strokeWidth="2.2" />
          {/* Lower Bed / Bolster */}
          <rect x="30" y="68" width="84" height="14" rx="1" fill="#ffffff" fillOpacity="0.9" />
          <line x1="20" y1="84" x2="124" y2="84" strokeWidth="2.4" />
        </svg>
      )}

      {type === 'conveyor' && (
        <svg viewBox="0 0 160 100" fill="none" className="relative z-10 w-36 h-24" stroke="#182026" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {/* Rollers Left & Right */}
          <circle cx="35" cy="48" r="14" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="35" cy="48" r="4" fill="#182026" />
          <circle cx="125" cy="48" r="14" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="125" cy="48" r="4" fill="#182026" />
          {/* Intermediate Idler Rollers */}
          <circle cx="65" cy="48" r="8" strokeWidth="1.2" />
          <circle cx="95" cy="48" r="8" strokeWidth="1.2" />
          {/* Continuous Belt Top & Bottom */}
          <line x1="35" y1="34" x2="125" y2="34" strokeWidth="2.2" />
          <line x1="35" y1="62" x2="125" y2="62" strokeWidth="2.2" />
          {/* Support Truss Legs */}
          <line x1="35" y1="62" x2="25" y2="84" strokeWidth="2" />
          <line x1="125" y1="62" x2="135" y2="84" strokeWidth="2" />
          <line x1="80" y1="62" x2="80" y2="84" strokeWidth="2" />
          <line x1="20" y1="84" x2="140" y2="84" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
};
