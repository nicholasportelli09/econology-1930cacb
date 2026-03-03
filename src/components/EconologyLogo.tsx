const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="eco-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a0066" />
          <stop offset="50%" stopColor="#7B3FE4" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Brain outline — left hemisphere */}
      <path
        d="M50 20
           C44 20 38 22 34 26
           C30 30 26 36 24 42
           C22 48 22 52 24 56
           C22 58 20 62 20 66
           C20 72 24 76 30 78
           C34 80 40 80 44 78
           C46 77 48 76 50 74"
        stroke="url(#eco-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Brain outline — right hemisphere */}
      <path
        d="M50 20
           C56 20 62 22 66 26
           C70 30 74 36 76 42
           C78 48 78 52 76 56
           C78 58 80 62 80 66
           C80 72 76 76 70 78
           C66 80 60 80 56 78
           C54 77 52 76 50 74"
        stroke="url(#eco-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Left brain folds */}
      <path d="M34 30 C38 34 42 36 48 34" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M26 46 C32 50 38 52 48 50" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M24 60 C30 64 38 66 48 64" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Right brain folds */}
      <path d="M66 30 C62 34 58 36 52 34" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M74 46 C68 50 62 52 52 50" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M76 60 C70 64 62 66 52 64" stroke="url(#eco-grad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Brain top bumps */}
      <path d="M36 22 C38 16 44 14 50 18" stroke="url(#eco-grad)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M64 22 C62 16 56 14 50 18" stroke="url(#eco-grad)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />

      {/* Dollar sign — vertical bar woven through brain */}
      <line x1="50" y1="12" x2="50" y2="88" stroke="url(#eco-grad)" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />

      {/* Dollar sign — S curve */}
      <path
        d="M58 32
           C56 28 52 26 50 27
           C46 28 44 32 48 35
           C52 38 56 40 56 44
           C56 48 52 50 50 50
           C48 50 44 48 42 44"
        stroke="url(#eco-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
};

export default EconologyLogo;
