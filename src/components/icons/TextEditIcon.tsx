export function TextEditIcon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        // Note: No stroke properties here, fill is used for text.
        fill="currentColor"
        viewBox="0 0 96 96"
        className={className}
        aria-hidden="true"
      >
        <text
          x="6"
          y="78" // 'y' controls the baseline of the text
          fontSize="80"
          fontWeight="normal"
          fontFamily="sans-serif"
        >
          A
          {/* tspan lets us style parts of the text differently */}
          <tspan fontSize="60">a</tspan>
        </text>
      </svg>
    );
  }