export function PolygonIcon({ className }: { className?: string }) {
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
        d="M35 8L88 22L75 55L48 90L8 65L12 28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 28L35 8"
      />
    </svg>
  );
}