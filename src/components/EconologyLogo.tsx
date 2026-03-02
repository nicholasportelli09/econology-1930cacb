const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="eco-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2E0EAD" />
          <stop offset="50%" stopColor="#7B3FE4" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Brain — left hemisphere outline */}
      <path
        d="M30 12
           C24 12 19 14 16 18
           C13 21 12 25 13 29
           C11 32 10 36 12 40
           C14 45 18 48 23 49
           C25 52 28 53 30 54
           L30 32"
        stroke="url(#eco-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Brain — right hemisphere outline */}
      <path
        d="M34 12
           C40 12 45 14 48 18
           C51 21 52 25 51 29
           C53 32 54 36 52 40
           C50 45 46 48 41 49
           C39 52 36 53 34 54
           L34 32"
        stroke="url(#eco-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Brain fold — left upper */}
      <path
        d="M18 24 C22 26 26 27 30 27"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Brain fold — left lower */}
      <path
        d="M15 35 C20 37 25 38 30 38"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Brain fold — right upper */}
      <path
        d="M46 24 C42 26 38 27 34 27"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Brain fold — right lower */}
      <path
        d="M49 35 C44 37 39 38 34 38"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Dollar sign — vertical bar */}
      <line
        x1="32" y1="18" x2="32" y2="50"
        stroke="url(#eco-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Dollar sign — S curve */}
      <path
        d="M38 23
           C36 21 33 20 31 21
           C28 22 28 25 31 27
           C34 29 36 31 35 34
           C34 37 31 38 28 37"
        stroke="url(#eco-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default EconologyLogo;
