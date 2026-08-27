import React from 'react';

interface RSMotorsLogoProps {
  variant?: 'full' | 'horizontal' | 'symbol' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const RSMotorsLogo: React.FC<RSMotorsLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  // Dimensions according to size & variant
  const sizeConfig = {
    sm: {
      symbol: { width: 36, height: 28 },
      horizontal: { width: 140, height: 32 },
      full: { width: 160, height: 56 },
      badge: { width: 44, height: 44 },
    },
    md: {
      symbol: { width: 48, height: 38 },
      horizontal: { width: 180, height: 40 },
      full: { width: 220, height: 75 },
      badge: { width: 56, height: 56 },
    },
    lg: {
      symbol: { width: 72, height: 56 },
      horizontal: { width: 240, height: 54 },
      full: { width: 300, height: 100 },
      badge: { width: 72, height: 72 },
    },
    xl: {
      symbol: { width: 96, height: 76 },
      horizontal: { width: 320, height: 72 },
      full: { width: 420, height: 140 },
      badge: { width: 96, height: 96 },
    },
  }[size][variant];

  // Gradients and filter definitions for metallic chrome & gold
  const SvgDefs = () => (
    <defs>
      {/* Chrome / Silver Gradient */}
      <linearGradient id="rs-chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="25%" stopColor="#CBD5E1" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="75%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="rs-chrome-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#E2E8F0" stopOpacity="0.6" />
        <stop offset="55%" stopColor="#94A3B8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
      </linearGradient>

      {/* Gold Metallic Gradient */}
      <linearGradient id="rs-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="20%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#B45309" />
        <stop offset="70%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>

      <linearGradient id="rs-gold-arc" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#B45309" stopOpacity="0.2" />
        <stop offset="40%" stopColor="#F59E0B" />
        <stop offset="80%" stopColor="#FEF08A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>

      {/* Drop Shadows and Bevel filters */}
      <filter id="rs-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="rs-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
      </filter>
    </defs>
  );

  // 1. Symbol Only / Compact Mark
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 160 120"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className={`inline-block select-none ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgDefs />

        {/* Speedometer Arc and Ticks */}
        <path
          d="M 65 35 A 50 50 0 0 1 148 65"
          stroke="url(#rs-gold-arc)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#rs-shadow)"
        />
        {/* Speedometer Gauge Ticks */}
        <g stroke="#FDE047" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="88" y1="18" x2="88" y2="24" />
          <line x1="106" y1="21" x2="104" y2="27" />
          <line x1="123" y1="29" x2="119" y2="35" />
          <line x1="137" y1="41" x2="131" y2="46" />
          <line x1="147" y1="56" x2="140" y2="59" />
          <line x1="152" y1="73" x2="144" y2="73" />
        </g>
        {/* Needle Tick Mark */}
        <line x1="90" y1="12" x2="88" y2="24" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

        {/* Chrome "R" */}
        <g filter="url(#rs-shadow)">
          {/* Main R Body */}
          <path
            d="M 12 30 L 68 30 L 58 45 L 36 45 L 32 55 L 60 55 L 46 75 L 62 100 L 40 100 L 29 82 L 20 82 L 10 100 L -4 100 Z"
            transform="translate(8, 2)"
            fill="url(#rs-chrome-grad)"
            stroke="#94A3B8"
            strokeWidth="0.8"
          />
          {/* R Highlight inner facet */}
          <path
            d="M 16 33 L 64 33 L 56 42 L 35 42 L 30 52 L 57 52 L 48 68 L 30 68 L 22 80 L 14 80 Z"
            transform="translate(8, 2)"
            fill="url(#rs-chrome-highlight)"
            opacity="0.7"
          />
        </g>

