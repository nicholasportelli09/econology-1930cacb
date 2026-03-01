const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  const s = size;
  const half = s / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="eco-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B2EFF" />
          <stop offset="100%" stopColor="#A66CFF" />
        </linearGradient>
      </defs>

      {/* Brain outline — left hemisphere */}
      <path
        d="M32 14c-2.5 0-4.8.8-6.6 2.2-1.5-1-3.3-1.6-5.2-1.6C15 14.6 11 18.6 11 23.8c0 2 .6 3.8 1.6 5.3-.6 1.2-1 2.6-1 4.1 0 3.8 2.2 7 5.4 8.5.4 3 2.8 5.3 5.8 5.8.8 2.2 2.8 3.8 5.2 4.1V32"
        stroke="url(#eco-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Brain outline — right hemisphere */}
      <path
        d="M32 14c2.5 0 4.8.8 6.6 2.2 1.5-1 3.3-1.6 5.2-1.6C49 14.6 53 18.6 53 23.8c0 2-.6 3.8-1.6 5.3.6 1.2 1 2.6 1 4.1 0 3.8-2.2 7-5.4 8.5-.4 3-2.8 5.3-5.8 5.8-.8 2.2-2.8 3.8-5.2 4.1V32"
        stroke="url(#eco-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Brain folds — left */}
      <path
        d="M22 24c3 1 6 1.5 10 1.5"
        stroke="url(#eco-grad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M18 33c4 .5 8 .8 14 .8"
        stroke="url(#eco-grad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />

      {/* Brain folds — right */}
      <path
        d="M42 24c-3 1-6 1.5-10 1.5"
        stroke="url(#eco-grad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M46 33c-4 .5-8 .8-14 .8"
        stroke="url(#eco-grad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />

      {/* Subtle dollar — vertical line */}
      <line
        x1="32"
        y1="22"
        x2="32"
        y2="42"
        stroke="url(#eco-grad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Subtle dollar — S curve */}
      <path
        d="M36 25c-1.5-.8-3.2-1-4.5-.4-2 .8-1.6 3 .5 3.6 2.2.6 3 2.2 1.2 3.4-1.2.8-3 .6-4.5-.2"
        stroke="url(#eco-grad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />
    </svg>
  );
};

export default EconologyLogo;
