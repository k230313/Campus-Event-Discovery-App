// ============================================
// File:    Logo.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Logo frontend component.
// ============================================

/**
 * Renders the Logo component for the application interface.
 * @param {object} props - Component props.
 * @returns {JSX.Element} Renders the component output.
 */
export function Logo({
  className = "h-10 w-auto",
  "aria-hidden": ariaHidden,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaHidden ? undefined : "img"}
      aria-label={ariaHidden ? undefined : "CEDA Campus Events"}
      aria-hidden={ariaHidden}
      focusable="false"
    >
      {/* Background Circle for C */}
      <circle cx="30" cy="30" r="24" fill="#EF9B28" opacity="0.2" />

      {/* Letter C */}
      <path
        d="M30 10C18.954 10 10 18.954 10 30C10 41.046 18.954 50 30 50C35.523 50 40.609 47.652 44.142 43.858"
        stroke="#1B2E55"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Letter E */}
      <path
        d="M55 15H75M55 30H72M55 45H75M55 15V45"
        stroke="#1B2E55"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter D */}
      <path
        d="M85 15H95C103.284 15 110 21.716 110 30C110 38.284 103.284 45 95 45H85V15Z"
        stroke="#1B2E55"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter A */}
      <path
        d="M120 45L130 15L140 45M123 35H137"
        stroke="#EF9B28"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative dot */}
      <circle cx="145" cy="42" r="3" fill="#EF9B28" />

      {/* Subtitle "Campus Events" */}
      <text
        x="150"
        y="25"
        fill="#1B2E55"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Campus
      </text>
      <text
        x="150"
        y="38"
        fill="#EF9B28"
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Events
      </text>
    </svg>
  );
}
