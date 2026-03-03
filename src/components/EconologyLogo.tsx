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

      {/* Brain — left hemisphere */}
      <path
        d="M30 14
           C26 14 22 15 19 18
           C16 21 14 25 14 29
           C14 29 12 32 12 35
           C12 39 14 42 17 44
           C19 46 22 48 25 49
           C27 50 29 51 30 52
           L30 33"
        stroke="url(#eco-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Brain — right hemisphere */}
      <path
        d="M34 14
           C38 14 42 15 45 18
           C48 21 50 25 50 29
           C50 29 52 32 52 35
           C52 39 50 42 47 44
           C45 46 42 48 39 49
           C37 50 35 51 34 52
           L34 33"
        stroke="url(#eco-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Brain stem / corpus callosum */}
      <path
        d="M30 33 Q32 30 34 33"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left brain folds — sulci */}
      <path d="M17 22 C20 23 24 24 28 23" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M14 30 C18 32 23 33 28 32" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M15 38 C19 40 23 41 28 40" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Right brain folds — sulci */}
      <path d="M47 22 C44 23 40 24 36 23" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M50 30 C46 32 41 33 36 32" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M49 38 C45 40 41 41 36 40" stroke="url(#eco-grad)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Brain top bumps — gyri */}
      <path
        d="M22 14 C24 11 28 10 30 12"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M34 12 C36 10 40 11 42 14"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Small dollar sign in center */}
      <line
        x1="32" y1="24" x2="32" y2="44"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M36 28
           C35 26 33 25.5 32 26
           C30 27 30 29 32 30
           C34 31 34.5 33 33 34.5
           C32 35.5 30 35 29 34"
        stroke="url(#eco-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
};

export default EconologyLogo;
