// Inline SVG logo — no image file needed, always crisp on dark backgrounds
export default function Logo({ width = 148, height = 36 }: { width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 148 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ResumeIQ"
    >
      {/* ── Pixel-tile staircase arrow icon ── */}
      {/* Row 3 (top) */}
      <rect x="14" y="2"  width="7" height="7" rx="1.5" fill="#00bcd4" />
      <rect x="22" y="2"  width="7" height="7" rx="1.5" fill="#00acc1" />
      {/* Row 2 */}
      <rect x="6"  y="10" width="7" height="7" rx="1.5" fill="#0097a7" />
      <rect x="14" y="10" width="7" height="7" rx="1.5" fill="#0288d1" />
      {/* Row 1 (bottom) */}
      <rect x="2"  y="18" width="7" height="7" rx="1.5" fill="#1565c0" />
      <rect x="10" y="18" width="7" height="7" rx="1.5" fill="#1a237e" />
      {/* Scattered accent pixels */}
      <rect x="22" y="10" width="4" height="4" rx="1" fill="#00bcd4" opacity="0.5" />
      <rect x="2"  y="10" width="3" height="3" rx="0.8" fill="#0288d1" opacity="0.35" />
      <rect x="18" y="18" width="3" height="3" rx="0.8" fill="#00acc1" opacity="0.4" />

      {/* ── Wordmark ── */}
      {/* "Resume" — light silver */}
      <text
        x="32" y="25"
        fontFamily="'Space Grotesk', 'Inter', sans-serif"
        fontSize="18"
        fontWeight="300"
        letterSpacing="-0.3"
        fill="#d0cfe8"
      >Resume</text>
      {/* "IQ" — teal bold */}
      <text
        x="103" y="25"
        fontFamily="'Space Grotesk', 'Inter', sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#00bcd4"
      >IQ</text>
    </svg>
  );
}
