import React from 'react';

interface PlantIllustrationProps {
  level: number;
  className?: string;
  isWatering?: boolean;
<<<<<<< HEAD
=======
  isAnimating?: boolean;
>>>>>>> 1a4b379 (3)
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  level,
  className = 'w-36 h-36',
  isWatering = false,
<<<<<<< HEAD
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
=======
  isAnimating = false,
}) => {
  return (
    <div
      className={`plant-artwork relative flex items-center justify-center select-none ${
        isAnimating ? 'plant-artwork--continuous' : ''
      } ${className}`}
    >
>>>>>>> 1a4b379 (3)
      {/* Soft radial glow for higher tiers */}
      {level >= 5 && (
        <div
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-700 ${
            level === 7
              ? 'bg-amber-300/30 animate-pulse-glow'
              : level === 6
              ? 'bg-emerald-300/25'
              : 'bg-rose-200/25'
          }`}
        />
      )}

      {/* SVG Illustrations for 7 distinctive stages */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-500 hover:scale-105"
      >
        <defs>
          {/* Ceramic Pot Gradients */}
          <linearGradient id="potBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="potRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Plant Leaves Gradients */}
          <linearGradient id="leafGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="leafGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="goldenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
        </defs>

        {/* ================= STAGE SPECIFIC GRAPHICS ================= */}
        {level === 1 && (
          /* LEVEL 1: Hạt giống hy vọng (Chậu đất có hạt giống) */
          <g className="transition-all duration-500">
            {/* Gentle soil mound */}
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Golden seed */}
            <path
              d="M100 120 C106 126 109 135 100 142 C91 135 94 126 100 120 Z"
              fill="url(#goldenGlow)"
              stroke="#CA8A04"
              strokeWidth="1.5"
            />
            {/* Seed cleft */}
            <path d="M100 124 C100 132 101 138 98 140" stroke="#A16207" strokeWidth="1" strokeLinecap="round" />
            {/* Sparkle specks of hope */}
            <circle cx="86" cy="118" r="2" fill="#FDE047" className="animate-ping" opacity="0.8" />
            <circle cx="114" cy="114" r="1.5" fill="#FEF08A" />
            <circle cx="100" cy="110" r="1.8" fill="#FACC15" />
          </g>
        )}

        {level === 2 && (
          /* LEVEL 2: Mầm xanh (Cây vừa nhú 2 lá mầm) */
          <g className="transition-all duration-500">
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Tiny stem */}
            <path d="M100 142 Q100 120 100 108" stroke="#16A34A" strokeWidth="4.5" strokeLinecap="round" />
            {/* Left baby leaf */}
            <path
              d="M100 114 C88 112 80 100 84 94 C92 90 98 102 100 112"
              fill="url(#leafGradLight)"
              stroke="#15803D"
              strokeWidth="1.2"
            />
            {/* Right baby leaf */}
            <path
              d="M100 112 C112 110 120 98 116 92 C108 88 102 100 100 110"
              fill="url(#leafGradDark)"
              stroke="#15803D"
              strokeWidth="1.2"
            />
            {/* Dew drop */}
            <circle cx="88" cy="95" r="2" fill="#67E8F9" opacity="0.9" />
          </g>
        )}

        {level === 3 && (
          /* LEVEL 3: Chồi non (Cây nhỏ có lá non vươn cao) */
          <g className="transition-all duration-500">
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Slender growing stem */}
            <path d="M100 142 Q98 115 101 88" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
            {/* Lower left leaf */}
            <path
              d="M99 122 C84 122 75 110 79 104 C88 100 96 112 99 120"
              fill="url(#leafGradDark)"
              stroke="#166534"
              strokeWidth="1.2"
            />
            {/* Lower right leaf */}
            <path
              d="M100 116 C116 116 125 104 121 98 C112 94 104 106 100 114"
              fill="url(#leafGradLight)"
              stroke="#166534"
              strokeWidth="1.2"
            />
            {/* Top sprouting bud */}
            <path
              d="M101 88 C94 76 96 68 101 64 C106 68 108 76 101 88 Z"
              fill="url(#leafGradLight)"
              stroke="#15803D"
              strokeWidth="1.2"
            />
            {/* Sprout side leaf */}
            <path
              d="M101 86 C109 82 115 72 113 67 C107 66 102 75 101 84"
              fill="url(#leafGradDark)"
              stroke="#166534"
              strokeWidth="1"
            />
          </g>
        )}

        {level === 4 && (
          /* LEVEL 4: Cây trưởng thành (Cây xanh nhiều lá xum xuê) */
          <g className="transition-all duration-500">
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Strong trunk */}
            <path d="M96 142 L97 98 L103 98 L104 142 Z" fill="url(#trunkGrad)" />
            {/* Rich leafy foliage clusters */}
            <circle cx="82" cy="88" r="22" fill="url(#leafGradDark)" />
            <circle cx="118" cy="88" r="22" fill="url(#leafGradDark)" />
            <circle cx="100" cy="72" r="25" fill="url(#leafGradLight)" />
            <circle cx="78" cy="70" r="18" fill="url(#leafGradLight)" />
            <circle cx="122" cy="70" r="18" fill="url(#leafGradLight)" />
            <circle cx="100" cy="54" r="20" fill="url(#leafGradLight)" />
            {/* Leaf texture lines */}
            <path d="M100 50 C100 65 102 75 100 85" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>
        )}

        {level === 5 && (
          /* LEVEL 5: Cây nở hoa (Cây có hoa tươi rực rỡ) */
          <g className="transition-all duration-500">
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Trunk */}
            <path d="M95 142 L97 94 L103 94 L105 142 Z" fill="url(#trunkGrad)" />
            {/* Full foliage canopy */}
            <circle cx="78" cy="85" r="24" fill="url(#leafGradDark)" />
            <circle cx="122" cy="85" r="24" fill="url(#leafGradDark)" />
            <circle cx="100" cy="68" r="28" fill="url(#leafGradLight)" />
            <circle cx="75" cy="65" r="20" fill="url(#leafGradLight)" />
            <circle cx="125" cy="65" r="20" fill="url(#leafGradLight)" />
            <circle cx="100" cy="48" r="22" fill="url(#leafGradLight)" />

            {/* Blooming Flower 1 (Center) */}
            <g transform="translate(100, 60)">
              <circle cx="-6" cy="0" r="5" fill="#FDA4AF" />
              <circle cx="6" cy="0" r="5" fill="#FDA4AF" />
              <circle cx="0" cy="-6" r="5" fill="#FDA4AF" />
              <circle cx="0" cy="6" r="5" fill="#FDA4AF" />
              <circle cx="0" cy="0" r="4" fill="#FACC15" />
            </g>
            {/* Blooming Flower 2 (Left) */}
            <g transform="translate(75, 78)">
              <circle cx="-5" cy="0" r="4" fill="#F472B6" />
              <circle cx="5" cy="0" r="4" fill="#F472B6" />
              <circle cx="0" cy="-5" r="4" fill="#F472B6" />
              <circle cx="0" cy="5" r="4" fill="#F472B6" />
              <circle cx="0" cy="0" r="3" fill="#FDE047" />
            </g>
            {/* Blooming Flower 3 (Right) */}
            <g transform="translate(125, 74)">
              <circle cx="-5" cy="0" r="4" fill="#FB7185" />
              <circle cx="5" cy="0" r="4" fill="#FB7185" />
              <circle cx="0" cy="-5" r="4" fill="#FB7185" />
              <circle cx="0" cy="5" r="4" fill="#FB7185" />
              <circle cx="0" cy="0" r="3" fill="#FDE047" />
            </g>
            {/* Flower 4 (Top) */}
            <g transform="translate(100, 38)">
              <circle cx="-4" cy="0" r="3.5" fill="#F43F5E" />
              <circle cx="4" cy="0" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="-4" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="4" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
            </g>
          </g>
        )}

        {level === 6 && (
          /* LEVEL 6: Cây kết trái (Cây có quả trĩu cành) */
          <g className="transition-all duration-500">
            <ellipse cx="100" cy="140" rx="36" ry="12" fill="url(#soilGrad)" />
            {/* Sturdy trunk with branch */}
            <path d="M94 142 L97 90 L103 90 L106 142 Z" fill="url(#trunkGrad)" />
            <path d="M98 105 Q85 95 78 92" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <path d="M102 102 Q115 94 122 90" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            {/* Rich emerald canopy */}
            <circle cx="75" cy="82" r="26" fill="url(#leafGradDark)" />
            <circle cx="125" cy="82" r="26" fill="url(#leafGradDark)" />
            <circle cx="100" cy="65" r="30" fill="url(#leafGradLight)" />
            <circle cx="72" cy="60" r="22" fill="url(#leafGradLight)" />
            <circle cx="128" cy="60" r="22" fill="url(#leafGradLight)" />
            <circle cx="100" cy="44" r="24" fill="url(#leafGradLight)" />

            {/* Apple Fruit 1 (Left branch) */}
            <g transform="translate(74, 94)">
              <circle cx="0" cy="0" r="7.5" fill="#EF4444" />
              <circle cx="-2" cy="-2" r="2" fill="#FCA5A5" opacity="0.8" />
              <path d="M0 -7 Q2 -10 5 -9" stroke="#15803D" strokeWidth="1.5" />
            </g>
            {/* Apple Fruit 2 (Right branch) */}
            <g transform="translate(126, 92)">
              <circle cx="0" cy="0" r="7.5" fill="#EF4444" />
              <circle cx="-2" cy="-2" r="2" fill="#FCA5A5" opacity="0.8" />
              <path d="M0 -7 Q2 -10 5 -9" stroke="#15803D" strokeWidth="1.5" />
            </g>
            {/* Apple Fruit 3 (Center) */}
            <g transform="translate(98, 70)">
              <circle cx="0" cy="0" r="8" fill="#DC2626" />
              <circle cx="-2" cy="-2" r="2.2" fill="#FCA5A5" opacity="0.8" />
              <path d="M0 -7.5 Q2 -11 5 -10" stroke="#15803D" strokeWidth="1.5" />
            </g>
            {/* Golden Fruit 4 (Top crown) */}
            <g transform="translate(108, 45)">
              <circle cx="0" cy="0" r="7" fill="#F59E0B" />
              <circle cx="-2" cy="-2" r="2" fill="#FDE68A" opacity="0.8" />
              <path d="M0 -6.5 Q2 -9 5 -8" stroke="#15803D" strokeWidth="1.5" />
            </g>
          </g>
        )}

        {level === 7 && (
          /* LEVEL 7: Cây hạnh phúc (Cây đại thụ rực rỡ cả hoa, quả, hào quang) */
          <g className="transition-all duration-500">
            {/* Radiant halo aura */}
            <circle cx="100" cy="70" r="62" fill="url(#goldenGlow)" opacity="0.18" className="animate-pulse" />

            <ellipse cx="100" cy="140" rx="38" ry="12" fill="url(#soilGrad)" />
            {/* Powerful ancient wise trunk */}
            <path d="M92 142 Q96 100 97 86 L103 86 Q104 100 108 142 Z" fill="url(#trunkGrad)" />
            <path d="M97 100 Q80 90 68 84" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <path d="M103 98 Q120 88 132 82" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />

            {/* Super lush multilayered canopy */}
            <circle cx="68" cy="80" r="28" fill="url(#leafGradDark)" />
            <circle cx="132" cy="80" r="28" fill="url(#leafGradDark)" />
            <circle cx="100" cy="60" r="35" fill="url(#leafGradLight)" />
            <circle cx="65" cy="55" r="25" fill="url(#leafGradLight)" />
            <circle cx="135" cy="55" r="25" fill="url(#leafGradLight)" />
            <circle cx="100" cy="38" r="28" fill="url(#leafGradLight)" />

            {/* Glowing Golden fruits */}
            <g transform="translate(70, 92)">
              <circle cx="0" cy="0" r="7" fill="#F59E0B" />
              <circle cx="-2" cy="-2" r="2" fill="#FEF08A" />
            </g>
            <g transform="translate(130, 90)">
              <circle cx="0" cy="0" r="7" fill="#F59E0B" />
              <circle cx="-2" cy="-2" r="2" fill="#FEF08A" />
            </g>
            <g transform="translate(100, 62)">
              <circle cx="0" cy="0" r="7.5" fill="#EF4444" />
              <circle cx="-2" cy="-2" r="2" fill="#FCA5A5" />
            </g>

            {/* Radiant Flowers */}
            <g transform="translate(82, 58)">
              <circle cx="-4" cy="0" r="3.5" fill="#F43F5E" />
              <circle cx="4" cy="0" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="-4" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="4" r="3.5" fill="#F43F5E" />
              <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
            </g>
            <g transform="translate(118, 54)">
              <circle cx="-4" cy="0" r="3.5" fill="#EC4899" />
              <circle cx="4" cy="0" r="3.5" fill="#EC4899" />
              <circle cx="0" cy="-4" r="3.5" fill="#EC4899" />
              <circle cx="0" cy="4" r="3.5" fill="#EC4899" />
              <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
            </g>
            <g transform="translate(100, 32)">
              <circle cx="-4" cy="0" r="3.5" fill="#FB7185" />
              <circle cx="4" cy="0" r="3.5" fill="#FB7185" />
              <circle cx="0" cy="-4" r="3.5" fill="#FB7185" />
              <circle cx="0" cy="4" r="3.5" fill="#FB7185" />
              <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
            </g>

            {/* Fairy sparkles */}
            <path d="M52 40 L55 45 L60 46 L56 50 L57 55 L52 52 L47 55 L48 50 L44 46 L49 45 Z" fill="#FDE047" opacity="0.8" />
            <path d="M148 40 L151 45 L156 46 L152 50 L153 55 L148 52 L143 55 L144 50 L140 46 L145 45 Z" fill="#FDE047" opacity="0.8" />
          </g>
        )}

        {/* ================= TERRACOTTA POT (COMMON ANCHOR) ================= */}
        {/* Pot Rim */}
        <ellipse cx="100" cy="138" rx="42" ry="10" fill="url(#potRim)" stroke="#C2410C" strokeWidth="1.5" />
        {/* Inner soil depth */}
        <ellipse cx="100" cy="139" rx="38" ry="7" fill="url(#soilGrad)" />

        {/* Pot Tapered Body */}
        <path
          d="M62 142 L72 184 C73 189 77 192 82 192 L118 192 C123 192 127 189 128 184 L138 142 Z"
          fill="url(#potBody)"
          stroke="#9A3412"
          strokeWidth="1.5"
        />

        {/* Pot Cute Class Emblem / Heart Ribbon */}
        <path
          d="M93 162 C93 158 97 155 100 158 C103 155 107 158 107 162 C107 167 100 172 100 172 C100 172 93 167 93 162 Z"
          fill="#FFF"
          opacity="0.85"
        />
        <text
          x="100"
          y="182"
          fontSize="7"
          fontWeight="bold"
          fill="#FFF"
          textAnchor="middle"
          opacity="0.85"
          letterSpacing="0.5"
        >
          A11K65
        </text>

        {/* ================= WATERING EFFECT OVERLAY ================= */}
        {isWatering && (
          <g className="animate-bounce">
            {/* Water Drops */}
            <circle cx="94" cy="95" r="2.5" fill="#38BDF8" opacity="0.85" />
            <circle cx="106" cy="105" r="3" fill="#38BDF8" opacity="0.85" />
            <circle cx="100" cy="118" r="3.5" fill="#38BDF8" opacity="0.9" />
            <circle cx="90" cy="130" r="2" fill="#38BDF8" opacity="0.8" />
            <circle cx="112" cy="128" r="2.5" fill="#38BDF8" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
