import { memo } from "react";
import logoSrc from "@/assets/econology-logo.png";

interface EconologyLogoProps {
  size?: number;
  responsive?: boolean;
}

const EconologyLogo = memo(({ size = 64, responsive = false }: EconologyLogoProps) => {
  return (
    <img
      src={logoSrc}
      alt="Econology logo"
      width={responsive ? undefined : size}
      height={responsive ? undefined : size}
      className={
        responsive
          ? "shrink-0 object-contain w-8 h-8 md:w-10 md:h-10"
          : "shrink-0 object-contain"
      }
      style={responsive ? undefined : { width: size, height: size }}
      loading="eager"
    />
  );
});

EconologyLogo.displayName = "EconologyLogo";

export default EconologyLogo;
