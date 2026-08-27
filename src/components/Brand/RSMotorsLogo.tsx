import React, { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

  // Height and dimensions configuration
  const sizeConfig = {
    sm: {
      symbol: { width: 44, height: 34 },
      horizontal: { height: 'h-9' },
      full: { height: 'h-14 xs:h-16', width: 'w-full max-w-[200px]' },
      badge: { width: 48, height: 48 },
    },
    md: {
      symbol: { width: 64, height: 50 },
      horizontal: { height: 'h-12' },
      full: { height: 'h-24 sm:h-28', width: 'w-full max-w-[290px]' },
      badge: { width: 68, height: 68 },
    },
    lg: {
      symbol: { width: 88, height: 70 },
      horizontal: { height: 'h-16' },
      full: { height: 'h-32 sm:h-40', width: 'w-full max-w-[420px]' },
      badge: { width: 92, height: 92 },
    },
    xl: {
      symbol: { width: 120, height: 96 },
      horizontal: { height: 'h-24' },
      full: { height: 'h-44 sm:h-56', width: 'w-full max-w-[540px]' },
      badge: { width: 120, height: 120 },
    },
  }[size];

  // Gradients, filters and clip paths for precision automotive chrome & gold SVG fallback
  const SvgDefs = () => (
    <defs>
      {/* 3D Titanium & Platinum Chrome Gradient */}
      <linearGradient id="rs-chrome-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="20%" stopColor="#E2E8F0" />
        <stop offset="45%" stopColor="#94A3B8" />
        <stop offset="55%" stopColor="#475569" />
        <stop offset="80%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* Chrome Surface Mirror Highlight */}
      <linearGradient id="rs-chrome-mirror" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#E2E8F0" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#64748B" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
      </linearGradient>

      {/* High-End Racing Gold & Amber Gradient */}
      <linearGradient id="rs-gold-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="15%" stopColor="#FDE047" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="90%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>

      {/* Speedometer Tachometer Gold Arc */}
      <linearGradient id="rs-speed-arc" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D97706" stopOpacity="0.1" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="75%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F87171" />
      </linearGradient>

      {/* Dynamic Redline Apex */}
      <linearGradient id="rs-redline-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="50%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>

      {/* Crisp 3D Bevel Shadow */}
      <filter id="rs-depth-shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.85" />
      </filter>
    </defs>
  );

  // 1. Symbol Only / Compact Emblem (SVG)
  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 170 120"
        width={sizeConfig.symbol.width}
        height={sizeConfig.symbol.height}
        className={`inline-block select-none ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SvgDefs />

        {/* Dynamic Velocity Speedometer Arc */}
        <path
          d="M 68 34 A 52 52 0 0 1 154 68"
          stroke="url(#rs-speed-arc)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#rs-depth-shadow)"
        />

        {/* Tachometer Tick Marks */}
        <g stroke="#FDE047" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
          <line x1="92" y1="16" x2="92" y2="23" />
          <line x1="112" y1="20" x2="109" y2="27" />
          <line x1="130" y1="29" x2="125" y2="35" />
          <line x1="145" y1="42" x2="139" y2="47" />
          <line x1="154" y1="58" x2="147" y2="62" />
        </g>
        
        {/* Redline Accent Tick */}
        <line x1="157" y1="74" x2="149" y2="74" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        
        {/* Speed Needle Pointer */}
        <polygon points="94,10 97,24 91,24" fill="url(#rs-redline-grad)" filter="url(#rs-depth-shadow)" />

        {/* Chrome "R" */}
        <g filter="url(#rs-depth-shadow)">
          <path
            d="M 14 28 L 72 28 L 62 46 L 40 46 L 36 56 L 64 56 L 50 76 L 66 102 L 44 102 L 32 82 L 23 82 L 13 102 L -2 102 Z"
            fill="url(#rs-chrome-base)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          <path
            d="M 18 31 L 68 31 L 59 42 L 39 42 L 34 53 L 61 53 L 53 69 L 33 69 L 24 81 L 16 81 Z"
            fill="url(#rs-chrome-mirror)"
            opacity="0.65"
          />
        </g>

        {/* Gold "S" with Aerodynamic Slash */}
        <g filter="url(#rs-depth-shadow)">
          <path
            d="M 70 32 L 132 32 L 121 52 L 82 52 L 76 62 L 124 62 L 112 100 L 52 100 L 63 80 L 102 80 L 106 72 L 60 72 Z"
            fill="url(#rs-gold-base)"
            stroke="#FEF08A"
            strokeWidth="0.8"
          />
          <path
            d="M 74 35 L 128 35 L 118 48 L 84 48 L 80 58 L 120 58 L 109 96 L 57 96 L 67 83 L 100 83 L 103 69 L 63 69 Z"
            fill="#FFFBEB"
            opacity="0.32"
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
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline leading-none">
            <span className="font-black tracking-tight text-lg sm:text-xl italic bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm font-sans">
              RS
            </span>
            <span className="font-extrabold tracking-tight text-lg sm:text-xl italic bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent ml-1 drop-shadow-sm font-sans">
              motors
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="h-[1px] w-2 bg-gradient-to-r from-amber-500/80 to-transparent" />
              <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-amber-400/90 whitespace-nowrap">
                Soluções Veiculares
              </span>
              <div className="h-[1px] w-2 bg-gradient-to-l from-amber-500/80 to-transparent" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Badge (Framed Icon / Avatar)
  if (variant === 'badge') {
    return (
      <div
        className={`relative rounded-2xl bg-gradient-to-b from-slate-900 via-[#0B0F19] to-black border border-amber-500/40 shadow-lg shadow-amber-950/20 flex items-center justify-center p-2 overflow-hidden ${className}`}
        style={{ width: sizeConfig.badge.width, height: sizeConfig.badge.height }}
      >
        <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        <RSMotorsLogo variant="symbol" size={size} />
      </div>
    );
  }

  // 4. Full Official Logo (Renders the Official Uploaded Image with Vector Fallback)
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {!imageError ? (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-xl group ${sizeConfig.full.width}`}>
          <img
            src="/rsmotors_logo.jpg"
            alt="RSmotors - Soluções Veiculares"
            className={`w-full ${sizeConfig.full.height} object-contain rounded-lg drop-shadow-md hover:scale-[1.02] transition duration-300`}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Vector SVG Fallback with Identical Proportions & Elements */
        <svg
          viewBox="0 0 340 125"
          className={`w-full ${sizeConfig.full.height} drop-shadow-lg`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <SvgDefs />

          {/* Speedometer Tachometer Background Arc */}
          <path
            d="M 132 30 A 74 74 0 0 1 262 72"
            stroke="url(#rs-speed-arc)"
            strokeWidth="6.5"
            strokeLinecap="round"
            filter="url(#rs-depth-shadow)"
          />

          {/* Precision Speedometer Gauge Ticks */}
          <g stroke="#FDE047" strokeWidth="2.4" strokeLinecap="round" opacity="0.95">
            <line x1="165" y1="10" x2="165" y2="18" />
            <line x1="190" y1="14" x2="186" y2="22" />
            <line x1="214" y1="24" x2="208" y2="32" />
            <line x1="235" y1="40" x2="227" y2="47" />
            <line x1="250" y1="59" x2="240" y2="64" />
          </g>
          
          {/* Redline Gauge Tick */}
          <line x1="257" y1="80" x2="247" y2="81" stroke="#EF4444" strokeWidth="3.2" strokeLinecap="round" />

          {/* Needle Tick / Speed Apex Marker */}
          <polygon points="168,2 172,17 164,17" fill="url(#rs-redline-grad)" filter="url(#rs-depth-shadow)" />

          {/* Emblems Center Group (RS Monogram) */}
          <g transform="translate(36, 2)">
            {/* Chrome "R" Body */}
            <g filter="url(#rs-depth-shadow)">
              <path
                d="M 12 22 L 78 22 L 66 42 L 40 42 L 35 54 L 68 54 L 52 75 L 70 102 L 44 102 L 31 80 L 21 80 L 9 102 L -8 102 Z"
                fill="url(#rs-chrome-base)"
                stroke="#E2E8F0"
                strokeWidth="0.9"
              />
              <path
                d="M 16 25 L 74 25 L 63 38 L 39 38 L 33 50 L 65 50 L 54 68 L 31 68 L 22 80 L 12 80 Z"
                fill="url(#rs-chrome-mirror)"
                opacity="0.6"
              />
            </g>

            {/* Gold "S" Body */}
            <g filter="url(#rs-depth-shadow)">
              <path
                d="M 76 24 L 146 24 L 133 46 L 88 46 L 82 58 L 136 58 L 123 100 L 54 100 L 67 78 L 112 78 L 116 68 L 64 68 Z"
                fill="url(#rs-gold-base)"
                stroke="#FEF08A"
                strokeWidth="0.9"
              />
              <path
                d="M 80 27 L 141 27 L 130 42 L 90 42 L 86 54 L 131 54 L 119 95 L 61 95 L 71 82 L 109 82 L 112 65 L 67 65 Z"
                fill="#FFFBEB"
                opacity="0.32"
              />
            </g>
          </g>

          {/* "motors" Typography in Platinum Chrome / Racing Italic */}
          <g filter="url(#rs-depth-shadow)">
            <text
              x="170"
              y="96"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="35"
              fontWeight="900"
              fontStyle="italic"
              letterSpacing="3.5"
              fill="url(#rs-chrome-base)"
              stroke="#94A3B8"
              strokeWidth="0.6"
            >
              motors
            </text>
          </g>

          {/* Subtitle Section: "SOLUÇÕES VEICULARES" */}
          {showSubtitle && (
            <g transform="translate(0, 111)">
              <path
                d="M 18 3 L 64 3 M 58 6 L 64 3 L 58 0"
                stroke="url(#rs-gold-base)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              <text
                x="170"
                y="6.5"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="10"
                fontWeight="800"
                letterSpacing="6"
                fill="#F59E0B"
              >
                SOLUÇÕES VEICULARES
              </text>

              <path
                d="M 276 3 L 322 3 M 282 0 L 276 3 L 282 6"
                stroke="url(#rs-gold-base)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
