import React from "react";

interface WhatsAppOrganicIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  badgeClassName?: string;
  showShadow?: boolean;
}

/**
 * Ultra-smooth, high-definition organic WhatsApp badge icon.
 * Styled precisely after the top-right droplet/speech-bubble in the provided reference image.
 * All curves and vertices are mathematically filleted to prevent visual roughness or harsh edges.
 */
export function WhatsAppOrganicIcon({
  size = 56,
  className = "",
  badgeClassName = "",
  showShadow = true,
  ...props
}: WhatsAppOrganicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 overflow-visible transition-transform duration-200 ${className}`}
      {...props}
    >
      <defs>
        {/* Soft, premium WhatsApp green gradient */}
        <linearGradient
          id="waLuxeOrganicGrad"
          x1="22"
          y1="12"
          x2="88"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>

        {/* Ambient soft glow & shadow for floating elegance */}
        {showShadow && (
          <filter
            id="waOrganicAmbientShadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#064E3B" floodOpacity="0.28" />
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1.5"
              floodColor="#064E3B"
              floodOpacity="0.18"
            />
          </filter>
        )}
      </defs>

      {/* Outer Organic Droplet / Soft Speech Bubble (Top-Right Reference Style) */}
      <path
        d="M52 12
           C75 12 91 28 91 50
           C91 71 76 86 55 86
           C46 86 38 83.5 31 79
           C23 83 15 88 11.5 89
           C9.2 89.6 7.6 87.8 8.3 85.5
           C9.5 81.2 12 73.8 12.8 68.2
           C7.8 62.5 5 56.5 5 50
           C5 28 25 12 52 12 Z"
        fill="url(#waLuxeOrganicGrad)"
        filter={showShadow ? "url(#waOrganicAmbientShadow)" : undefined}
        className={badgeClassName}
      />

      {/* Subtle Inner Highlight Ring for a tactile, glossy luxury finish */}
      <path
        d="M52 14
           C73.8 14 89 29.2 89 50
           C89 69.8 74.8 84 55 84
           C46.3 84 38.6 81.6 31.8 77.3
           C24.2 81.1 16.6 85.8 13.2 86.8
           C14.4 82.6 16.8 75.6 17.5 70.3
           C12.8 64.9 10 59.2 10 50
           C10 29.2 29.2 14 52 14 Z"
        stroke="#FFFFFF"
        strokeOpacity="0.18"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Center White WhatsApp Emblem (Official Crisp Vector) */}
      <g transform="translate(26.8, 22.8) scale(2.1)">
        {/* Outer speech ring with tail */}
        <path
          fill="#FFFFFF"
          d="M12.04 2
             c-5.46 0-9.91 4.45-9.91 9.91
             0 1.75.46 3.45 1.32 4.95
             L2.05 22
             l5.25-1.38
             c1.45.79 3.08 1.21 4.74 1.21
             5.46 0 9.91-4.45 9.91-9.91
             0-2.65-1.03-5.14-2.9-7.01
             A9.816 9.816 0 0 0 12.04 2
             m.01 1.67
             c2.2 0 4.26.86 5.82 2.42
             a8.225 8.225 0 0 1 2.41 5.83
             c0 4.54-3.7 8.23-8.24 8.23
             -1.48 0-2.93-.39-4.19-1.15
             l-.3-.17
             -3.12.82
             .83-3.04
             -.2-.31
             a8.19 8.19 0 0 1-1.26-4.38
             c0-4.54 3.7-8.24 8.24-8.24
             M8.53 7.33
             c-.16 0-.43.06-.66.31
             -.22.25-.86.85-.86 2.07
             0 1.22.89 2.4 1.01 2.56
             .12.17 1.75 2.67 4.23 3.74
             .59.26 1.05.41 1.41.53
             .59.19 1.13.16 1.56.1
             .48-.07 1.47-.6 1.67-1.18
             .21-.58.21-1.07.15-1.18
             -.06-.1-.23-.16-.48-.29
             s-1.48-.73-1.71-.81
             c-.23-.09-.4-.13-.56.13
             -.17.26-.64.81-.79.97
             -.14.17-.29.19-.54.06
             -.25-.12-1.05-.39-2-1.23
             -.74-.66-1.23-1.47-1.38-1.72
             -.14-.25-.02-.38.11-.51
             .11-.11.25-.29.37-.43
             s.17-.25.25-.41
             c.08-.17.04-.31-.02-.44
             s-.56-1.36-.77-1.87
             c-.2-.49-.41-.42-.56-.43
             -.14-.01-.31-.01-.47-.01"
        />
      </g>
    </svg>
  );
}

/**
 * Pure Vector WhatsApp Emblem without badge (for embedding inside buttons or chips)
 * Features perfectly rounded stroke ends and corners
 */
export function WhatsAppEmblemIcon({
  size = 20,
  className = "text-white",
  ...props
}: {
  size?: number | string;
  className?: string;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29s-1.48-.73-1.71-.81c-.23-.09-.4-.13-.56.13-.17.26-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.44s-.56-1.36-.77-1.87c-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.47-.01" />
    </svg>
  );
}
