const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  const s = size;
  const half = s / 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(270 70% 55%)" />
          <stop offset="50%" stopColor="hsl(220 70% 50%)" />
          <stop offset="100%" stopColor="hsl(155 60% 45%)" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle
        cx={half}
        cy={half}
        r={half - 2}
        stroke="url(#logo-grad)"
        strokeWidth={2}
        fill="none"
      />
      {/* Inner filled circle */}
      <circle
        cx={half}
        cy={half}
        r={half - 6}
        fill="url(#logo-grad)"
        opacity={0.12}
      />
      {/* "E" letter as monogram */}
      <text
        x={half}
        y={half}
        textAnchor="middle"
        dominantBaseline="central"
        fill="url(#logo-grad)"
        fontSize={s * 0.45}
        fontWeight={700}
        fontFamily="'Space Grotesk', sans-serif"
      >
        E
      </text>
    </svg>
  );
};

export default EconologyLogo;
