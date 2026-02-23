import { Brain, DollarSign } from "lucide-react";

const EconologyLogo = ({ size = 64 }: { size?: number }) => {
  const iconSize = size * 0.4;

  return (
    <div
      className="relative rounded-full gradient-border flex items-center justify-center glow-shadow"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full gradient-bg opacity-10" />
      <div className="relative">
        <Brain size={iconSize} className="text-primary" strokeWidth={1.5} />
        <DollarSign
          size={iconSize * 0.5}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent"
          strokeWidth={2.5}
        />
      </div>
    </div>
  );
};

export default EconologyLogo;