        {/* Gold "S" */}
        <g filter="url(#rs-shadow)">
          {/* Main S Body */}
          <path
            d="M 68 34 L 126 34 L 116 52 L 78 52 L 72 62 L 118 62 L 108 98 L 48 98 L 58 80 L 96 80 L 100 72 L 56 72 Z"
            fill="url(#rs-gold-grad)"
            stroke="#FEF08A"
            strokeWidth="0.8"
          />
          {/* S Highlight */}
          <path
            d="M 72 37 L 122 37 L 114 49 L 80 49 L 76 59 L 114 59 L 105 94 L 54 94 L 62 83 L 94 83 L 97 69 L 59 69 Z"
            fill="#FEF08A"
            opacity="0.35"
          />
        </g>
      </svg>
    );
  }

  // 2. Horizontal Compact (Navbar / Small Header)
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <RSMotorsLogo variant="symbol" size={size} />
        <div className="flex flex-col">
          <div className="flex items-baseline leading-none">
            <span className="font-extrabold tracking-tighter text-base sm:text-lg italic bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent drop-shadow-xs">
              RS
            </span>
            <span className="font-bold tracking-tight text-base sm:text-lg italic bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent ml-0.5 drop-shadow-xs">
              motors
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[8px] font-semibold uppercase tracking-widest text-amber-400/90 whitespace-nowrap -mt-0.5">
              Soluções Veiculares
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Badge (Framed Icon / Avatar)
  if (variant === 'badge') {
    return (
      <div
        className={`relative rounded-xl bg-gradient-to-b from-slate-900 via-[#0B0F19] to-black border border-amber-500/30 shadow-md flex items-center justify-center p-1.5 overflow-hidden ${className}`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <RSMotorsLogo variant="symbol" size={size} />
      </div>
    );
  }

  // 4. Full Logo with Emblem, 'motors' & 'SOLUÇÕES VEICULARES'
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 120"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="w-full h-auto drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgDefs />

        {/* Speedometer Arc and Ticks */}
        <path
          d="M 125 32 A 68 68 0 0 1 245 70"
          stroke="url(#rs-gold-arc)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#rs-shadow)"
        />
        {/* Speedometer Gauge Ticks */}
        <g stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
          <line x1="155" y1="12" x2="155" y2="20" />
          <line x1="178" y1="16" x2="175" y2="24" />
          <line x1="200" y1="26" x2="195" y2="33" />
          <line x1="219" y1="41" x2="212" y2="47" />
          <line x1="233" y1="58" x2="224" y2="62" />
          <line x1="240" y1="78" x2="231" y2="79" />
        </g>
        {/* Gauge Needle / Speed Marker */}
        <line x1="158" y1="4" x2="155" y2="20" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />

        {/* Emblems Group */}
        <g transform="translate(30, 2)">
          {/* Chrome "R" */}
          <g filter="url(#rs-shadow)">
            <path
              d="M 10 24 L 74 24 L 62 42 L 38 42 L 33 53 L 64 53 L 48 74 L 66 100 L 40 100 L 28 80 L 19 80 L 8 100 L -8 100 Z"
              fill="url(#rs-chrome-grad)"
              stroke="#CBD5E1"
              strokeWidth="0.8"
            />
            {/* Highlight facet */}
            <path
              d="M 14 27 L 70 27 L 60 39 L 37 39 L 31 50 L 61 50 L 51 66 L 29 66 L 20 78 L 11 78 Z"
              fill="url(#rs-chrome-highlight)"
              opacity="0.6"
            />
          </g>

          {/* Gold "S" */}
          <g filter="url(#rs-shadow)">
            <path
              d="M 72 26 L 140 26 L 128 46 L 84 46 L 78 57 L 130 57 L 118 98 L 52 98 L 64 78 L 106 78 L 110 69 L 60 69 Z"
              fill="url(#rs-gold-grad)"
              stroke="#FEF08A"
              strokeWidth="0.8"
            />
            {/* S Highlight */}
            <path
              d="M 76 29 L 135 29 L 125 43 L 86 43 L 82 54 L 125 54 L 114 94 L 58 94 L 68 81 L 104 81 L 107 66 L 63 66 Z"
              fill="#FEF08A"
              opacity="0.3"
            />
          </g>
        </g>

        {/* "motors" in Racing Chrome Typography */}
        <g filter="url(#rs-shadow)">
          <text
            x="160"
            y="94"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="34"
            fontWeight="900"
            fontStyle="italic"
            letterSpacing="3"
            fill="url(#rs-chrome-grad)"
            stroke="#94A3B8"
            strokeWidth="0.6"
          >
            motors
          </text>
        </g>

        {/* Subtitle Section: "SOLUÇÕES VEICULARES" with golden accent flanking lines */}
        {showSubtitle && (
          <g transform="translate(0, 108)">
            {/* Left Gold Line */}
            <line x1="20" y1="3" x2="65" y2="3" stroke="url(#rs-gold-grad)" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Subtitle Text */}
            <text
              x="160"
              y="6"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="9.5"
              fontWeight="700"
              letterSpacing="5.5"
              fill="#F59E0B"
            >
              SOLUÇÕES VEICULARES
            </text>

            {/* Right Gold Line */}
            <line x1="255" y1="3" x2="300" y2="3" stroke="url(#rs-gold-grad)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
