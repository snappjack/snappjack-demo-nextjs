export function TextBoxIcon({ className }: { className?: string }) {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 12"
        d="M3 3h90v90H3V3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M30 30h36M48 30v36"
      />
    </svg>
  );
}