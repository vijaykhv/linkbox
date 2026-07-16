interface LogoProps {
  size?: number;
  className?: string;
}

// The "Bookmark Fold" brand mark — kept in sync with public/favicon.svg.
export default function Logo({ size = 36, className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <g transform="translate(7,7) rotate(-8 60 60)">
        <path d="M46,8 Q38,8 38,16 L38,86 L60,68 L82,86 L82,16 Q82,8 74,8 Z" fill="#16120c" />
      </g>
      <g transform="rotate(-8 60 60)">
        <path
          d="M46,8 Q38,8 38,16 L38,86 L60,68 L82,86 L82,16 Q82,8 74,8 Z"
          fill="#8b5cf6"
          stroke="#16120c"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M90,8 Q94,18 104,22 Q94,26 90,36 Q86,26 76,22 Q86,18 90,8 Z"
        fill="#fcd34d"
        stroke="#16120c"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
