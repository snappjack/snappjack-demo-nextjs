export function PaintBucketIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M76.912 74.928 l7.072 -7.072 l7.068 7.072 a10 10 0 1 1 -14.14 0z" />
      <path d="M35.512 4.32 l45.256 45.252 a4 4 0 0 1 0 5.66 l-33.94 33.94 a4 4 0 0 1 -5.656 0 l-33.94 -33.94 a4 4 0 0 1 0 -5.66 l31.112 -31.112 l-8.488 -8.484 L35.52 4.32z" />
      {/* <path d="M44 24.12 L15.716 52.4 H72.28 L44 24.12z"/> */}
    </svg>
  );
}