export function RoundedSquareIcon({ className }: { className?: string }) {
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
        d="M15 3h66a12 12 0 0112 12v66a12 12 0 01-12 12H15A12 12 0 013 81V15A12 12 0 0115 3z"
      />
    </svg>
  );
}