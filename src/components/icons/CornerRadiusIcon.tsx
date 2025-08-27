export function CornerRadiusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 96 96"
      strokeWidth={6}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Sharp Corner */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 93 93 L 93 3 L 3 3"
      />
      {/* Medium Corner */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 73 93 L 73 43 Q 73 23 53 23 L 3 23"
      />
      {/* Rounded Corner */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 53 93 L 53 83 Q 53 43 13 43 L 3 43"
      />
    </svg>
  );
}